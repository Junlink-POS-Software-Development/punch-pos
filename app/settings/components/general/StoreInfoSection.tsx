"use client";

import React, { useEffect, useState, useRef } from "react";
import { Store, Camera, Loader2, Check } from "lucide-react";
import { getStoreInfo, updateStoreInfo, uploadStoreLogo } from "@/app/actions/store";
import imageCompression from "browser-image-compression";

export function StoreInfoSection() {
  const [storeName, setStoreName] = useState("");
  const [storeImg, setStoreImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Original values for dirty checking
  const [originalName, setOriginalName] = useState("");
  const [originalImg, setOriginalImg] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const result = await getStoreInfo();
      if (result.success) {
        setStoreName(result.storeName || "");
        setStoreImg(result.storeImg || null);
        setOriginalName(result.storeName || "");
        setOriginalImg(result.storeImg || null);
      }
      setIsLoading(false);
    };
    fetchStore();
  }, []);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 512, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      const finalFile = new File([compressed], file.name, { type: compressed.type });
      setPendingLogoFile(finalFile);

      // Local preview
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

  const isDirty = storeName !== originalName || storeImg !== originalImg || pendingLogoFile !== null;

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      let logoUrl: string | undefined;

      // Upload logo if there's a pending file
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
        if (logoUrl) {
          setStoreImg(logoUrl);
          setOriginalImg(logoUrl);
        }
        setPendingLogoFile(null);
        
        // Trigger global sync for sidebar/other components
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

  if (isLoading) {
    return (
      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card/50 p-6 border border-border rounded-xl shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Logo upload area */}
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => logoInputRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 overflow-hidden transition-all duration-300 group-hover:border-primary/50">
            {isUploadingLogo ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : storeImg ? (
              <img
                src={storeImg}
                alt="Store logo"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <Store className="w-8 h-8 opacity-50" />
            )}
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              Update
            </span>
          </div>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center sm:text-left w-full">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Store Identity</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Your store logo and name are displayed throughout the app and on receipts.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter your store name"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="w-4 h-4" />
              ) : null}
              {isSaving ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
