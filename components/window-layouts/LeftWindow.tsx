import SalesTerminal from "../sales-terminnal/SalesTerminal";
import { WindowLoading } from "./WindowLoading";

interface LeftWindowProps {
  leftWidth: string;
  isTransitioning?: boolean;
}

const LeftWindow = ({ leftWidth, isTransitioning }: LeftWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: leftWidth }}
    >
      <div className="box-border pl-3 pr-1.5 py-3 w-full h-full">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
          {isTransitioning ? (
            <WindowLoading />
          ) : (
            <SalesTerminal />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftWindow;
