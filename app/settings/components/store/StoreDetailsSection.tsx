"use client";

import React from "react";
import { Store, Camera, Loader2, Check, Globe, DollarSign, Mail, Layout } from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";
import { StandardSelect } from "@/components/reusables/StandardSelect";
import { useStoreDetails } from "@/app/settings/hooks/useStoreDetails";

export function StoreDetailsSection() {
  const {
    user,
    isLoading,
    storeName,
    setStoreName,
    businessName,
    setBusinessName,
    storeImg,
    isSaving,
    isUploadingLogo,
    saveStatus,
    isDirty,
    logoInputRef,
    handleLogoSelect,
    handleSave,
    handleKeyDown,
  } = useStoreDetails();

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
                        onKeyDown={(e) => handleKeyDown(e)}
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
                    <StandardSelect
                        label="System Timezone"
                        className="cursor-pointer"
                    >
                        <option className="bg-background">Asia/Manila (GMT+8)</option>
                        <option className="bg-background">America/New_York (GMT-5)</option>
                        <option className="bg-background">Europe/London (GMT+0)</option>
                    </StandardSelect>
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
