import React from "react";

// STEP 1: Add 'children' to the props interface
interface RightWindowProps {
  rightWidth: string;
  children: React.ReactNode;
}

// STEP 2: Destructure 'children' from props
const RightWindow = ({ rightWidth, children }: RightWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: rightWidth }}
    >
      <div className="box-border pt-8 pr-8 pb-8 pl-4 w-full h-full">
        {/* STEP 3: Render 'children' inside this div.
            I've also added 'overflow-y-auto' so your
            pages can scroll if they are long.
        */}
        <div className="bg-primary-dark p-8 rounded-3xl w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RightWindow;
