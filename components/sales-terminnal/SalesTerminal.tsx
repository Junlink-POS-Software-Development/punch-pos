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

  // --- NEW: Use the modularized form hook ---
  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onDoneSubmit,
    triggerDoneSubmit, // Used by Done button and Voucher field
    onClear, // Used by Clear button
  } = usePosForm();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      <div className="flex flex-col items-center bg-primary-dark marquee-screen">
        <h1 className="text-text-primary sm:text-1xl md:text-3xl lg:text-4xl marquee-text">
          POINT OF SALE
        </h1>
        <h2 className="text-text-primary">
          {isLoggedIn ? "Welcome User!" : "Please Sign In"}
        </h2>
      </div>

      <FormProvider {...methods}>
        <form
          id="sales-form"
          // Form submission is handled by react-hook-form validation wrapper
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
              onDoneClick={triggerDoneSubmit} // Passed to Done button
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
