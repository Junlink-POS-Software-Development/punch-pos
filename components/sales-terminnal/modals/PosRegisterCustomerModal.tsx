"use client";

import React from "react";
import { X, UserPlus } from "lucide-react";
import { RegisterCustomerForm } from "@/app/customers/components/forms/RegisterCustomerForm";
import { Customer } from "@/app/customers/lib/types";

interface PosRegisterCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  initialName?: string;
}

export const PosRegisterCustomerModal: React.FC<PosRegisterCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-70 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex flex-col bg-card shadow-2xl border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-border border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Register Customer</h2>
              <p className="text-muted-foreground text-xs">
                Register customer to attach to this transaction
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-muted p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <RegisterCustomerForm
          initialName={initialName}
          onSuccess={(newCustomer) => {
            if (newCustomer) {
              onSuccess(newCustomer);
            }
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
