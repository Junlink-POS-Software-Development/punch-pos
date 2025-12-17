// app/inventory/components/stock-management/SalesTerminal.tsx
"use client";

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useViewStore } from "../window-layouts/store/useViewStore";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import TerminalHeader from "./components/TerminalHeader";
import { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import SuccessReceiptModal from "./utils/SuccessReceiptModal";
import ErrorMessage from "./components/ErrorMessage";

const SalesTerminal = () => {
  const { isSplit } = useViewStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onDoneSubmit,
    triggerDoneSubmit,
    onClear,
    liveTime,
    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
  } = usePosForm();

  // We keep userName state for the LCD display,
  // but we remove the modals/signIn buttons since page.tsx handles that.
  const [userName, setUserName] = useState("PLEASE SIGN IN");

  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const { getUserProfile } = await import("@/app/actions/user");
      const result = await getUserProfile(userId);

      if (result.success && result.data) {
        setUserName(`${result.data.first_name} ${result.data.last_name}`.toUpperCase());
      } else {
        setUserName("UNKNOWN USER");
      }
    };

    // Check session on load
    const check = async () => {
       const { checkSession } = await import("@/app/actions/auth");
       const result = await checkSession();
       if (result.success && result.user) {
         fetchUser(result.user.id);
       }
    };
    check();

    // We removed the real-time auth listener because we don't have createClient anymore.
    // The SessionMonitor will handle reloads on visibility change.
  }, []);

  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
    return "";
  }

  return (
    <div className="relative flex flex-col p-1 h-full">
      <FormProvider {...methods}>
        {/* Terminal Header with product info */}
        <TerminalHeader userName={userName} liveTime={liveTime} />

        <form
          id="sales-form"
          onSubmit={methods.handleSubmit(onDoneSubmit)}
          className={`gap-4 grid ${ScreenLogic()} w-full h-full overflow-hidden`}
        >
          <div className="relative flex flex-col w-full h-full">
            <FormFields
              onAddToCartClick={onAddToCart}
              onDoneSubmitTrigger={triggerDoneSubmit}
            />
            {/* REMOVED AUTH PROPS */}
            <TerminalButtons
              onAddToCartClick={onAddToCart}
              onDoneClick={triggerDoneSubmit}
              onClearClick={onClear}
            />
          </div>
          <div className="border border-primary-light rounded-2xl w-full h-full overflow-hidden">
            <TerminalCart rows={cartItems} onRemoveItem={onRemoveItem} />
          </div>
        </form>
      </FormProvider>

      {/* --- SUCCESS RECEIPT MODAL --- */}
      {successData && (
        <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
      )}

      {/* --- ERROR MESSAGE --- */}
      <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />
    </div>
  );
};

export default SalesTerminal;
