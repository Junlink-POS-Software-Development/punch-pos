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
      <div className="box-border p-8 w-full h-full">
        <div className="bg-primary-dark w-full h-full">
          <SalesTerminal />
        </div>
      </div>
    </div>
  );
};

export default LeftWindow;
