// app/inventory/components/stock-management/SalesTerminal.tsx
"use client";

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import TerminalHeader from "./components/TerminalHeader";
import { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import SuccessReceiptModal from "./utils/SuccessReceiptModal";

const SalesTerminal = () => {
  const { isSplit } = useView();
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
  } = usePosForm();

  // We keep userName state for the LCD display,
  // but we remove the modals/signIn buttons since page.tsx handles that.
  const [userName, setUserName] = useState("PLEASE SIGN IN");

  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("user_id", userId)
        .single();

      if (data && !error) {
        setUserName(`${data.first_name} ${data.last_name}`.toUpperCase());
      } else {
        setUserName("UNKNOWN USER");
      }
    };

    // Check session on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) fetchUser(data.session.user.id);
    });

    // Listen for changes (Login from the Header will update this LCD)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUser(session.user.id);
        } else {
          setUserName("PLEASE SIGN IN");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
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
    </div>
  );
};

export default SalesTerminal;
