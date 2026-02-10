import { X } from "lucide-react";
import { useItems } from "../../hooks/useItems";
import { useBatchStockForm } from "./hooks/useBatchStockForm";
import { BatchSelectionStep } from "./components/BatchSelectionStep";
import { BatchReviewStep } from "./components/BatchReviewStep";

interface BatchStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchStockUpdateModal: React.FC<BatchStockUpdateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { items } = useItems();
  const {
    batchData,
    step,
    getItemState,
    updateField,
    confirmSelection,
    cancelSelection,
    proceedToReview,
    backToSelection,
    submitBatch,
    selectedItems,
    totals,
    isProcessing,
  } = useBatchStockForm(items);

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 animate-in fade-in duration-200 p-6">
      <div className="bg-card shadow-2xl border border-border rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col relative">
        {/* Navigation / Close (Optional, usually handled inside steps or global close) */}
        {/* We keep a top-right close for safety, but maybe absolute positioned so it overlays headers if needed, 
            OR we let the steps handle their own headers. Steps have headers, so let's use absolute top-right for global close. */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 text-muted-foreground hover:text-foreground p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "selection" ? (
          <BatchSelectionStep
            items={items}
            batchData={batchData}
            getItemState={getItemState}
            updateField={updateField}
            confirmSelection={confirmSelection}
            cancelSelection={cancelSelection}
            onProceed={proceedToReview}
          />
        ) : (
          <BatchReviewStep
            selectedItems={selectedItems}
            batchData={batchData}
            totals={totals}
            onBack={backToSelection}
            onSubmit={() => submitBatch(onClose)}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

