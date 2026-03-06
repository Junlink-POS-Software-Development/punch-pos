"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getStoreInfo, updateStoreInfo, uploadStoreLogo } from "@/app/actions/store";
import imageCompression from "browser-image-compression";

export function useStoreDetails() {
  const { user } = useAuthStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ─── Local State ──────────────────────────────────────────────────────────
  const [storeName, setStoreName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [storeImg, setStoreImg] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState("");
  const [originalBusinessName, setOriginalBusinessName] = useState("");
  const [originalImg, setOriginalImg] = useState<string | null>(null);

  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ["storeInfo", user?.id],
    queryFn: async () => {
      const result = await getStoreInfo();
      if (result.success) {
        setStoreName(result.storeName || "");
        setBusinessName(result.storeName || "");
        setStoreImg(result.storeImg || null);
        setOriginalName(result.storeName || "");
        setOriginalBusinessName(result.storeName || "");
        setOriginalImg(result.storeImg || null);
      }
      return result;
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const isDirty =
    storeName !== originalName ||
    businessName !== originalBusinessName ||
    storeImg !== originalImg ||
    pendingLogoFile !== null;

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 512, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      const finalFile = new File([compressed], file.name, { type: compressed.type });
      setPendingLogoFile(finalFile);

      const reader = new FileReader();
      reader.onload = (ev) => setStoreImg(ev.target?.result as string);
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error("Logo compression failed:", err);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      let logoUrl: string | undefined;

      if (pendingLogoFile) {
        const fd = new FormData();
        fd.append("file", pendingLogoFile);
        const uploadResult = await uploadStoreLogo(fd);

        if (uploadResult.success && uploadResult.url) {
          logoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "Failed to upload store logo");
        }
      }

      const result = await updateStoreInfo({
        storeName: storeName !== originalName ? storeName : undefined,
        storeImg: logoUrl,
      });

      if (result.success) {
        setSaveStatus("saved");
        setOriginalName(storeName);
        setOriginalBusinessName(businessName);
        if (logoUrl) {
          setStoreImg(logoUrl);
          setOriginalImg(logoUrl);
        }
        setPendingLogoFile(null);
        window.dispatchEvent(new Event("store-updated"));
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextField?: string) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();

      if (nextField) {
        const nextInput = document.querySelector(`[name="${nextField}"]`) as HTMLElement;
        if (nextInput) nextInput.focus();
      } else {
        handleSave();
      }
    }
  };

  return {
    // Data
    user,
    isLoading,
    storeName,
    setStoreName,
    businessName,
    setBusinessName,
    storeImg,

    // Status
    isSaving,
    isUploadingLogo,
    saveStatus,
    isDirty,
    logoInputRef,

    // Handlers
    handleLogoSelect,
    handleSave,
    handleKeyDown,
  };
}
