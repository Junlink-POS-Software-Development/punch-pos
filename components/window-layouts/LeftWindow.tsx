import SalesTerminal from "../sales-terminnal/SalesTerminal";

interface LeftWindowProps {
  leftWidth: string;
}

const LeftWindow = ({ leftWidth }: LeftWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: leftWidth }}
    >
      <div className="box-border pt-8 pr-4 pb-8 pl-8 w-full h-full">
        <div className="p-1 w-full h-full glass-effect">
          <SalesTerminal />
        </div>
      </div>
    </div>
  );
};

export default LeftWindow;
