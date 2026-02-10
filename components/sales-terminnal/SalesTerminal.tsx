"use client";

import FormFields from "./components/FormFields";

import TerminalHeader from "./components/terminal-header/TerminalHeader";
import { ShortcutsGuide } from "./components/terminal-header/ShortcutsGuide";

import { FormProvider } from "react-hook-form";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/terminal-cart/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import SuccessReceiptModal from "./utils/SuccessReceiptModal";
import ErrorMessage from "./components/ErrorMessage";
// 1. Import the new hook
import { useTerminalShortcuts } from "./hooks/useTerminalShortcuts"; // Adjust path as needed
import { PaymentPopup } from "./modals/PaymentPopup";
import { FreeItemModal } from "./modals/FreeItemModal";
import { useState, useEffect } from "react";
import ActionPanel from "./components/ActionPanel";
import MobileFormFields from "./components/mobile-view/MobileFormFields";
import MobileActionPanel from "./components/mobile-view/MobileActionPanel";
import MobileCartPanel from "./components/mobile-view/MobileCartPanel";

const SalesTerminal = () => {
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
    // [NEW]
    isFreeMode,
    toggleFreeMode,
  } = usePosForm();



  /* State */
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<"barcode" | "quantity" | null>("barcode");
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  
  // 2. Call the hook and pass the triggers
  useTerminalShortcuts({ 
    onClear, 
    onCharge: () => setIsPaymentPopupOpen(true),
    hasItems: cartItems.length > 0
  });



  const handlePaymentComplete = (payment: number, voucher: number) => {
    const totalPayment = payment + voucher;
    const change = totalPayment - cartTotal;

    // Set values in the form
    methods.setValue("payment", payment);
    methods.setValue("voucher", voucher);
    methods.setValue("grandTotal", cartTotal - voucher);
    methods.setValue("change", change);

    // Clear "Add Item" fields to prevent validation errors blocking submission
    methods.setValue("quantity", null);
    methods.setValue("barcode", "");

    // Trigger submission using the helper that handles errors
    triggerDoneSubmit();
    setIsPaymentPopupOpen(false);
  };

  const handleFreeItemSelect = (item: any, qty: number) => {
     methods.setValue("barcode", item.sku);
     methods.setValue("quantity", qty);
     // Force Free Mode for this addition
     onAddToCart(true);
     setIsFreeModalOpen(false);
  };

  return (
    <div className="relative flex flex-col lg:flex-row h-full overflow-hidden">
      <FormProvider {...methods}>
        {/* LEFT PANEL: Transaction Details */}
        <div className="flex flex-col flex-1 p-2 sm:p-4 h-full min-w-0 overflow-y-auto">
            <form
              id="sales-form"
              onSubmit={methods.handleSubmit(onDoneSubmit)}
              className={`
                w-full min-h-full gap-4
                ${!isActionPanelOpen ? 'flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-[1fr]' : 'flex flex-col'}
              `}
            >
              {/* Left Column Wrapper: Header + Inputs */}
              <div className={`flex flex-col gap-2 ${!isActionPanelOpen ? 'h-full' : ''}`}>
                  <TerminalHeader 
                    setCustomerId={setCustomerId} 
                    grandTotal={cartItems.reduce((sum, item) => sum + item.total, 0)}
                    onAddToCartClick={onAddToCart}
                    onDoneSubmitTrigger={triggerDoneSubmit}
                    setActiveField={setActiveField}
                    activeField={activeField}
                  />

                  {/* Inline Shortcuts Guide - Appears when side panel is closed to fill space */}
                  {!isActionPanelOpen && (
                    <div className="hidden lg:block mt-2">
                       <ShortcutsGuide isInline />
                    </div>
                  )}
              </div>

              {/* Right Column: Cart */}
              <div className="border border-border bg-card rounded-2xl w-full flex-1 overflow-hidden min-h-[400px] shadow-sm">
                {/* Desktop Cart */}
                <div className="hidden sm:block h-full">
                  <TerminalCart
                    rows={cartItems}
                    onRemoveItem={onRemoveItem}
                    onUpdateItem={onUpdateItem}
                  />
                </div>
                {/* Mobile Action Panel (QuickPick + Charge + Numpad) */}
                <div className="block sm:hidden h-full">
                  <MobileActionPanel
                    onAddToCart={onAddToCart}
                    onCharge={() => setIsPaymentPopupOpen(true)}
                    activeField={activeField}
                    setActiveField={setActiveField}
                  />
                </div>
              </div>
            </form>
        </div>

        {/* RIGHT PANEL: Action Panel */}
        {/* RIGHT PANEL: Action Panel - Desktop Only */}
        <div className={`
          hidden lg:block h-full transition-all duration-300 ease-in-out
          ${isActionPanelOpen ? "w-[450px]" : "w-0"}
        `}>
          <ActionPanel 
            onAddToCart={onAddToCart}
            onClearAll={onClear}
            onCharge={() => {
              if (cartItems.length > 0) {
                setIsPaymentPopupOpen(true);
              }
            }}
            activeField={activeField}
            setActiveField={setActiveField}
            isFreeMode={false} // No longer toggle state, just modal action
            onToggleFreeMode={() => setIsFreeModalOpen(true)}
            isOpen={isActionPanelOpen}
            onToggle={() => setIsActionPanelOpen(!isActionPanelOpen)}
          />
        </div>

        {/* Mobile Cart Panel Overlay */}
        <MobileCartPanel
          cartItems={cartItems}
          grandTotal={cartTotal}
          onRemoveItem={onRemoveItem}
          onCharge={() => setIsPaymentPopupOpen(true)}
        />
      </FormProvider>

      {successData && (
        <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
      )}

      <PaymentPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        totalAmount={cartTotal}
        onConfirm={handlePaymentComplete}
      />

      <FreeItemModal
        isOpen={isFreeModalOpen}
        onClose={() => setIsFreeModalOpen(false)}
        onSelect={handleFreeItemSelect}
      />

      <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />
    </div>
  );
};

export default SalesTerminal;
