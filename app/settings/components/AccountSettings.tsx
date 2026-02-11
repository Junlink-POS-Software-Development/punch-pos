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
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security, session, and store enrollment.
        </p>
      </div>

      {/* Content Card - Profile/Email */}
      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-full text-primary shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                Active Email Address
              </p>
              <p className="font-semibold text-foreground text-lg">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex justify-center items-center gap-2 bg-destructive/10 hover:bg-destructive/20 px-6 py-3 border border-destructive/20 rounded-xl font-bold text-destructive active:scale-[0.98] transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Store Enrollment Section */}
      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
         <div className="flex flex-col gap-6">
            <div>
               <h3 className="text-lg font-semibold text-foreground">Store Enrollment</h3>
               <p className="text-muted-foreground text-sm mt-1">
                 Set an enrollment ID for your store so other administrators can adopt it.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                 <input
                    type="text"
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="Enter Enrollment ID"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                 />
              </div>
              <button
                onClick={handleUpdateEnrollment}
                disabled={isSavingEnrollment || isLoadingEnrollment}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {isSavingEnrollment ? "Saving..." : "Update Enrollment ID"}
              </button>
            </div>
            {enrollmentMessage && (
              <p className={`text-sm ml-1 font-medium ${enrollmentMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                {enrollmentMessage}
              </p>
            )}
         </div>
      </div>

      {/* Join Existing Store Section */}
      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
         <div className="flex flex-col gap-6">
            <div>
               <h3 className="text-lg font-semibold text-foreground">Join Existing Store</h3>
               <p className="text-muted-foreground text-sm mt-1">
                 Enter a valid enrollment ID to join a company or another existing store.
               </p>
            </div>

            <div className="flex items-start gap-4 bg-destructive/10 p-5 border border-destructive/20 rounded-xl text-destructive text-sm leading-relaxed">
              <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0" />
              <p>
                <span className="font-bold">CAUTION:</span> Joining a new store will transfer your account access. If you are the sole member of your current store, <span className="font-bold underline">all store data will be permanently purged</span> upon joining a new one.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                 <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Existing Store Enrollment ID"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                 />
              </div>
              <button
                onClick={handleJoinStore}
                disabled={isJoining || !joinId.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                {isJoining ? "Joining..." : "Join Store"}
              </button>
            </div>
            {joinMessage && (
              <p className={`text-sm ml-1 font-medium ${joinMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                {joinMessage}
              </p>
            )}
         </div>
      </div>
    </div>
  );
};

export default AccountSettings;
