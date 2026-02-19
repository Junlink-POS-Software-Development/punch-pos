// app/inventory/components/item-registration/ItemReg.tsx

"use client";

import React from "react";
import { Package, FileText } from "lucide-react";
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
    handleBatchProcess,
    handleImageUpload,
    categories,
  } = useItemReg();

  const {
    editingRows,
    batchEditMode,
    selectedItems,
    searchQuery,
    setSearchQuery,
    sortConfig,
    filteredItems,
    displayItems,
    editingCount,
    handleSort,
    toggleSelectAll,
    toggleSelectItem,
    handleDeleteSelected,
    clearSelection,
    handleEdit,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
    handleEditSelected,
    handleUpdateEditingField,
    handleDeleteSingle,
    handleTableScroll,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
  } = useItemTable();

  const {
    barcodeModalData,
    setBarcodeModalData,
    handleBatchBarcodeGeneration,
    handleSingleBarcodeGeneration,
    handleDownloadBarcode,
    handlePrintLabel,
    handleCanvasReady,
  } = useBarcode();

  const renderAddItemView = () => (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setAddTab("single")}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
            addTab === "single"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Package size={18} /> Single Item
        </button>
        <button
          onClick={() => setAddTab("batch")}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
            addTab === "batch"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <FileText size={18} /> Batch Import
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {addTab === "single" ? (
          <SingleItemForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            isProcessing={isProcessing}
            isUploading={isUploading}
            handleSingleSubmit={handleSingleSubmit}
            handleImageUpload={handleImageUpload}
            onCancel={() => setViewMode("list")}
          />
        ) : (
          <BatchImportForm
            batchRawText={batchRawText}
            setBatchRawText={setBatchRawText}
            handleBatchProcess={handleBatchProcess}
            onCancel={() => setViewMode("list")}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-80px)]">
      {viewMode === "list" ? (
        <ItemTable
          displayItems={displayItems}
          filteredItems={filteredItems}
          selectedItems={selectedItems}
          toggleSelectAll={toggleSelectAll}
          toggleSelectItem={toggleSelectItem}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortConfig={sortConfig}
          handleSort={handleSort}
          onAddClick={() => setViewMode("add")}
          onDeleteSelected={handleDeleteSelected}
          onEditSelected={handleEditSelected}
          onGenerateBarcodes={() => handleBatchBarcodeGeneration(filteredItems, selectedItems)}
          onClearSelection={clearSelection}
          batchEditMode={batchEditMode}
          editingRows={editingRows}
          editingCount={editingCount}
          handleUpdateEditingField={handleUpdateEditingField}
          handleSaveInlineEdit={handleSaveInlineEdit}
          handleCancelInlineEdit={handleCancelInlineEdit}
          handleEdit={handleEdit}
          handleDeleteSingle={handleDeleteSingle}
          handleSingleBarcodeGeneration={handleSingleBarcodeGeneration}
          handleTableScroll={handleTableScroll}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      ) : (
        renderAddItemView()
      )}

      <BarcodeModal
        barcodeModalData={barcodeModalData}
        onClose={() => setBarcodeModalData(null)}
        onDownload={handleDownloadBarcode}
        onPrint={handlePrintLabel}
        onCanvasReady={handleCanvasReady}
      />
    </div>
  );
};

export default ItemReg;
