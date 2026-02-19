// app/inventory/components/item-registration/add-item/BatchImportForm.tsx

import React from "react";
import { FileText, Upload } from "lucide-react";

interface BatchImportFormProps {
  batchRawText: string;
  setBatchRawText: (text: string) => void;
  handleBatchProcess: () => void;
  onCancel: () => void;
}

const BatchImportForm: React.FC<BatchImportFormProps> = ({
  batchRawText,
  setBatchRawText,
  handleBatchProcess,
  onCancel,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
        <div className="p-1 bg-primary/20 text-primary rounded">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-foreground font-medium">
            CSV Format Guide
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Format each line as:{" "}
            <strong>
              Name, Category, Selling Price, Cost Price, Stock, MinStock, Description
            </strong>
          </p>
          <code className="block mt-2 text-xs bg-background/50 p-2 rounded text-foreground">
            Latte, Beverage, 4.50, 1.20, 100, 20, &quot;Smooth espresso with
            steamed milk&quot;
            <br />
            Blueberry Muffin, Food, 3.00, , 24, 5, &quot;Freshly baked daily&quot;
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Paste Data or Upload CSV
        </label>
        <textarea
          value={batchRawText}
          onChange={(e) => setBatchRawText(e.target.value)}
          className="w-full h-48 px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none font-mono text-sm text-foreground"
          placeholder="Paste CSV content here..."
        ></textarea>
      </div>

      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium">
          <Upload size={16} /> Upload .csv file
        </button>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBatchProcess}
            disabled={!batchRawText}
            className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium shadow-sm transition-colors"
          >
            Process Batch
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchImportForm;
