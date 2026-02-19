// app/inventory/components/item-registration/hooks/useBarcode.ts

import { useState, useRef, useCallback } from "react";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";

export const useBarcode = () => {
  const [barcodeModalData, setBarcodeModalData] = useState<InventoryItem[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleBatchBarcodeGeneration = (filteredItems: InventoryItem[], selectedItems: string[]) => {
    const selected = filteredItems.filter((i) =>
      selectedItems.includes(i.item_id)
    );
    if (selected.length > 0) {
      setBarcodeModalData(selected);
    }
  };

  const handleSingleBarcodeGeneration = (item: InventoryItem) => {
    setBarcodeModalData([item]);
  };

  const handleDownloadBarcode = () => {
    if (!canvasRef.current || !barcodeModalData) return;

    let filename = "barcode";
    if (barcodeModalData.length === 1) {
      filename = `${barcodeModalData[0].sku}_${barcodeModalData[0].item_name.replace(/\s+/g, "_")}`;
    } else {
      filename = `Batch_Barcodes_${barcodeModalData.length}_Items`;
    }

    const image = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleCanvasReady = useCallback((node: HTMLCanvasElement) => {
    canvasRef.current = node;
  }, []);

  return {
    barcodeModalData,
    setBarcodeModalData,
    handleBatchBarcodeGeneration,
    handleSingleBarcodeGeneration,
    handleDownloadBarcode,
    handlePrintLabel,
    handleCanvasReady,
  };
};
