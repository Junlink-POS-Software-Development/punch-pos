import React from "react";
import { WindowLoading } from "./WindowLoading";

interface RightWindowProps {
  rightWidth: string;
  children: React.ReactNode;
  isTransitioning?: boolean;
}

const RightWindow = ({ rightWidth, children, isTransitioning }: RightWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: rightWidth }}
    >
      <div className="box-border pl-1.5 pr-3 py-3 w-full h-full">
        <div className="border-2 border-border rounded-3xl w-full h-full overflow-hidden relative">
          {isTransitioning ? (
            <WindowLoading />
          ) : (
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightWindow;
