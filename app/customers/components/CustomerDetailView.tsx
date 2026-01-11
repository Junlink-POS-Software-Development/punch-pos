// components/CustomerDetailView.tsx
import React, { useState } from "react";
import { useCustomerData } from "../hooks/useCustomerData";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  ImageIcon,
  X,
  Clock,
} from "lucide-react";
import Image from "next/image";

import { useViewStore } from "../../../components/window-layouts/store/useViewStore";

export const CustomerDetailView = () => {
  const { selectedCustomer, selectedCustomerGroupName } = useCustomerData();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isSplit } = useViewStore();

  if (!selectedCustomer) {
    return <div className="p-6 text-gray-400">Loading customer data...</div>;
  }

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="gap-6 grid grid-cols-12 mx-auto pb-10 max-w-7xl">
        {/* LEFT COLUMN - Profile & Stats */}
        <div className={`space-y-6 col-span-12 ${isSplit ? "" : "lg:col-span-4"}`}>
          {/* Identity Card */}
          <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-inner mb-2 rounded-full w-24 h-24 font-bold text-white text-3xl">
                {selectedCustomer.full_name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-gray-400 text-xs uppercase tracking-widest">
                Profile Overview
              </p>
            </div>

            <div className="space-y-4 mt-8">
              <InfoRow
                icon={Phone}
                label="Phone"
                value={selectedCustomer.phone_number}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={selectedCustomer.email}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={selectedCustomer.address}
              />
              <InfoRow
                icon={Calendar}
                label="Birthday"
                value={formatDate(selectedCustomer.birthdate)}
              />
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
            <h3 className="mb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">
              Financials
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-900/50 p-4 border border-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-gray-300 text-sm">Total Spent</span>
                </div>
                <span className="font-bold text-white text-lg">
                  {formatCurrency(selectedCustomer.total_spent || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-gray-900/50 p-4 border border-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400">
                    <Hash size={20} />
                  </div>
                  <span className="text-gray-300 text-sm">Visits</span>
                </div>
                <span className="font-bold text-white text-lg">
                  {selectedCustomer.visit_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Details & Content */}
        <div className={`space-y-6 col-span-12 ${isSplit ? "" : "lg:col-span-8"}`}>
          {/* Remarks Section */}
          <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-gray-400" size={18} />
              <h3 className="font-bold text-white text-lg">Remarks & Notes</h3>
            </div>
            <div className="bg-gray-900/50 p-4 border border-gray-700/50 rounded-xl min-h-[100px] text-gray-300 text-sm leading-relaxed">
              {selectedCustomer.remarks ||
                "No remarks added for this customer."}
            </div>
          </div>

          {/* Images Gallery Section */}
          <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-gray-400" size={18} />
                <h3 className="font-bold text-white text-lg">
                  Attached Images
                </h3>
              </div>
              <span className="text-gray-500 text-xs">
                {selectedCustomer.documents?.length || 0} Images
              </span>
            </div>

            {selectedCustomer.documents &&
            selectedCustomer.documents.length > 0 ? (
              <div className="gap-4 grid grid-cols-2 sm:grid-cols-3">
                {selectedCustomer.documents.map(
                  (docUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImage(docUrl)}
                      className="group relative bg-gray-900 border border-gray-700/50 hover:border-blue-500/50 rounded-xl aspect-video overflow-hidden transition-all"
                    >
                      <Image
                        src={docUrl}
                        alt={`Document ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="opacity-80 group-hover:opacity-100 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex justify-center items-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded font-medium text-white text-xs">
                          View Full
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="py-8 border-2 border-gray-700 border-dashed rounded-xl text-gray-500 text-sm text-center">
                No images uploaded.
              </div>
            )}
          </div>

          {/* Recent Transactions Placeholder */}
          <div className="bg-gray-800 opacity-75 shadow-lg p-6 border border-gray-700 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-gray-400" size={18} />
                <h3 className="font-bold text-white text-lg">
                  Recent Transactions
                </h3>
              </div>
            </div>
            <div className="bg-gray-900/30 py-10 border border-gray-700/30 rounded-xl text-center">
              <p className="text-gray-500">
                Transaction history module coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm p-4 animate-in duration-200 fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button className="top-4 right-4 absolute hover:bg-white/10 p-2 rounded-full text-white hover:text-gray-300 transition-colors">
            <X size={32} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="shadow-2xl rounded-lg max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </div>
  );
};

// Helper component
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType; // Changed from 'any' to 'React.ElementType'
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-gray-500">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
      <p className="font-medium text-gray-200 text-sm">{value || "-"}</p>
    </div>
  </div>
);
