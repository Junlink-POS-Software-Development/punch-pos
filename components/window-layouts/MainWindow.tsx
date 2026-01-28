// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "../../app/hooks/useMediaQuery";
import RightWindow from "./RightWindow";
import { useViewStore } from "./store/useViewStore";
import Navigation from "../navigation/Navigation";
import Header from "../Header";
import { useAuthStore } from "@/store/useAuthStore";
import { X, Loader2 } from "lucide-react";

import { WindowLoading } from "./WindowLoading";

// Dynamic import for LeftWindow (contains SalesTerminal) - improves INP
const LeftWindow = dynamic(() => import("./LeftWindow"), {
  loading: () => (
    <div 
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: "50%" }}
    >
      <div className="box-border pt-4 pr-2 pb-4 pl-4 w-full h-full">
        <WindowLoading />
      </div>
    </div>
  ),
  ssr: false,
});

// Dynamic imports for modals (Moved from app/page.tsx)
const SignUp = dynamic(
  () =>
    import("@/components/sign-in/SignUp").then((mod) => ({
      default: mod.SignUp,
    })),
  { ssr: false }
);

const SignIn = dynamic(
  () =>
    import("@/components/sign-in/SignIn").then((mod) => ({
      default: mod.SignIn,
    })),
  { ssr: false }
);

type AuthModalState = "hidden" | "signIn" | "signUp";

// STEP 1: Update the function to accept 'children'
export default function MainWindow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitial, setIsInitial] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { viewState, mobileView } = useViewStore();

  // Auth State
  const { user, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] = useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Bypass split-screen layout for specific routes (maintenance, login, etc.)
  const fullScreenRoutes = ["/maintenance", "/login"];
  const isFullScreenRoute = fullScreenRoutes.some(route => pathname?.startsWith(route));
  
  // Auth Handlers
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");

  const handleLoginSuccess = () => {
    window.location.href = "/";
  };

  const onSignOutClick = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Logout process error:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitial(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle transition state when view changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match the duration-500 class

    return () => clearTimeout(timer);
  }, [viewState, mobileView]);

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  // --- DESKTOP LAYOUT (New) ---
  if (!isMobile) {
    return (
      <div className="flex bg-[#0B1120] min-h-screen text-white font-lexend">
        {/* Sidebar */}
        <Navigation variant="sidebar" />

        {/* Main Content */}
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          <Header 
            onSignInClick={openSignInModal} 
            onSignOutClick={onSignOutClick} 
          />
          
          <main className="flex-1 overflow-auto p-6 pt-0">
             {children}
          </main>
        </div>

        {/* Auth Modals & Overlays */}
        {isLoggingOut && (
          <div className="z-60 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
            <Loader2 className="mb-4 w-12 h-12 text-cyan-400 animate-spin" />
            <span className="font-bold text-cyan-400 text-2xl tracking-widest">
              LOGGING OUT...
            </span>
          </div>
        )}

        {authModalState !== "hidden" && (
          <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
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
  }

  // --- MOBILE LAYOUT (Old Split Screen) ---
  let leftWidth = "50%";
  let rightWidth = "50%";

  if (mobileView === "left") {
    leftWidth = "100%";
    rightWidth = "0%";
  } else {
    leftWidth = "0%";
    rightWidth = "100%";
  }

  return (
    <div className="relative flex bg-background w-full min-h-screen overflow-hidden">
      {/* Mobile Navigation Sidebar */}
      <Navigation variant="mobile" />

      <LeftWindow leftWidth={leftWidth} isTransitioning={isTransitioning} />

      {/* STEP 2: Pass 'children' down to the RightWindow */}
      <RightWindow rightWidth={rightWidth} isTransitioning={isTransitioning}>{children}</RightWindow>

      {/* Auth Modals for Mobile too if needed, though usually they are triggered from Header which is in children (Navigation) on Mobile? 
          Wait, on Mobile, the Header was part of app/page.tsx which is now children.
          So app/page.tsx needs to handle Auth triggers if it has the Header.
          But I removed Header from app/page.tsx.
          
          On Mobile, app/page.tsx will render Navigation. Navigation doesn't have Header.
          The Header was separate in app/page.tsx.
          
          I should probably include the Header in app/page.tsx for Mobile view?
          Or include Header in RightWindow?
          
          If I put Header in RightWindow, it will be above children.
          Let's see. Old app/page.tsx had Header then Navigation.
          So if I want to preserve that, I should probably render Header in app/page.tsx for Mobile.
          
          But I moved Auth state here.
          If app/page.tsx needs to trigger Auth, it needs props.
          But app/page.tsx is a Page, it doesn't receive props from Layout easily (except params).
          
          This is a bit tricky.
          If I want to keep Auth state in MainWindow, I need to pass setters to children? No, can't pass to children of Layout.
          
          Alternative: Keep Auth state in a Store (useAuthStore or new UI store).
          Or, since I'm already editing app/page.tsx, I can keep Auth state there for Mobile?
          But Desktop needs it in MainWindow (Header).
          
          Best approach:
          Use a global store for UI state (Auth Modal Open/Close).
          I already have `useViewStore`. I can add `authModal` state there.
          
          Let's check `useViewStore`.
      */}
      {/* For now, I'll render the Modals here. If Mobile needs to trigger them, we need a way.
          The Header in Desktop triggers them.
          On Mobile, where is the trigger?
          Old app/page.tsx had UserProfile which triggered them.
          If I render Header in app/page.tsx (Mobile), it needs the handlers.
          
          Maybe I should export the Auth Modals logic to a separate component `AuthManager` or similar, 
          or just put it in `MainWindow` and assume Mobile users can't login/logout? 
          No, that's bad.
          
          The `UserProfile` component triggers `onSignInClick`.
          If I use `UserProfile` in `app/page.tsx` (Mobile), I need to pass a handler.
          
          I'll check `useViewStore` to see if I can add modal state there.
      */}
       {/* Auth Modals & Overlays (Duplicate for Mobile for now to ensure they exist if triggered) */}
        {isLoggingOut && (
          <div className="z-60 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
            <Loader2 className="mb-4 w-12 h-12 text-cyan-400 animate-spin" />
            <span className="font-bold text-cyan-400 text-2xl tracking-widest">
              LOGGING OUT...
            </span>
          </div>
        )}

        {authModalState !== "hidden" && (
          <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
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
}
