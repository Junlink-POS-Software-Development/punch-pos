// app/inventory/components/item-registration/BatchItemRegistry.tsx

"use client";

import React from "react";
import { XCircle, Users } from "lucide-react";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";

export const BatchItemRegistry: React.FC = () => {
  const batchUpload = useItemBatchUpload();

  return (
    <div className="bg-slate-900 shadow-lg p-4 rounded-lg h-full">
      <h3 className="mb-4 font-semibold text-lg text-slate-100">Batch Registration</h3>

      {/* File Input */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-slate-300 text-sm">
          Upload CSV File
        </label>
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={batchUpload.handleFileChange}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/30 file:text-blue-200 hover:file:bg-blue-500/40 file:cursor-pointer"
        />
        <p className="mt-2 text-slate-500 text-xs">
          Required columns: <code className="text-slate-400">itemName</code>,{" "}
          <code className="text-slate-400">sku</code>,{" "}
          <code className="text-slate-400">costPrice</code>. Optional:{" "}
          <code className="text-slate-400">category</code>,{" "}
          <code className="text-slate-400">description</code>,{" "}
          <code className="text-slate-400">lowStockThreshold</code>.
        </p>
      </div>

      {/* Parsing Status */}
      {batchUpload.isParsing && (
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <div className="border-blue-400 border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
          <span>Parsing CSV file...</span>
        </div>
      )}

      {/* Validation Results */}
      {batchUpload.file && !batchUpload.isParsing && (
        <div className="space-y-4">
          {/* Valid Items Summary */}
          <div className="bg-green-500/10 p-3 border border-green-500/30 rounded-lg">
            <p className="font-medium text-green-300 text-sm">
              ✓ {batchUpload.validItems.length} valid item(s) ready to upload
            </p>
          </div>

          {/* Error Summary */}
          {batchUpload.errors.length > 0 && (
            <div className="bg-red-500/10 p-3 border border-red-500/30 rounded-lg">
              <p className="mb-2 font-medium text-red-300 text-sm">
                ✗ {batchUpload.errors.length} row(s) have errors:
              </p>
              <ul className="space-y-1 max-h-32 overflow-y-auto text-red-200 text-xs">
                {batchUpload.errors.map((err, idx) => (
                  <li key={idx}>
                    <strong>Row {err.row}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {batchUpload.validItems.length > 0 && (
            <div className="max-h-48 overflow-auto">
              <table className="w-full text-left text-slate-300 text-xs">
                <thead className="top-0 sticky bg-slate-800">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Cost Price</th>
                    <th className="p-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {batchUpload.validItems.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="border-slate-700 border-t">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">{item.itemName}</td>
                      <td className="p-2">{item.sku}</td>
                      <td className="p-2">₱{item.costPrice?.toFixed(2)}</td>
                      <td className="p-2">{item.category || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {batchUpload.validItems.length > 10 && (
                <p className="mt-2 text-slate-500 text-xs">
                  ...and {batchUpload.validItems.length - 10} more items
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={batchUpload.reset}
              className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"
            >
              <XCircle className="w-5 h-5" /> Reset
            </button>
            <button
              type="button"
              onClick={batchUpload.handleSubmit}
              disabled={
                batchUpload.isSubmitting || batchUpload.validItems.length === 0
              }
              className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {batchUpload.isSubmitting ? (
                <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
              ) : (
                <>
                  <Users className="w-5 h-5" /> Upload{" "}
                  {batchUpload.validItems.length} Items
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};