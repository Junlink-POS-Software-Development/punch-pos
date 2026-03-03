"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Hash,
  Loader2,
  AlertTriangle,
  ArrowRight,
  User,
  Store,
} from "lucide-react";
import { joinStoreViaEnrollmentId } from "@/app/actions/store";
import { updateProfile } from "@/app/actions/profile";
import { updateStoreInfo, uploadStoreLogo } from "@/app/actions/store";
import imageCompression from "browser-image-compression";
import { StoreLogoUpload } from "./StoreLogoUpload";

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  enrollmentId: z.string().optional(),
  storeName: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  hasStore: boolean;
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    storeName?: string;
  };
  onSuccess: (data: {
    userName: string;
    storeName: string;
    storeLogo: string | null;
  }) => void;
}

export function OnboardingForm({
  hasStore,
  defaultValues,
  onSuccess,
}: OnboardingFormProps) {
  const [isPending, setIsPending] = useState(false);

  // Store logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      jobTitle: defaultValues?.jobTitle || "",
      storeName: defaultValues?.storeName || "",
    },
  });

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      const finalFile = new File([compressed], file.name, {
        type: compressed.type,
      });
      setLogoFile(finalFile);

      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error("Logo compression failed:", err);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: OnboardingFormValues) => {
    setFormError("root.serverError", { message: "" });

    // Staff flow: enrollment code required
    if (!hasStore && !values.enrollmentId) {
      setFormError("enrollmentId", { message: "Enrollment ID is required" });
      return;
    }

    // Store owner flow: store name required
    if (hasStore && !values.storeName) {
      setFormError("storeName", { message: "Store name is required" });
      return;
    }

    setIsPending(true);
    try {
      // 1. Update profile
      const profileResult = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        jobTitle: values.jobTitle,
      });

      if (!profileResult.success) {
        console.warn("Profile update warning:", profileResult.error);
      }

      // 2. Staff: join store via enrollment code
      if (!hasStore) {
        const linkResult = await joinStoreViaEnrollmentId(values.enrollmentId!);
        if (!linkResult.success) throw new Error(linkResult.error);
      }

      // 3. Store owner: upload logo and update store info
      let uploadedLogoUrl: string | null = null;

      if (hasStore && logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const uploadResult = await uploadStoreLogo(fd);
        
        if (uploadResult.success && uploadResult.url) {
          uploadedLogoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "Failed to upload store logo");
        }
      }

      if (hasStore && (values.storeName || uploadedLogoUrl)) {
        await updateStoreInfo({
          storeName: values.storeName || undefined,
          storeImg: uploadedLogoUrl || undefined,
        });
      }

      // 4. Trigger success callback
      onSuccess({
        userName: `${values.firstName} ${values.lastName}`,
        storeName: values.storeName || "",
        storeLogo: uploadedLogoUrl || logoPreview,
      });

      // Trigger global sync for sidebar
      window.dispatchEvent(new Event("store-updated"));
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* First Name */}
      <div>
        <label className="block mb-2 font-medium text-muted-foreground text-sm">
          First Name
        </label>
        <div className="relative">
          <span className="left-0 absolute inset-y-0 flex items-center pl-3">
            <User className="w-5 h-5 text-muted-foreground" />
          </span>
          <input
            type="text"
            placeholder="First Name"
            {...register("firstName")}
            className={`pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring ${
              errors.firstName ? "border-red-500" : ""
            }`}
          />
        </div>
        {errors.firstName && (
          <p className="mt-2 text-red-500 text-sm">
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label className="block mb-2 font-medium text-muted-foreground text-sm">
          Last Name
        </label>
        <div className="relative">
          <span className="left-0 absolute inset-y-0 flex items-center pl-3">
            <User className="w-5 h-5 text-muted-foreground" />
          </span>
          <input
            type="text"
            placeholder="Last Name"
            {...register("lastName")}
            className={`pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring ${
              errors.lastName ? "border-red-500" : ""
            }`}
          />
        </div>
        {errors.lastName && (
          <p className="mt-2 text-red-500 text-sm">
            {errors.lastName.message}
          </p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label className="block mb-2 font-medium text-muted-foreground text-sm">
          Job Title
        </label>
        <div className="relative">
          <span className="left-0 absolute inset-y-0 flex items-center pl-3">
            <User className="w-5 h-5 text-muted-foreground" />
          </span>
          <input
            type="text"
            placeholder="e.g. Sales Associate"
            {...register("jobTitle")}
            className={`pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring ${
              errors.jobTitle ? "border-red-500" : ""
            }`}
          />
        </div>
        {errors.jobTitle && (
          <p className="mt-2 text-red-500 text-sm">
            {errors.jobTitle.message}
          </p>
        )}
      </div>

      {/* ── Staff flow: enrollment code ── */}
      {!hasStore && (
        <div>
          <label
            htmlFor="enrollmentId"
            className="block mb-2 font-medium text-muted-foreground text-sm"
          >
            Company Code
          </label>
          <div className="relative">
            <span className="left-0 absolute inset-y-0 flex items-center pl-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
            </span>
            <input
              type="text"
              id="enrollmentId"
              placeholder="e.g. A7B2C9"
              {...register("enrollmentId")}
              className={`pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring ${
                errors.enrollmentId ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.enrollmentId && (
            <p className="mt-2 text-red-500 text-sm">
              {errors.enrollmentId.message}
            </p>
          )}
        </div>
      )}

      {/* ── Store owner flow: store name + logo ── */}
      {hasStore && (
        <>
          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Store Info
              </span>
            </div>
          </div>

          {/* Store Logo */}
          <StoreLogoUpload
            logoPreview={logoPreview}
            isUploading={isUploadingLogo}
            onSelect={handleLogoSelect}
            inputRef={logoInputRef}
          />

          {/* Store Name */}
          <div>
            <label className="block mb-2 font-medium text-muted-foreground text-sm">
              Store Name
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Store className="w-5 h-5 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="e.g. My Awesome Store"
                {...register("storeName")}
                className={`pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring ${
                  errors.storeName ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.storeName && (
              <p className="mt-2 text-red-500 text-sm">
                {errors.storeName.message}
              </p>
            )}
          </div>
        </>
      )}

      {errors.root?.serverError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>{errors.root.serverError.message}</span>
        </div>
      )}

      <button
        type="submit"
        className="flex justify-center items-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md transition-colors"
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
  );
}
