// app/inventory/components/item-registration/barcode-modal/BarcodeModal.tsx

import React from "react";
import { X, Download, Printer } from "lucide-react";
import {
  BarcodeLabelCanvas,
  BarcodeSheetCanvas,
} from "../BarcodeComponents";
import { useBarcode } from "../hooks/useBarcode";
import { useItemRegStore } from "../store/useItemRegStore";

const BarcodeModal: React.FC = () => {
  const {
    barcodeModalData,
    handleDownloadBarcode,
    handlePrintLabel,
    handleCanvasReady,
  } = useBarcode();
  
  const setBarcodeModalData = useItemRegStore((state) => state.setBarcodeModalData);

  if (!barcodeModalData) return null;
  const isBatch = barcodeModalData.length > 1;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #barcode-print-area, #barcode-print-area * { visibility: visible; }
          #barcode-print-area {
            position: absolute; left: 0; top: 0;
            width: 100%; height: auto;
            background: white; padding: 0; margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        className={`bg-card rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] ${
          isBatch ? "max-w-4xl" : "max-w-sm"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted no-print rounded-t-xl">
          <h3 className="font-semibold text-foreground">
            {isBatch
              ? `Batch Barcodes (${barcodeModalData.length} items)`
              : "Label Preview"}
          </h3>
          <button
            onClick={() => setBarcodeModalData(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Area */}
        <div
          className="p-6 bg-muted/50 grow overflow-auto flex justify-center"
          id="barcode-print-area"
        >
          <div className={isBatch ? "shadow-lg bg-white inline-block" : "shadow-lg inline-block"}>
            {isBatch ? (
              <BarcodeSheetCanvas
                items={barcodeModalData.map((i) => ({
                  name: i.item_name,
                  category: i.category || "General",
                  sku: i.sku,
                  price: i.sales_price ?? i.unit_cost,
                }))}
                onCanvasReady={handleCanvasReady}
              />
            ) : (
              <BarcodeLabelCanvas
                item={{
                  name: barcodeModalData[0].item_name,
                  category: barcodeModalData[0].category || "General",
                  sku: barcodeModalData[0].sku,
                  price: barcodeModalData[0].sales_price ?? barcodeModalData[0].unit_cost,
                }}
                onCanvasReady={handleCanvasReady}
              />
            )}
          </div>
        </div>

        <div className="px-6 py-2 text-center no-print bg-card border-t border-border">
          <p className="text-xs text-muted-foreground">
            {isBatch
              ? "Preview of generated label sheet. Download to save as a single image."
              : "Preview of 300x180px label. Ready for thermal printers."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-card flex gap-3 no-print rounded-b-xl">
          <button
            onClick={handleDownloadBarcode}
            className="flex-1 py-2.5 bg-card border border-border text-foreground font-medium hover:bg-muted rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} /> {isBatch ? "Download Sheet" : "Save Image"}
          </button>
          <button
            onClick={handlePrintLabel}
            className="flex-1 py-2.5 bg-primary text-primary-foreground font-medium hover:bg-primary/90 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
