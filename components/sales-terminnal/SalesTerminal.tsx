// app/inventory/components/stock-management/SalesTerminal.tsx
"use client";

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-in/SignUp";
import { X } from "lucide-react";
import { handleLogOut } from "./components/buttons/handlers";

import { supabase } from "@/lib/supabaseClient";

import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";

type AuthModalState = "hidden" | "signIn" | "signUp";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");

  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onDoneSubmit,
    triggerDoneSubmit,
    onClear,
  } = usePosForm();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Hardcoded Values for 8-Bit Display ---
  const displayTime = "18:25";
  const displayProduct = "COKE";
  const displayPrice = "₱25.00";
  const displayStock = 21;
  const displayUser = isLoggedIn ? "JUNEL FUENTES" : "PLEASE SIGN IN";

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModal();
  };
  const handleLogoutClick = async () => {
    const loggedOut = await handleLogOut();
    if (loggedOut) {
      setIsLoggedIn(false);
    } else {
      console.error("Failed to log out.");
    }
  };

  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
    return "";
  }

  return (
    <div className="flex flex-col p-1 h-full">
      {/* --- NEW 8-BIT DISPLAY HEADER (Vertical spacing tightened) --- */}
      <div className="flex flex-col justify-center items-center shadow-lg mb-2 px-4 py-1 rounded-md w-full min-h-[180px] font-retro retro-lcd-container retro-scanlines">
        {/* Top Line: Title */}
        {/* Reduced text size and removed bottom margin */}
        <h1 className="mt-1 font-bold text-retro-cyan text-2xl md:text-3xl uppercase leading-none tracking-widest">
          POINT OF SALE
        </h1>

        {/* Divider with reduced margins */}
        <div className="opacity-70 my-1 retro-divider"></div>

        {/* Second Line: User and Time */}
        <div className="flex justify-between items-center px-2 w-full text-retro-cyan text-lg md:text-xl leading-none tracking-wide">
          <span className="max-w-[60%] truncate uppercase">{displayUser}</span>
          <span>{displayTime}</span>
        </div>

        {/* Third Line: Product and Price */}
        {/* Reduced from text-5xl to text-4xl and added padding */}
        <div className="flex justify-center items-center gap-6 drop-shadow-md my-2 w-full font-bold text-retro-cyan text-3xl md:text-4xl leading-none">
          <span>{displayProduct}</span>
          <span className="text-retro-cyan/90">{displayPrice}</span>
        </div>

        <div className="opacity-70 my-1 retro-divider"></div>

        {/* Bottom Line: Stocks */}
        <h2 className="mb-1 text-retro-cyan text-lg md:text-xl uppercase leading-none tracking-wide">
          STOCKS AVAILABLE: {displayStock}
        </h2>
      </div>
      {/* -------------------------------- */}

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
            <TerminalButtons
              isLoggedIn={isLoggedIn}
              onSignInClick={openSignInModal}
              onLogoutClick={handleLogoutClick}
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

      {authModalState !== "hidden" && (
        <div
          className="z-40 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {authModalState === "signIn" ? (
              <SignIn
                onSwitchToSignUp={openSignUpModal}
                onSuccess={handleLoginSuccess}
              />
            ) : (
              <SignUp onSwitchToSignIn={openSignUpModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
