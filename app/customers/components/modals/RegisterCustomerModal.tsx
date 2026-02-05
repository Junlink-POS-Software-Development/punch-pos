import { X } from "lucide-react";

import { useCustomerStore } from "../../store/useCustomerStore";
import { RegisterCustomerForm } from "../forms/RegisterCustomerForm";

export const RegisterCustomerModal = () => {
  const { isCustomerModalOpen, closeCustomerModal } = useCustomerStore();

  if (!isCustomerModalOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex flex-col bg-slate-900 shadow-2xl border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-slate-800 border-b">
          <div>
            <h2 className="font-bold text-white text-2xl">New Customer</h2>
            <p className="text-slate-400 text-sm">
              Enter customer details for your records.
            </p>
          </div>
          <button
            onClick={closeCustomerModal}
            className="bg-slate-800/50 hover:bg-red-500/20 p-2 rounded-full text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <RegisterCustomerForm
          onSuccess={closeCustomerModal}
          onCancel={closeCustomerModal}
        />
      </div>
    </div>
  );
};
