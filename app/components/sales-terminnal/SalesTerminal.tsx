import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";

const SalesTerminal = () => {
  const { isSplit } = useView();
  console.log(isSplit);

  return (
    <div className="flex flex-col p-1 border-2 border-white h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary">POINT OF SALE</h1>
        <h2 className="text-text-primary">Welcome User!</h2>
      </div>
      <div
        className={`gap-1 grid  ${
          isSplit ? "grid-rows-2" : "grid-cols-2"
        }  border w-ful h-full overflow-hidden`}
      >
        <div className="flex flex-col border border-green-400 w-full h-full">
          {" "}
          <FormFields />
          <div className="border border-amber-100 w-full h-full grow">
            <button className="btn-3d-glass">Press Me</button>
          </div>
        </div>

        <div className="flex justify-center items-center border-2 border-amber-100 overflow-hidden text-white text-5xl">
          TERMINAL CART
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
