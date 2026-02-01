import { createClient } from "@/utils/supabase/server";
import { fetchSummaryStats } from "./lib/repository";
import Spreadsheet from "@/app/playground/components/Spreadsheet";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function PlaygroundPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch store_id first
  const { data: userData } = await supabase
    .from('users')
    .select('store_id')
    .eq('user_id', user.id)
    .single();

  if (!userData?.store_id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          Store information not found. Please contact support.
        </div>
      </div>
    );
  }

  // Fetch summary stats server-side
  let initialStats;
  try {
    initialStats = await fetchSummaryStats(userData.store_id);
  } catch (err) {
    console.error("Failed to load playground stats:", err);
    // Continue with basic defaults or empty
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#0B1120]">
      {/* 64px is approx header height if layout has one, adjust as needed */}
      <Suspense fallback={<div className="p-10 text-slate-400">Loading Playground...</div>}>
         <Spreadsheet 
           storeId={userData.store_id} 
           initialStats={initialStats} 
          />
      </Suspense>
    </div>
  );
}
