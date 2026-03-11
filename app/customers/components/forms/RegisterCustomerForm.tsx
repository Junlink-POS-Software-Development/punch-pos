"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";

import {
  useCustomerData,
  useCustomerMutations,
} from "../../hooks/useCustomerData";
import { createCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import { Customer, CustomerFormValues, customerSchema } from "../../lib/types";

// Sub-components
import { ViewSwitcher } from "./register-customer/ViewSwitcher";
import { ManualForm } from "./register-customer/ManualForm";
import { AiScanView } from "./register-customer/AiScanView";
import { DocumentUpload } from "./register-customer/DocumentUpload";
import { FormFooter } from "./register-customer/FormFooter";
import { ErrorMessage } from "../../../../components/sales-terminnal/components/ErrorMessage";

interface RegisterCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Customer;
}

/**
 * ─── Register Customer Form ────────────────────────────────────────────────
 * Main form component for registering new customers or editing existing ones.
 * Supports manual entry and AI-assisted scanning.
 */
export function RegisterCustomerForm({
  onSuccess,
  onCancel,
  initialData,
}: RegisterCustomerFormProps) {
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const [loading, setLoading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [view, setView] = useState<"manual" | "ai-scan">("manual");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Duplicate Handling State
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      phone_number: initialData?.phone_number || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      remarks: initialData?.remarks || "",
      group_id: initialData?.group_id || "",
      birthdate: initialData?.birthdate || "",
      date_of_registration: initialData?.date_of_registration || new Date().toISOString().split("T")[0],
      civil_status: (initialData?.civil_status as any) || "",
      gender: (initialData?.gender as any) || "",
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMessage(null);
    const newCompressedFiles: File[] = [];

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.6,
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 20 * 1024 * 1024) {
          setErrorMessage(`File ${file.name} is too large (>20MB).`);
          continue;
        }

        if (!file.type.startsWith("image/")) {
          newCompressedFiles.push(file);
          continue;
        }

        try {
          const compress = typeof imageCompression === 'function' 
            ? imageCompression 
            : (imageCompression as any).default;

          const compressedBlob = await compress(file, options);
          const finalFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          });
          newCompressedFiles.push(finalFile);
        } catch (err) {
          console.error(`Compression failed for ${file.name}, using original:`, err);
          newCompressedFiles.push(file);
        }
      }

      setCompressedFiles((prev) => [...prev, ...newCompressedFiles]);
    } catch (error: any) {
      setErrorMessage("Failed to process images: " + (error.message || "Unknown error"));
    } finally {
      setIsCompressing(false);
      event.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setCompressedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  
  const handleAiScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Document image is too large (>15MB) for AI processing.");
      event.target.value = "";
      return;
    }

    setIsAiProcessing(true);
    setErrorMessage(null);

    try {
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        try {
          const aiCompressionOptions = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2048,
            useWebWorker: true,
          };
          const compress = typeof imageCompression === 'function' 
            ? imageCompression 
            : (imageCompression as any).default;

          const compressedBlob = await compress(file, aiCompressionOptions);
          fileToUpload = new File([compressedBlob], file.name, { type: file.type });
        } catch (compErr) {
          console.warn("AI pre-scan compression failed:", compErr);
        }
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);

      const response = await fetch("/api/ai/extract-customer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `AI extraction failed (${response.status})`);
      }

      const data = await response.json();

      // Auto-fill form fields
      if (data.full_name) setValue("full_name", data.full_name);
      if (data.phone_number) setValue("phone_number", data.phone_number);
      if (data.email) setValue("email", data.email);
      if (data.address) setValue("address", data.address);
      if (data.birthdate) setValue("birthdate", data.birthdate);
      if (data.civil_status) setValue("civil_status", data.civil_status);
      if (data.gender) setValue("gender", data.gender);
      if (data.remarks) setValue("remarks", data.remarks);

      // Add to files list
      setCompressedFiles((prev) => [...prev, fileToUpload]);
      setView("manual");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to extract information.");
    } finally {
      setIsAiProcessing(false);
      event.target.value = "";
    }
  };

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (initialData) {
        // 1. Update existing customer
        const payload = {
          ...data,
          group_id: data.group_id === "" ? null : data.group_id,
          phone_number: data.phone_number === "" ? null : data.phone_number,
          email: data.email === "" ? null : data.email,
          address: data.address === "" ? null : data.address,
          remarks: data.remarks === "" ? null : data.remarks,
          birthdate: data.birthdate === "" ? null : data.birthdate,
        };
        const result = await updateCustomerAction(initialData.id, payload);
        if (!result.success) throw new Error(result.error);
      } else {
        // 2. Create new customer
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value as string);
          }
        });

        compressedFiles.forEach((file) => {
          formData.append("documents", file);
        });

        const result = await createCustomerAction(formData);
        
        if (result.status === 'blocked') {
          setErrorMessage(result.error || "Action blocked");
          setLoading(false);
          return;
        }

        if (result.status === 'warning') {
          setPendingFormData(formData);
          setShowDuplicateModal(true);
          setLoading(false);
          return;
        }
        
        if (!result.success) {
          setErrorMessage(result.error || "Failed to create customer");
          setLoading(false);
          return;
        }
      }

      await refreshData();
      reset();
      setCompressedFiles([]);
      onSuccess();
    } catch (error: any) {
      console.error("Submission failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingFormData) return;

    setLoading(true);
    try {
      pendingFormData.append('confirmed', 'true');
      const result = await createCustomerAction(pendingFormData);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to create duplicate customer.");
        setLoading(false);
        setShowDuplicateModal(false);
        return;
      }

      await refreshData();
      reset();
      setCompressedFiles([]);
      setPendingFormData(null);
      setShowDuplicateModal(false);
      onSuccess();
    } catch (error: any) {
      setErrorMessage("Failed to create duplicate customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorMessage 
        message={errorMessage} 
        onClose={() => setErrorMessage(null)} 
      />
      
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-background">
        <ViewSwitcher view={view} setView={setView} />

        {view === "manual" ? (
          <form
            id="customer-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <ManualForm 
              register={register} 
              errors={errors} 
              groups={groups} 
            />
            
            <DocumentUpload 
              isCompressing={isCompressing}
              compressedFiles={compressedFiles}
              handleImageUpload={handleImageUpload}
              removeFile={removeFile}
            />
          </form>
        ) : (
          <AiScanView 
            isAiProcessing={isAiProcessing} 
            handleAiScan={handleAiScan} 
          />
        )}
      </div>

      <FormFooter 
        onCancel={onCancel} 
        loading={loading} 
        isCompressing={isCompressing} 
      />

      {/* Duplicate Warning Modal */}
      {showDuplicateModal && (
        <div className="z-50 fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Customer Already Exists</h3>
            <p className="text-muted-foreground mb-6">
              A customer with similar details was found. Do you want to create a duplicate record anyway?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setPendingFormData(null);
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDuplicate}
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all font-medium text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Confirm Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


