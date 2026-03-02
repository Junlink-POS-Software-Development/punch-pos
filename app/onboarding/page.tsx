"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { OnboardingForm } from "./components/OnboardingForm";
import { WelcomeModal } from "./components/WelcomeModal";

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [defaultValues, setDefaultValues] = useState<{
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    storeName?: string;
  }>({});

  // Welcome modal state
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState({
    userName: "",
    storeName: "",
    storeLogo: null as string | null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, store_id, metadata")
          .eq("user_id", user.id)
          .single();

        if (userData) {
          const defaults: typeof defaultValues = {
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            jobTitle: (userData.metadata as any)?.job_title || "",
          };

          if (userData.store_id) {
            setHasStore(true);

            // Fetch existing store info to pre-fill
            const { data: storeData } = await supabase
              .from("stores")
              .select("store_name, store_img")
              .eq("store_id", userData.store_id)
              .single();

            if (storeData) {
              // Don't pre-fill the default "My New Store" name
              defaults.storeName =
                storeData.store_name === "My New Store"
                  ? ""
                  : storeData.store_name || "";
            }
          }

          setDefaultValues(defaults);
        } else {
          const meta = user.user_metadata;
          if (meta) {
            const fullName = meta.full_name || meta.name || "";
            const parts = fullName.split(" ");
            setDefaultValues({
              firstName: parts[0] || "",
              lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
            });
          }
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSuccess = (data: {
    userName: string;
    storeName: string;
    storeLogo: string | null;
  }) => {
    if (hasStore) {
      // Store owner — show welcome modal
      setWelcomeData(data);
      setShowWelcome(true);
    } else {
      // Staff joining — just redirect
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      {showWelcome && (
        <WelcomeModal
          userName={welcomeData.userName}
          storeName={welcomeData.storeName}
          storeLogo={welcomeData.storeLogo}
          onClose={() => (window.location.href = "/")}
        />
      )}

      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-md">
        <h2 className="mb-2 font-bold text-3xl text-center">
          {hasStore ? "Set Up Your Store 🏪" : "Welcome! 👋"}
        </h2>
        <p className="mb-8 text-muted-foreground text-center">
          {hasStore
            ? "Complete your profile and customize your store."
            : "To complete your setup, please enter your details and Company Code."}
        </p>

        <OnboardingForm
          hasStore={hasStore}
          defaultValues={defaultValues}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
