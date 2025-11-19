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
import { X, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import { handleLogOut } from "./components/buttons/handlers";

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
    liveTime,
  } = usePosForm();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("PLEASE SIGN IN");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- Fetch User Logic ---
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
        console.error("Error fetching user name:", error);
        setUserName("UNKNOWN USER");
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const signedIn = !!session;
        setIsLoggedIn(signedIn);

        if (signedIn && session?.user) {
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

  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModal();
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    const loggedOut = await handleLogOut();
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoggedIn(false);
    setUserName("PLEASE SIGN IN");
    onClear();

    if (!loggedOut) {
      console.warn("Logout network request failed, but local session cleared.");
    }

    setIsLoggingOut(false);
    openSignUpModal();
  };

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
      {/* --- LOGOUT LOADING OVERLAY --- */}
      {isLoggingOut && (
        <div className="z-50 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <Loader2 className="mb-4 w-12 h-12 text-retro-cyan animate-spin" />
          <span className="font-retro text-retro-cyan text-2xl tracking-widest">
            LOGGING OUT...
          </span>
        </div>
      )}

      {/* --- HEADER --- */}
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

      {/* Authentication Modal */}
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
              // --- FIX: Was passing openSignUpModal here, changed to openSignInModal ---
              <SignUp onSwitchToSignIn={openSignInModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
