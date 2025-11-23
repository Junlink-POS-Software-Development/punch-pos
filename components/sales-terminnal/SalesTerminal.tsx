// app/inventory/components/stock-management/SalesTerminal.tsx
"use client";

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
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

  const displayProduct = "COKE";
  const displayPrice = "₱25.00";
  const displayStock = 21;

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
      {/* ... (Existing Header) ... */}
      <div className="flex flex-col justify-center items-center shadow-lg mb-2 px-4 py-1 rounded-md w-full min-h-[180px] font-retro retro-lcd-container retro-scanlines">
        <h1 className="mt-1 font-bold text-retro-cyan text-2xl md:text-3xl uppercase leading-none tracking-widest">
          POINT OF SALE
        </h1>
        <div className="opacity-70 my-1 retro-divider"></div>
        <div className="flex justify-between items-center px-2 w-full text-retro-cyan text-lg md:text-xl leading-none tracking-wide">
          <span className="max-w-[60%] truncate uppercase">{userName}</span>
          <span>{liveTime}</span>
        </div>
        <div className="flex justify-center items-center gap-6 drop-shadow-md my-2 w-full font-bold text-retro-cyan text-3xl md:text-4xl leading-none">
          <span>{displayProduct}</span>
          <span className="text-retro-cyan/90">{displayPrice}</span>
        </div>
        <div className="opacity-70 my-1 retro-divider"></div>
        <h2 className="mb-1 text-retro-cyan text-lg md:text-xl uppercase leading-none tracking-wide">
          STOCKS AVAILABLE: {displayStock}
        </h2>
      </div>

      <FormProvider {...methods}>
        <form
          id="sales-form"
          onSubmit={methods.handleSubmit(onDoneSubmit)}
          className={`gap-1 grid ${ScreenLogic()} w-full h-full overflow-hidden`}
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
