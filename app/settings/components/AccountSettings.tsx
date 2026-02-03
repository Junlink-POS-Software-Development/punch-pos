"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Mail, AlertTriangle } from "lucide-react";

const AccountSettings = () => {
  const { user, signOut } = useAuthStore();

  /* State for enrollment ID */
  const [enrollmentId, setEnrollmentId] = React.useState("");
  const [isLoadingEnrollment, setIsLoadingEnrollment] = React.useState(true);
  const [isSavingEnrollment, setIsSavingEnrollment] = React.useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = React.useState("");

  /* State for Joining Store */
  const [joinId, setJoinId] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [joinMessage, setJoinMessage] = React.useState("");

  React.useEffect(() => {
    const fetchEnrollmentId = async () => {
      try {
        const { getStoreEnrollmentId } = await import("@/app/actions/store");
        const result = await getStoreEnrollmentId();
        if (result.success && result.enrollmentId) {
          setEnrollmentId(result.enrollmentId);
        }
      } catch (error) {
        console.error("Failed to fetch enrollment ID", error);
      } finally {
        setIsLoadingEnrollment(false);
      }
    };

    if (user) {
      fetchEnrollmentId();
    }
  }, [user]);

  const handleUpdateEnrollment = async () => {
    setIsSavingEnrollment(true);
    setEnrollmentMessage("");
    try {
      const { updateStoreEnrollmentId } = await import("@/app/actions/store");
      const result = await updateStoreEnrollmentId(enrollmentId);
      if (result.success) {
        setEnrollmentMessage("Enrollment ID updated successfully.");
      } else {
        setEnrollmentMessage("Failed to update: " + result.error);
      }
    } catch (error) {
      setEnrollmentMessage("An error occurred.");
    } finally {
      setIsSavingEnrollment(false);
    }
  };

  const handleJoinStore = async () => {
    if (!joinId.trim()) return;
    setIsJoining(true);
    setJoinMessage("");
    try {
      const { joinStoreViaEnrollmentId } = await import("@/app/actions/store");
      const result = await joinStoreViaEnrollmentId(joinId);
      if (result.success) {
        setJoinMessage("Successfully joined store! Refreshing...");
        window.location.reload();
      } else {
        setJoinMessage("Failed to join: " + result.error);
      }
    } catch (error) {
      setJoinMessage("An error occurred.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header Section - Matches SubscriptionSettings Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-slate-800 border-b">
        <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">Account</h2>
          <p className="text-slate-400 text-sm">
            Manage your account and session
          </p>
        </div>
      </div>

      {/* Content Card - Matches the 'Status Card' style in SubscriptionSettings */}
      <div className="bg-slate-800/50 p-6 border border-slate-700 rounded-xl">
        <div className="flex md:flex-row flex-col justify-between md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 border border-slate-800 rounded-full text-cyan-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm uppercase tracking-wider">
                Email Address
              </p>
              <p className="font-semibold text-white text-lg">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-6 py-3 border border-red-500/20 rounded-lg font-medium text-red-500 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Store Enrollment Section */}
      <div className="bg-slate-800/50 p-6 border border-slate-700 rounded-xl">
         <div className="flex flex-col gap-4">
            <div>
               <h3 className="font-semibold text-white text-lg">Store Enrollment</h3>
               <p className="text-slate-400 text-sm">
                 Set an enrollment ID for your store so admins can adopt it.
               </p>
            </div>

            <div className="flex md:flex-row flex-col gap-4">
              <div className="flex-1">
                 <input
                    type="text"
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="Enter Enrollment ID"
                    className="bg-slate-950 border-slate-700 p-3 border rounded-lg w-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                 />
              </div>
              <button
                onClick={handleUpdateEnrollment}
                disabled={isSavingEnrollment || isLoadingEnrollment}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-6 py-3 rounded-lg font-medium text-white transition-colors"
              >
                {isSavingEnrollment ? "Saving..." : "Save ID"}
              </button>
            </div>
            {enrollmentMessage && (
              <p className={`text-sm ${enrollmentMessage.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {enrollmentMessage}
              </p>
            )}
         </div>
      </div>

      {/* Join Existing Store Section */}
      <div className="bg-slate-800/50 p-6 border border-slate-700 rounded-xl">
         <div className="flex flex-col gap-4">
            <div>
               <h3 className="font-semibold text-white text-lg">Join Existing Store</h3>
               <p className="text-slate-400 text-sm">
                 Enter an enrollment ID to join a company or another store.
               </p>
            </div>

            <div className="flex items-start gap-3 bg-red-500/10 p-4 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0" />
              <p>
                <span className="font-bold">Warning:</span> Joining a new store will move your account. If you are the only member of your current store, <span className="font-bold underline">all existing data for that store will be permanently deleted</span>.
              </p>
            </div>

            <div className="flex md:flex-row flex-col gap-4">
              <div className="flex-1">
                 <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Existing Store Enrollment ID"
                    className="bg-slate-950 border-slate-700 p-3 border rounded-lg w-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                 />
              </div>
              <button
                onClick={handleJoinStore}
                disabled={isJoining || !joinId.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-6 py-3 rounded-lg font-medium text-white transition-colors"
              >
                {isJoining ? "Joining..." : "Join Store"}
              </button>
            </div>
            {joinMessage && (
              <p className={`text-sm ${joinMessage.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {joinMessage}
              </p>
            )}
         </div>
      </div>
    </div>
  );
};

export default AccountSettings;
