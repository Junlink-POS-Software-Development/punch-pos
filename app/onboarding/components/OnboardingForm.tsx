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
  ArrowLeft,
  User,
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import { joinStoreViaEnrollmentId } from "@/app/actions/store";
import { updateProfile } from "@/app/actions/profile";
import { updateStoreInfo, uploadStoreLogo } from "@/app/actions/store";
import { seedIndustryCategories } from "@/app/actions/seedIndustryCategories";
import imageCompression from "browser-image-compression";
import { StoreLogoUpload } from "./StoreLogoUpload";
import {
  BusinessMode,
  BUSINESS_MODE_PRESETS,
} from "@/lib/types/businessMode";

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

const INDUSTRY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
};

export function OnboardingForm({
  hasStore,
  defaultValues,
  onSuccess,
}: OnboardingFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Business mode selection (for store owners)
  const [selectedMode, setSelectedMode] = useState<BusinessMode>("retail");
  const [shouldSeedCategories, setShouldSeedCategories] = useState(true);

  // Store logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
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

  const handleNextStep = async () => {
    // Validate Step 1 fields before proceeding to Step 2
    const isValid = await trigger([
      "firstName",
      "lastName",
      "jobTitle",
      ...(hasStore ? (["storeName"] as const) : []),
    ]);

    if (isValid) {
      setCurrentStep(2);
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

      // 3. Store owner: upload logo and update store info with chosen business mode
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

      if (hasStore) {
        const preset = BUSINESS_MODE_PRESETS[selectedMode];
        await updateStoreInfo({
          storeName: values.storeName || undefined,
          storeImg: uploadedLogoUrl || undefined,
          businessMode: selectedMode,
          modulesEnabled: preset.defaultModules,
        });

        // 4. Optionally seed starter categories for the vertical
        if (shouldSeedCategories) {
          try {
            await seedIndustryCategories(selectedMode);
          } catch (seedErr) {
            console.warn("Category seeding notice:", seedErr);
          }
        }
      }

      // 5. Trigger success callback
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextField: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.querySelector(
        `input[name="${nextField}"]`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const selectedPreset = BUSINESS_MODE_PRESETS[selectedMode];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Indicator (Only for Store Owners) */}
      {hasStore && (
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </span>
            <span
              className={`text-xs font-semibold ${
                currentStep === 1 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Profile & Store
            </span>
          </div>

          <div className="w-12 h-0.5 bg-border" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-semibold ${
                currentStep === 2 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Business Vertical
            </span>
          </div>
        </div>
      )}

      {/* ────────────────── STEP 1: Profile & Store Info ────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
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
                onKeyDown={(e) => handleKeyDown(e, "lastName")}
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
                onKeyDown={(e) => handleKeyDown(e, "jobTitle")}
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
                placeholder="e.g. Store Owner / General Manager"
                {...register("jobTitle")}
                onKeyDown={(e) =>
                  handleKeyDown(e, hasStore ? "storeName" : "enrollmentId")
                }
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

          {/* ── Staff flow: Company Code ── */}
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

          {/* ── Store Owner Flow: Store Name & Logo ── */}
          {hasStore && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    Store Identity
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
                    placeholder="e.g. Metro Pharmacy & Wellness"
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

          {/* Action button for Step 1 */}
          {hasStore ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex justify-center items-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-bold transition-all mt-4 cursor-pointer"
            >
              <span>Next: Choose Business Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="flex justify-center items-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              <span>{isPending ? "Joining Store..." : "Complete Setup"}</span>
            </button>
          )}
        </div>
      )}

      {/* ────────────────── STEP 2: Business Vertical & Presets (Store Owners) ────────────────── */}
      {hasStore && currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-bold text-base text-foreground">
              What type of business are you operating?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              We&apos;ll automatically tailor your register layout, shortcuts, and recommended features.
            </p>
          </div>

          {/* Industry Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {(
              [
                "retail",
                "pharmacy",
                "grocery",
                "restaurant",
                "mall",
                "service",
              ] as BusinessMode[]
            ).map((modeKey) => {
              const preset = BUSINESS_MODE_PRESETS[modeKey];
              const Icon = INDUSTRY_ICONS[preset.iconName] || Store;
              const isSelected = selectedMode === modeKey;

              return (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => setSelectedMode(modeKey)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-foreground">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {preset.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Seed Categories Checkbox */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldSeedCategories}
                onChange={(e) => setShouldSeedCategories(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Seed starter categories for {selectedPreset.name}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Includes: {selectedPreset.starterCategories.slice(0, 4).join(", ")}
                  {selectedPreset.starterCategories.length > 4 ? ", and more" : ""}.
                </p>
              </div>
            </label>
          </div>

          {/* Error display */}
          {errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          {/* Step 2 Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Store...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Launch POS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
