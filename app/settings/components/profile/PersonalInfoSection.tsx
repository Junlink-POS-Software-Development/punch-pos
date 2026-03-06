"use client";

import React, { useEffect, useRef, useState } from "react";
import { User, Camera, Mail, Briefcase, Phone, Save, Loader2, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import imageCompression from "browser-image-compression";
import { getProfileInfo, updateProfile, uploadAvatar } from "@/app/actions/profile";

export function PersonalInfoSection() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarImg, setAvatarImg] = useState<string | null>(null);

  // Original values for dirty checking
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");
  const [originalAvatarImg, setOriginalAvatarImg] = useState<string | null>(null);

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfileInfo();
      if (result.success) {
        setFirstName(result.firstName || "");
        setLastName(result.lastName || "");
        setAvatarImg(result.avatar || null);
        const phone = result.metadata?.phone_number || "";
        setPhoneNumber(phone);

        setOriginalFirstName(result.firstName || "");
        setOriginalLastName(result.lastName || "");
        setOriginalAvatarImg(result.avatar || null);
        setOriginalPhoneNumber(phone);
      }
      setIsLoading(false);
    };
    if (user) {
        fetchProfile();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 512, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      const finalFile = new File([compressed], file.name, { type: compressed.type });
      setPendingAvatarFile(finalFile);

      const reader = new FileReader();
      reader.onload = (ev) => setAvatarImg(ev.target?.result as string);
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error("Avatar compression failed:", err);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isDirty = 
    firstName !== originalFirstName || 
    lastName !== originalLastName ||
    phoneNumber !== originalPhoneNumber ||
    avatarImg !== originalAvatarImg || 
    pendingAvatarFile !== null;

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      let avatarUrl: string | undefined;

      if (pendingAvatarFile) {
        const fd = new FormData();
        fd.append("file", pendingAvatarFile);
        const uploadResult = await uploadAvatar(fd);
        
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "Failed to upload avatar");
        }
      }

      const result = await updateProfile({
        firstName: firstName !== originalFirstName ? firstName : undefined,
        lastName: lastName !== originalLastName ? lastName : undefined,
        phoneNumber: phoneNumber !== originalPhoneNumber ? phoneNumber : undefined,
        avatar: avatarUrl,
      });

      if (result.success) {
        setSaveStatus("saved");
        setOriginalFirstName(firstName);
        setOriginalLastName(lastName);
        setOriginalPhoneNumber(phoneNumber);
        if (avatarUrl) {
          setAvatarImg(avatarUrl);
          setOriginalAvatarImg(avatarUrl);
        }
        setPendingAvatarFile(null);
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

  if (!user || isLoading) {
    return (
      <div className="bg-card/50 p-8 border border-border rounded-2xl shadow-sm backdrop-blur-sm flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  const jobTitle = user.user_metadata?.job_title || "Member";

  return (
    <div className="bg-card/50 border border-border rounded-2xl shadow-sm backdrop-blur-sm overflow-hidden">
      {/* Visual Header / Cover-like area */}
      <div className="h-32 bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 relative">
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-primary overflow-hidden">
                    {avatarImg ? (
                        <img src={avatarImg} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <User className="w-10 h-10 opacity-20" />
                            <span className="text-xl font-bold opacity-40">{(user.email?.[0] || firstName?.[0] || "?").toUpperCase()}</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 active:scale-90"
                >
                    {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
            </div>
            
            <div className="pb-2 space-y-1">
                <h3 className="text-2xl font-bold text-foreground leading-none">
                    {firstName || "Unnamed"} {lastName}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit border border-border/50">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">{jobTitle}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="pt-20 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Name Fields */}
            <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">First Name</label>
                <input 
                    type="text" 
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "lastName")}
                    placeholder="Enter first name"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                />
            </div>
            <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Last Name</label>
                <input 
                    type="text" 
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "phoneNumber")}
                    placeholder="Enter last name"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                />
            </div>

            {/* Contact Fields */}
            <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                    type="email" 
                    value={user.email || ""}
                    disabled
                    className="w-full bg-muted/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed italic"
                />
            </div>
            <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Number
                </label>
                <input 
                    type="tel" 
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)} // Last field
                    placeholder="+63 000 000 0000"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                />
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground max-w-sm">
                Last modified profile changes will be reflected across active store sessions.
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
                    <>
                        <Save className="w-4 h-4" />
                        Save Profile
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
