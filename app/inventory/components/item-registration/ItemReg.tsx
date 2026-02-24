// app/inventory/components/item-registration/ItemReg.tsx

"use client";

import React from "react";
import { Package, FileText, X } from "lucide-react";
import { useItemReg } from "./hooks/useItemReg";
import { useItemTable } from "./hooks/useItemTable";
import { useBarcode } from "./hooks/useBarcode";
import SingleItemForm from "./add-item/SingleItemForm";
import BatchImportForm from "./add-item/BatchImportForm";

import BarcodeModal from "./barcode-modal/BarcodeModal";
import ItemTable from "./item-table/ItemTable";

const ItemReg = () => {
  const {
    viewMode,
    setViewMode,
    addTab,
    setAddTab,
    formData,
    setFormData,
    batchRawText,
    setBatchRawText,
    isProcessing,
    isUploading,
    handleSingleSubmit,
    handleBatchParse,
    handleBatchSubmit,
    batchStep,
    parsedBatchItems,
    setBatchStep,
    handleImageUpload,
    resetForm,
    categories,
  } = useItemReg();

  const {
    filteredItems,
  } = useItemTable();

  const {
    handleBatchBarcodeGeneration,
  } = useBarcode();

  const renderAddItemView = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header/Tabs */}
        <div className="flex border-b border-white/5 bg-white/5 items-center justify-between px-2">
          <div className="flex shrink-0">
            <button
              onClick={() => setAddTab("single")}
              className={`px-6 py-4 text-sm font-semibold flex items-center gap-2 transition-all ${
                addTab === "single"
                  ? "text-primary border-b-2 border-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              <Package size={18} /> Single Item
            </button>
            <button
              onClick={() => setAddTab("batch")}
              className={`px-6 py-4 text-sm font-semibold flex items-center gap-2 transition-all ${
                addTab === "batch"
                  ? "text-primary border-b-2 border-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              <FileText size={18} /> Batch Import
            </button>
          </div>
          
          <button 
            onClick={() => setViewMode("list")}
            className="p-2 mr-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          {addTab === "single" ? (
            <SingleItemForm
              formData={formData}
              setFormData={setFormData as any}
              categories={categories}
              isProcessing={isProcessing}
              isUploading={isUploading}
              handleSingleSubmit={handleSingleSubmit}
              handleImageUpload={handleImageUpload}
              onReset={resetForm}
              onCancel={() => setViewMode("list")}
            />
          ) : (
            <BatchImportForm
              batchRawText={batchRawText}
              setBatchRawText={setBatchRawText}
              handleBatchParse={handleBatchParse}
              onCancel={() => setViewMode("list")}
              batchStep={batchStep}
              parsedBatchItems={parsedBatchItems}
              handleBatchSubmit={handleBatchSubmit}
              isProcessing={isProcessing}
              setBatchStep={setBatchStep}
              categories={categories}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] p-4 md:p-6 lg:p-8">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col min-h-0">
        <ItemTable
          onAddClick={() => setViewMode("add")}
          onGenerateBarcodes={() => handleBatchBarcodeGeneration(filteredItems)}
        />
      </div>

      {viewMode === "add" && renderAddItemView()}

      <BarcodeModal />
    </div>
  );
};

export default ItemReg;


