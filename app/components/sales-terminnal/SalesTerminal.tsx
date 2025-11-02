import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        <div className="flex flex-col w-full h-full">
          {" "}
          <FormFields />
          <TerminalButtons />
        </div>

        <div className="flex justify-center items-center border border-primary-light rounded-2xl overflow-hidden text-white text-5xl">
          TERMINAL CART
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
