"use client";

import React, { useEffect, useState, useRef } from "react";
import { Store, Camera, Loader2, Check, Globe, DollarSign, Clock, Mail, Layout } from "lucide-react";
import { getStoreInfo, updateStoreInfo, uploadStoreLogo } from "@/app/actions/store";
import imageCompression from "browser-image-compression";
import { CurrencySelector } from "./CurrencySelector";
import { useAuthStore } from "@/store/useAuthStore";

export function StoreDetailsSection() {
  const { user } = useAuthStore();
  const [storeName, setStoreName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [storeImg, setStoreImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Original values for dirty checking
  const [originalName, setOriginalName] = useState("");
  const [originalImg, setOriginalImg] = useState<string | null>(null);
  const [originalBusinessName, setOriginalBusinessName] = useState("");
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const result = await getStoreInfo();
      if (result.success) {
        setStoreName(result.storeName || "");
        setBusinessName(result.storeName || ""); // Placeholder if business name is same
        setStoreImg(result.storeImg || null);
        setOriginalName(result.storeName || "");
        setOriginalBusinessName(result.storeName || "");
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

  const isDirty = 
    storeName !== originalName || 
    businessName !== originalBusinessName ||
    storeImg !== originalImg || 
    pendingLogoFile !== null;

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
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card/50 p-8 border border-border rounded-2xl shadow-sm backdrop-blur-sm flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border rounded-2xl shadow-sm backdrop-blur-sm overflow-hidden">
      {/* Visual Header */}
      <div className="h-32 bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 relative">
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-primary overflow-hidden">
                    {storeImg ? (
                        <img src={storeImg} alt="Store Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <Store className="w-10 h-10 opacity-20" />
                    )}
                </div>
                <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 active:scale-90"
                >
                    {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoSelect} />
            </div>
            
            <div className="pb-2 space-y-1">
                <h3 className="text-2xl font-bold text-foreground leading-none">
                    {storeName || "Unnamed Store"}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit border border-border/50">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Business Identity</span>
                </div>
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="pt-20 p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {/* Store Information */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                    <Layout className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-70">General Information</h4>
                </div>
                
                <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Store Name</label>
                    <input 
                        type="text" 
                        name="storeName"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "businessName")}
                        placeholder="Public name of your store"
                        className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                
                <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Business Registered Name</label>
                    <input 
                        type="text" 
                        name="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)} // End of sequence
                        placeholder="Legal business name"
                        className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Support Email
                    </label>
                    <input 
                        type="email" 
                        value={user?.email || ""}
                        disabled
                        className="w-full bg-muted/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed italic"
                    />
                </div>
            </div>

            {/* Regional Settings */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                    <Globe className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-70">Region & Locale</h4>
                </div>

                <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> System Timezone
                    </label>
                    <div className="relative">
                        <select className="w-full appearance-none bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                            <option>Asia/Manila (GMT+8)</option>
                            <option>America/New_York (GMT-5)</option>
                            <option>Europe/London (GMT+0)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Base Currency
                    </label>
                    <CurrencySelector />
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground max-w-sm">
                These settings affect your store's branding and financial calculations.
            </p>
            <button 
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
            >
                {isSaving ? "Saving..." : saveStatus === "saved" ? (
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Saved!
                    </div>
                ) : (
                    "Save Store Details"
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
