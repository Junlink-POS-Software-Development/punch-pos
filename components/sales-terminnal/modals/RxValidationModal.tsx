"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, User, FileText, CheckCircle2, X, AlertTriangle, Pill } from "lucide-react";
import { CartItem } from "../components/terminal-cart/types";
import { PrescriptionLogPayload, logPrescription } from "@/app/actions/prescription";

interface RxValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rxItems: CartItem[];
  defaultPatientName?: string;
  onValidated: (rxData: {
    doctorName: string;
    doctorPrc: string;
    patientName: string;
    doctorPtr?: string;
    patientAge?: number;
  }) => void;
}

export const RxValidationModal: React.FC<RxValidationModalProps> = ({
  isOpen,
  onClose,
  rxItems,
  defaultPatientName = "",
  onValidated,
}) => {
  const [doctorName, setDoctorName] = useState("");
  const [doctorPrc, setDoctorPrc] = useState("");
  const [doctorPtr, setDoctorPtr] = useState("");
  const [patientName, setPatientName] = useState(defaultPatientName);
  const [patientAge, setPatientAge] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultPatientName) {
        setPatientName(defaultPatientName);
      }
      setError(null);
    }
  }, [isOpen, defaultPatientName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError("Prescribing Doctor's Name is required.");
      return;
    }
    if (!doctorPrc.trim()) {
      setError("Doctor's PRC License Number is required.");
      return;
    }
    if (!patientName.trim()) {
      setError("Patient's Full Name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Asynchronously log to prescriptions_log
      const payload: PrescriptionLogPayload = {
        doctor_name: doctorName.trim(),
        doctor_prc: doctorPrc.trim(),
        doctor_ptr: doctorPtr.trim() || undefined,
        patient_name: patientName.trim(),
        patient_age: patientAge ? parseInt(patientAge) : undefined,
        rx_items: rxItems.map((item) => ({
          sku: item.sku,
          item_name: item.itemName,
          generic_name: item.genericName,
          dosage: item.dosage,
          quantity: item.quantity,
        })),
      };

      // Non-blocking log
      logPrescription(payload).catch((err) => console.warn("Prescription log error:", err));

      onValidated({
        doctorName: doctorName.trim(),
        doctorPrc: doctorPrc.trim(),
        patientName: patientName.trim(),
        doctorPtr: doctorPtr.trim() || undefined,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to validate prescription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-red-500/10 dark:bg-red-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                Prescription (Rx) Validation
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                  Required
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Regulated drugs require prescribing physician details before dispensing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Regulated items in cart */}
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-red-500" />
              Regulated Rx items to dispense ({rxItems.length}):
            </span>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {rxItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs bg-card px-3 py-1.5 rounded-lg border border-border/50"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-foreground">{item.itemName}</span>
                    {item.genericName && (
                      <span className="text-muted-foreground ml-1.5 italic">
                        ({item.genericName})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-primary shrink-0">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Physician Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Prescribing Physician Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Doctor's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Maria Santos, MD"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  PRC License No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={doctorPrc}
                  onChange={(e) => setDoctorPrc(e.target.value)}
                  placeholder="e.g. 00123456"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-mono transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>PTR / S2 License</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={doctorPtr}
                  onChange={(e) => setDoctorPtr(e.target.value)}
                  placeholder="For controlled drugs"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Patient Details
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-xs font-medium text-foreground">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Validating..." : "Validate & Proceed to Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
