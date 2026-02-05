// app/inventory/components/item-registration/BatchItemRegistry.tsx

"use client";

import React from "react";
import { XCircle, Users } from "lucide-react";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";

export const BatchItemRegistry: React.FC = () => {
  const batchUpload = useItemBatchUpload();

  
  return (
    <div className="relative p-6 h-full bg-card border border-border rounded-xl shadow-sm">
      <h3 className="mb-4 font-bold text-lg text-foreground tracking-tight uppercase font-lexend">Batch Registration</h3>

      {/* File Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-muted-foreground text-sm">
          Upload CSV File
        </label>
        <div className="bg-muted p-4 border border-border rounded-xl">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={batchUpload.handleFileChange}
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer transition-all"
          />
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            Required: <code className="text-primary bg-primary/10 px-1 rounded">itemName</code>,{" "}
            <code className="text-primary bg-primary/10 px-1 rounded">sku</code>,{" "}
            <code className="text-primary bg-primary/10 px-1 rounded">costPrice</code>.<br/>
            Optional: <code className="text-muted-foreground">category</code>, <code className="text-muted-foreground">description</code>, <code className="text-muted-foreground">lowStockThreshold</code>.
          </p>
        </div>
      </div>

      {/* Parsing Status */}
      {batchUpload.isParsing && (
        <div className="flex items-center gap-3 mb-4 text-primary bg-primary/5 p-4 rounded-lg border border-primary/20 animate-pulse">
          <div className="border-primary border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
          <span className="font-medium">Processing CSV file...</span>
        </div>
      )}

      {/* Validation Results */}
      {batchUpload.file && !batchUpload.isParsing && (
        <div className="space-y-4">
          {/* Valid Items Summary */}
          <div className="bg-green-500/10 p-4 border border-green-500/20 rounded-xl flex items-center justify-between">
            <p className="font-semibold text-green-500 text-sm">
              ✓ {batchUpload.validItems.length} items validated and ready
            </p>
          </div>

          {/* Error Summary */}
          {batchUpload.errors.length > 0 && (
            <div className="bg-red-500/10 p-4 border border-red-500/20 rounded-xl">
              <p className="mb-3 font-bold text-red-500 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {batchUpload.errors.length} validation errors found
              </p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto text-red-400 text-xs custom-scrollbar">
                {batchUpload.errors.map((err, idx) => (
                  <li key={idx} className="bg-red-500/5 p-2 rounded border border-red-500/10">
                    <span className="font-bold text-red-500 mr-2">Row {err.row}:</span> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {batchUpload.validItems.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
              <div className="max-h-48 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-muted-foreground text-xs">
                  <thead className="top-0 sticky bg-muted backdrop-blur-md">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground">#</th>
                      <th className="p-3 font-semibold text-muted-foreground">Item Name</th>
                      <th className="p-3 font-semibold text-muted-foreground">SKU</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Cost Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batchUpload.validItems.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-medium text-foreground">{item.itemName}</td>
                        <td className="p-3 font-mono text-muted-foreground">{item.sku}</td>
                        <td className="p-3 text-right font-mono text-primary">₱{item.costPrice?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {batchUpload.validItems.length > 10 && (
                <div className="p-2 text-center bg-muted/50 border-t border-border text-[10px] text-muted-foreground uppercase tracking-wider">
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
              className="flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border rounded-md px-4 py-2 text-sm text-foreground transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={batchUpload.handleSubmit}
              disabled={
                batchUpload.isSubmitting || batchUpload.validItems.length === 0
              }
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary rounded-md px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
            >
              {batchUpload.isSubmitting ? (
                <div className="border-primary-foreground border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin"></div>
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