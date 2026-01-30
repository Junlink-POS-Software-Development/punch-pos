// app/inventory/components/item-registration/BatchItemRegistry.tsx

"use client";

import React from "react";
import { XCircle, Users } from "lucide-react";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";

export const BatchItemRegistry: React.FC = () => {
  const batchUpload = useItemBatchUpload();

  return (
    <div className="relative p-6 h-full glass-effect">
      <h3 className="mb-4 font-bold text-lg text-white tracking-tight uppercase font-lexend">Batch Registration</h3>

      {/* File Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-slate-300 text-sm">
          Upload CSV File
        </label>
        <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={batchUpload.handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/30 file:text-blue-100 hover:file:bg-blue-600/40 file:cursor-pointer transition-all"
          />
          <p className="mt-3 text-slate-500 text-xs leading-relaxed">
            Required: <code className="text-blue-400 bg-blue-400/10 px-1 rounded">itemName</code>,{" "}
            <code className="text-blue-400 bg-blue-400/10 px-1 rounded">sku</code>,{" "}
            <code className="text-blue-400 bg-blue-400/10 px-1 rounded">costPrice</code>.<br/>
            Optional: <code className="text-slate-400">category</code>, <code className="text-slate-400">description</code>, <code className="text-slate-400">lowStockThreshold</code>.
          </p>
        </div>
      </div>

      {/* Parsing Status */}
      {batchUpload.isParsing && (
        <div className="flex items-center gap-3 mb-4 text-blue-400 bg-blue-400/5 p-4 rounded-lg border border-blue-400/20 animate-pulse">
          <div className="border-blue-400 border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
          <span className="font-medium">Processing CSV file...</span>
        </div>
      )}

      {/* Validation Results */}
      {batchUpload.file && !batchUpload.isParsing && (
        <div className="space-y-4">
          {/* Valid Items Summary */}
          <div className="bg-emerald-500/10 p-4 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <p className="font-semibold text-emerald-400 text-sm">
              ✓ {batchUpload.validItems.length} items validated and ready
            </p>
          </div>

          {/* Error Summary */}
          {batchUpload.errors.length > 0 && (
            <div className="bg-red-500/10 p-4 border border-red-500/20 rounded-xl">
              <p className="mb-3 font-bold text-red-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {batchUpload.errors.length} validation errors found
              </p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto text-red-200/70 text-xs custom-scrollbar">
                {batchUpload.errors.map((err, idx) => (
                  <li key={idx} className="bg-red-500/5 p-2 rounded border border-red-500/10">
                    <span className="font-bold text-red-400 mr-2">Row {err.row}:</span> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {batchUpload.validItems.length > 0 && (
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/20">
              <div className="max-h-48 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-slate-300 text-xs">
                  <thead className="top-0 sticky bg-slate-900/90 backdrop-blur-md">
                    <tr>
                      <th className="p-3 font-semibold text-slate-400">#</th>
                      <th className="p-3 font-semibold text-slate-400">Item Name</th>
                      <th className="p-3 font-semibold text-slate-400">SKU</th>
                      <th className="p-3 font-semibold text-slate-400 text-right">Cost Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {batchUpload.validItems.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-medium">{item.itemName}</td>
                        <td className="p-3 font-mono text-slate-400">{item.sku}</td>
                        <td className="p-3 text-right font-mono text-blue-400">₱{item.costPrice?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {batchUpload.validItems.length > 10 && (
                <div className="p-2 text-center bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                  ...and {batchUpload.validItems.length - 10} more items
                </div>
              )}
          </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={batchUpload.reset}
              className="flex items-center gap-2 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 btn-3d-glass"
            >
              <XCircle className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={batchUpload.handleSubmit}
              disabled={
                batchUpload.isSubmitting || batchUpload.validItems.length === 0
              }
              className="flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/40 border-blue-600/50 btn-3d-glass disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
            >
              {batchUpload.isSubmitting ? (
                <div className="border-white border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin"></div>
              ) : (
                <>
                  <Users className="w-4 h-4" /> Upload{" "}
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