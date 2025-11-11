import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";

import { useState, useEffect } from "react";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-in/SignUp";
import { X } from "lucide-react";
import { handleLogOut } from "./components/buttons/handlers";
import { supabase } from "@/lib/supabaseClient";

type AuthModalState = "hidden" | "signIn" | "signUp";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");

  // This state will now be correctly set by the useEffect hook
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 3. --- ADD THIS ENTIRE useEffect BLOCK ---
  useEffect(() => {
    // This listener fires on page load and whenever auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // If a session exists, the user is logged in
        // If session is null, the user is logged out
        setIsLoggedIn(!!session);
      }
    );

    // Cleanup: remove the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // The empty array [] means this runs once when the component mounts
  // ------------------------------------------

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
  }

  return (
    <div className="flex flex-col p-1 h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary sm:text-1xl md:text-3xl lg:text-4xl">
          POINT OF SALE
        </h1>
        <h2 className="text-text-primary">
          {isLoggedIn ? "Welcome User!" : "Please Sign In"}
        </h2>
      </div>
      <div
        className={`gap-1 grid  ${ScreenLogic()}  w-ful h-full overflow-hidden`}
      >
        <div className="relative flex flex-col w-full h-full">
          {" "}
          <FormFields />
          <TerminalButtons
            isLoggedIn={isLoggedIn}
            onSignInClick={openSignInModal}
            onLogoutClick={handleLogoutClick}
          />
          <div></div>
        </div>

        <div className="flex justify-center items-center border border-primary-light rounded-2xl overflow-hidden text-white text-5xl">
          TERMINAL CART
        </div>
      </div>

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
              <SignUp onSwitchToSignIn={openSignInModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
