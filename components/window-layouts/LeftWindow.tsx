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
      <div className="box-border pt-4 pr-2 pb-4 pl-4 w-full h-full">
        <div className="p-1 w-full h-full glass-effect">
          {/* Wrapped with InventoryProvider for shared inventory data */}
            <SalesTerminal />
        </div>
      </div>
    </div>
  );
};

export default LeftWindow;
