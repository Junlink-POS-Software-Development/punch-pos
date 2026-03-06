"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileInfo, updateProfile, uploadAvatar } from "@/app/actions/profile";
import imageCompression from "browser-image-compression";

export function usePersonalInfo() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Local State ──────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarImg, setAvatarImg] = useState<string | null>(null);

  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");
  const [originalAvatarImg, setOriginalAvatarImg] = useState<string | null>(null);

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ["personalInfo", user?.id],
    queryFn: async () => {
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
      return result;
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const isDirty =
    firstName !== originalFirstName ||
    lastName !== originalLastName ||
    phoneNumber !== originalPhoneNumber ||
    avatarImg !== originalAvatarImg ||
    pendingAvatarFile !== null;

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
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    avatarImg,

    // Status
    isSaving,
    isUploadingAvatar,
    saveStatus,
    isDirty,
    fileInputRef,

    // Handlers
    handleAvatarSelect,
    handleSave,
    handleKeyDown,
  };
}
