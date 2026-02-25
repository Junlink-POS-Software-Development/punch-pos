import React from "react";
import { X } from "lucide-react";
import { Customer } from "../../lib/types";
import { RegisterCustomerForm } from "../forms/RegisterCustomerForm";

interface UpdateCustomerModalProps {
  customer: Customer;
  onClose: () => void;
}

export const UpdateCustomerModal = ({
  customer,
  onClose,
}: UpdateCustomerModalProps) => {
  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
      <div className="bg-card shadow-2xl border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center bg-muted/50 p-6 border-b border-border">
          <h2 className="font-bold text-foreground text-xl">Update Customer</h2>
          <button
            onClick={onClose}
            className="hover:bg-accent p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <RegisterCustomerForm
            initialData={customer}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
