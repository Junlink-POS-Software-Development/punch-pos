"use client";

import { TerminalHeader } from "./components/terminal-header/TerminalHeader";
import { ShortcutsGuide } from "./components/terminal-header/ShortcutsGuide";

import { FormProvider } from "react-hook-form";
import { TerminalCart } from "./components/terminal-cart/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import { SuccessReceiptModal } from "./utils/SuccessReceiptModal";
import { ErrorMessage } from "./components/ErrorMessage";
import { useTerminalShortcuts } from "./hooks/useTerminalShortcuts";
import { PaymentPopup } from "./modals/PaymentPopup";
import { FreeItemModal } from "./modals/FreeItemModal";
import { DiscountModal } from "./modals/DiscountModal";
import { useState } from "react";
import { ActionPanel } from "./components/ActionPanel";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { PosThemeWrapper } from "./components/PosThemeWrapper";
import { PosThemeCustomizerModal } from "./modals/PosThemeCustomizerModal";
import { CartItem, DiscountType } from "./components/terminal-cart/types";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";

const DesktopSalesTerminal = () => {
  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
    onDoneSubmit,
    triggerDoneSubmit,
    onClear,

    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
    setCustomerId,
  } = usePosForm();

  /* State */
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<"customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null>("barcode");
  const [isAnimating] = useState(false);
  // Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountModalMode, setDiscountModalMode] = useState<'item' | 'transaction'>('transaction');
  const [discountTargetItem, setDiscountTargetItem] = useState<CartItem | null>(null);
  
  // POS Layout Mode
  const { posMode } = useViewStore();
  const isTabletMode = posMode === "tablet";

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  // 2. Call the hook and pass the triggers
  useTerminalShortcuts({ 
    onClear, 
    onCharge: () => setIsPaymentPopupOpen(true),
    onToggleFreeMode: () => setIsFreeModalOpen(true),
    onOpenThemeModal: () => setIsThemeModalOpen(true),
    hasItems: cartItems.length > 0
  });

  const handlePaymentComplete = (
    payment: number,
    voucherAmount: number,
    voucherData?: { id: string; code: string; amount: number } | null,
    invoiceNo?: string
  ) => {
    if (invoiceNo) {
      methods.setValue("transactionNo", invoiceNo);
    }

    // legacy voucher field for backward compat, though the true form logic is handled via usePosForm
    methods.setValue("voucher", voucherAmount);
    methods.setValue("voucherAmount", voucherAmount);
    
    if (voucherData) {
      methods.setValue("voucherCode", voucherData.code);
      if (voucherData.id) {
        methods.setValue("voucherId", voucherData.id);
      } else {
        methods.setValue("voucherId", null);
      }
    } else {
      methods.setValue("voucherCode", null);
      methods.setValue("voucherId", null);
    }

    // Set payment value synchronously
    methods.setValue("payment", payment);

    // IMPORTANT: change is normally updated by usePosForm's useEffect, but since
    // triggerDoneSubmit validates synchronously, change might still be negative 
    // resulting in a validation failure. We force the updated value here.
    const currentGrandTotal = methods.getValues("grandTotal") || 0;
    const amountDue = Math.max(currentGrandTotal - voucherAmount, 0);
    const newChangeAmount = Math.round((payment - amountDue) * 100) / 100;
    methods.setValue("change", newChangeAmount);

    // Clear "Add Item" fields to prevent validation errors blocking submission
    methods.setValue("quantity", null);
    methods.setValue("barcode", "");

    // Trigger submission using the helper that handles errors
    triggerDoneSubmit(invoiceNo);
    setIsPaymentPopupOpen(false);
  };

  const handleFreeItemSelect = (item: Item, qty: number) => {
     methods.setValue("barcode", item.sku);
     methods.setValue("quantity", qty);
     onAddToCart(true);
     setIsFreeModalOpen(false);
     setActiveField("barcode");
  };

  // --- Discount Handlers ---
  const handleOpenTransactionDiscount = () => {
    setDiscountModalMode('transaction');
    setDiscountTargetItem(null);
    setIsDiscountModalOpen(true);
  };

  const handleOpenItemDiscount = (item: CartItem) => {
    setDiscountModalMode('item');
    setDiscountTargetItem(item);
    setIsDiscountModalOpen(true);
  };

  const handleApplyItemDiscount = (itemId: string, discountType: DiscountType, discountValue: number) => {
    onUpdateItem(itemId, { discountType, discountValue });
  };

  const handleApplyTransactionDiscount = (discountType: DiscountType, discountValue: number) => {
    if (discountValue <= 0) {
      methods.setValue("orderDiscountType", null);
      methods.setValue("orderDiscountValue", null);
    } else {
      methods.setValue("orderDiscountType", discountType);
      methods.setValue("orderDiscountValue", discountValue);
    }
  };

  return (
    <PosThemeWrapper className="relative h-full overflow-hidden">
      <div className="relative flex flex-row h-full overflow-hidden">
        <FormProvider {...methods}>
          {/* LEFT PANEL: Transaction Details */}
          <div className="flex flex-col flex-1 p-2 h-full min-w-0 overflow-y-auto">
              {isAnimating ? (
                 <div className="w-full h-full flex items-center justify-center bg-card rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-muted-foreground animate-pulse font-medium">Adjusting Layout...</p>
                    </div>
                 </div>
              ) : isTabletMode && isFreeModalOpen ? (
                  <div className="h-full w-full">
                    <FreeItemModal
                      isOpen={isFreeModalOpen}
                      onClose={() => setIsFreeModalOpen(false)}
                      onSelect={handleFreeItemSelect}
                      isTabletMode={true}
                    />
                  </div>
              ) : isTabletMode && isDiscountModalOpen ? (
                  <div className="h-full w-full">
                    <DiscountModal
                      isOpen={isDiscountModalOpen}
                      onClose={() => setIsDiscountModalOpen(false)}
                      mode={discountModalMode}
                      targetItem={discountTargetItem}
                      onApplyItemDiscount={handleApplyItemDiscount}
                      subtotal={cartTotal}
                      onApplyTransactionDiscount={handleApplyTransactionDiscount}
                      isTabletMode={true}
                      currentDiscountType={discountModalMode === 'item' ? discountTargetItem?.discountType : (methods.getValues('orderDiscountType') as DiscountType | null)}
                      currentDiscountValue={discountModalMode === 'item' ? discountTargetItem?.discountValue : methods.getValues('orderDiscountValue')}
                    />
                  </div>
              ) : (
              <form
                id="sales-form"
                onSubmit={methods.handleSubmit(onDoneSubmit)}
                className={`
                  w-full min-h-full gap-4
                  ${!isTabletMode ? 'grid grid-cols-2 grid-rows-[1fr]' : 'flex flex-col'}
                `}
              >
                {/* Left Column Wrapper: Header + Inputs */}
                <div className={`flex flex-col ${!isTabletMode ? 'h-full' : ''}`}>
                    <TerminalHeader 
                      isTabletMode={isTabletMode}
                      setCustomerId={setCustomerId} 
                      grandTotal={cartItems.reduce((sum, item) => sum + (item.total || 0), 0)}
                      onAddToCartClick={onAddToCart}
                      onDoneSubmitTrigger={triggerDoneSubmit}
                      setActiveField={setActiveField}
                      activeField={activeField}
                      onOpenThemeModal={() => setIsThemeModalOpen(true)}
                    />

                    {/* Inline Shortcuts Guide - Appears when in desktop mode to fill space */}
                    {!isTabletMode && (
                      <div className="mt-1">
                         <ShortcutsGuide isInline />
                      </div>
                    )}
                </div>

                {/* Right Column: Cart */}
                <div className="border border-border bg-card rounded-2xl w-full flex-1 overflow-hidden min-h-[400px] shadow-sm">
                  {/* Desktop Cart */}
                  <div className="h-full">
                  <TerminalCart
                      rows={cartItems}
                      onRemoveItem={onRemoveItem}
                      onUpdateItem={onUpdateItem}
                      onItemDiscountClick={handleOpenItemDiscount}
                    />
                  </div>
                </div>
              </form>
              )}
          </div>

          {/* RIGHT PANEL: Action Panel — only visible in tablet mode */}
          <div className={`
            h-full transition-all duration-300 ease-in-out
            ${isTabletMode ? "w-[650px] xl:w-[700px]" : "w-0 overflow-hidden"}
          `}>
            {isTabletMode && (
              <ActionPanel 
                onAddToCart={onAddToCart}
                onClearAll={onClear}
                onCharge={() => {
                  if (cartItems.length > 0) {
                    setIsPaymentPopupOpen(true);
                  }
                }}
                onDiscount={handleOpenTransactionDiscount}
                onVoucher={() => {
                  if (cartItems.length > 0) {
                    setIsPaymentPopupOpen(true);
                  }
                }}
                activeField={activeField}
                setActiveField={setActiveField}
                isFreeMode={false}
                onToggleFreeMode={() => setIsFreeModalOpen(true)}
              />
            )}
          </div>
        </FormProvider>

        {successData && (
          <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
        )}

        <PaymentPopup
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
          subtotal={cartTotal}
          orderDiscountAmount={methods.getValues('orderDiscountAmount') || 0}
          totalAmount={methods.getValues('grandTotal') || cartTotal}
          onConfirm={handlePaymentComplete}
        />

        {!isTabletMode && (
          <FreeItemModal
            isOpen={isFreeModalOpen}
            onClose={() => setIsFreeModalOpen(false)}
            onSelect={handleFreeItemSelect}
            isTabletMode={false}
          />
        )}

        <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />

        {/* Discount Modal — inline for tablet, popup for desktop */}
        {isTabletMode && isDiscountModalOpen ? null : (
          <DiscountModal
            isOpen={isDiscountModalOpen}
            onClose={() => setIsDiscountModalOpen(false)}
            mode={discountModalMode}
            targetItem={discountTargetItem}
            onApplyItemDiscount={handleApplyItemDiscount}
            subtotal={cartTotal}
            onApplyTransactionDiscount={handleApplyTransactionDiscount}
            isTabletMode={false}
            currentDiscountType={discountModalMode === 'item' ? discountTargetItem?.discountType : (methods.getValues('orderDiscountType') as DiscountType | null)}
            currentDiscountValue={discountModalMode === 'item' ? discountTargetItem?.discountValue : methods.getValues('orderDiscountValue')}
          />
        )}

        {/* POS Theme Customizer Modal */}
        <PosThemeCustomizerModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      </div>
    </PosThemeWrapper>
  );
};

export { DesktopSalesTerminal };
