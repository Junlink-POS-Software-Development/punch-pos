"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hash, Loader2, AlertTriangle, ArrowRight, User } from "lucide-react";
import { linkUserToStore } from "@/app/actions/onboarding";
import { updateProfile } from "@/app/actions/profile";
import { createClient } from "@/utils/supabase/client";

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  enrollmentId: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError: setFormError,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch public.users
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, store_id, metadata")
          .eq("user_id", user.id)
          .single();

        if (userData) {
          setValue("firstName", userData.first_name || "");
          setValue("lastName", userData.last_name || "");
          setValue("jobTitle", (userData.metadata as any)?.job_title || "");
          if (userData.store_id) {
            setHasStore(true);
          }
        } else {
          // Try to get from auth metadata
          const meta = user.user_metadata;
          if (meta) {
            // Google gives "full_name" or "name"
            const fullName = meta.full_name || meta.name || "";
            const parts = fullName.split(" ");
            if (parts.length > 0) setValue("firstName", parts[0]);
            if (parts.length > 1)
              setValue("lastName", parts.slice(1).join(" "));
          }
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [setValue]);

  const onSubmit = async (values: OnboardingFormValues) => {
    setFormError("root.serverError", { message: "" });

    if (!hasStore && !values.enrollmentId) {
      setFormError("enrollmentId", { message: "Enrollment ID is required" });
      return;
    }

    setIsPending(true);
    try {
      // Always update profile first (updates auth metadata and public.users if exists)
      const profileResult = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        jobTitle: values.jobTitle,
      });

      if (!profileResult.success) {
        // If profile update failed, it might be because public.users row doesn't exist yet.
        // But updateProfile also updates auth.users, which shouldn't fail.
        // If it failed on public.users update, we might ignore it if we are about to join store (which creates the row).
        // But let's check the error.
        console.warn("Profile update warning:", profileResult.error);
      }

      if (!hasStore) {
        // Join store (creates public.users row using auth metadata)
        const linkResult = await linkUserToStore(values.enrollmentId!);
        if (!linkResult.success) throw new Error(linkResult.error);
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Error submitting form:", err);
      setFormError("root.serverError", {
        type: "server",
        message: (err as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-6 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl glass-effect">
        <h2 className="mb-2 font-bold text-3xl text-center">
          {hasStore ? "Complete Profile" : "Welcome! 👋"}
        </h2>
        <p className="mb-8 text-slate-400 text-center">
          {hasStore
            ? "Please complete your profile details."
            : "To complete your setup, please enter your details and Company Code."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              First Name
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className={`pl-10! w-full input-dark ${
                  errors.firstName ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Last Name
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className={`pl-10! w-full input-dark ${
                  errors.lastName ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Job Title
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="e.g. Sales Associate"
                {...register("jobTitle")}
                className={`pl-10! w-full input-dark ${
                  errors.jobTitle ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.jobTitle && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          {!hasStore && (
            <div>
              <label
                htmlFor="enrollmentId"
                className="block mb-2 font-medium text-slate-300 text-sm"
              >
                Company Code
              </label>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Hash className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  id="enrollmentId"
                  placeholder="e.g. A7B2C9"
                  {...register("enrollmentId")}
                  className={`pl-10! w-full input-dark ${
                    errors.enrollmentId ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.enrollmentId && (
                <p className="mt-2 text-red-300 text-sm">
                  {errors.enrollmentId.message}
                </p>
              )}
            </div>
          )}

          {errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            <span>{isPending ? "Saving..." : "Continue"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
