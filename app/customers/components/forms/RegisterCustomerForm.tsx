import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";

import {
  useCustomerData,
  useCustomerMutations,
} from "../../hooks/useCustomerData";
import { createCustomer, updateCustomer } from "../../api/services";
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

export const RegisterCustomerForm = ({
  onSuccess,
  onCancel,
  initialData,
}: RegisterCustomerFormProps) => {
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const [loading, setLoading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [view, setView] = useState<"manual" | "ai-scan">("manual");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
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

        if (!file.type.startsWith("image/")) {
          newCompressedFiles.push(file);
          continue;
        }

        try {
          const compressedBlob = await imageCompression(file, options);
          const finalFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          });
          newCompressedFiles.push(finalFile);
        } catch (err) {
          console.error(
            `Skipping compression for ${file.name} due to error:`,
            err
          );
          newCompressedFiles.push(file);
        }
      }

      setCompressedFiles((prev) => [...prev, ...newCompressedFiles]);
    } catch (error) {
      console.error("Batch upload failed:", error);
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

    setIsAiProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/extract-customer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI extraction failed");
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

      // Add the scanned document to the compressed files list
      setCompressedFiles((prev) => [...prev, file]);

      // Switch back to manual view for review
      setView("manual");
    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("Failed to extract information from the document. Please try again or enter manually.");
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
        // Update existing customer
        const payload = {
          ...data,
          group_id: data.group_id === "" ? null : data.group_id,
          phone_number: data.phone_number === "" ? null : data.phone_number,
          email: data.email === "" ? null : data.email,
          address: data.address === "" ? null : data.address,
          remarks: data.remarks === "" ? null : data.remarks,
          birthdate: data.birthdate === "" ? null : data.birthdate,
        };
        await updateCustomer(initialData.id, payload);
      } else {
        // Create new customer
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value as string);
          }
        });

        compressedFiles.forEach((file) => {
          formData.append("documents", file);
        });

        const result = await createCustomer(formData);
        console.log("createCustomer result:", result);
        
        if (result && (result.status === 'exists' || result.status === 'conflict')) {
            console.log("Setting error message:", result.error);
            setErrorMessage(result.error);
            setLoading(false);
            return;
        }
      }

      await refreshData();
      reset();
      setCompressedFiles([]);
      onSuccess();
    } catch (error) {
      console.error(initialData ? "Update failed:" : "Registration failed:", error);
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
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <ViewSwitcher view={view} setView={setView} />

        {view === "manual" ? (
          <form
            id="customer-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
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
    </>
  );
};

