"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function StoreEnrollmentSection() {
  const { user } = useAuthStore();
  const [enrollmentId, setEnrollmentId] = React.useState("");
  const [isLoadingEnrollment, setIsLoadingEnrollment] = React.useState(true);
  const [isSavingEnrollment, setIsSavingEnrollment] = React.useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = React.useState("");

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

  if (!user) return null;

  return (
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
  );
}
