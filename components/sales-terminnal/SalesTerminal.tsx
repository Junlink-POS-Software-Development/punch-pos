import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import { useState } from "react";
import { SignIn } from "../sign-in/SignIn";
import { X } from "lucide-react";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSignInVisible, setIsSignInVisible] = useState(false);

  const openSignInModal = () => {
    setIsSignInVisible(true);
    console.log(isSignInVisible);
  };
  const closeSignInModal = () => setIsSignInVisible(false);

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
        <h2 className="text-text-primary">Welcome User!</h2>
      </div>
      <div
        className={`gap-1 grid  ${ScreenLogic()}  w-ful h-full overflow-hidden`}
      >
        <div className="relative flex flex-col w-full h-full">
          {" "}
          <FormFields />
          <TerminalButtons onSignInClick={openSignInModal} />
          <div></div>
        </div>

        <div className="flex justify-center items-center border border-primary-light rounded-2xl overflow-hidden text-white text-5xl">
          TERMINAL CART
        </div>
      </div>
      {isSignInVisible && (
        <div
          // Backdrop
          className="z-40 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeSignInModal} // Close modal on backdrop click
        >
          <div
            // Modal Content wrapper
            // We stop propagation so clicking the modal doesn't close it
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeSignInModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Render the SignIn component */}
            {/* Your SignIn.tsx already includes the glass-effect div */}
            <SignIn />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
