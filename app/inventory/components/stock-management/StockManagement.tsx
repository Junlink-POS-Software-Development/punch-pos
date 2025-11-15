import { SubmitHandler } from "react-hook-form";
import { StockForm } from "./StockForm";
import { StockFormSchema } from "./utils/types";
import StockTable from "./StockTable";

export function StockManagement() {
  const handleStockSubmit: SubmitHandler<StockFormSchema> = (data) => {
    console.log("Stock data from child form:", data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="p-4 glass-effect">
        <h2 className="mb-2 font-semibold text-xl">Add Stock Entry</h2>
        <p className="mb-6 text-slate-400 text-sm">
          Fill out the form below to record a new stock movement.
        </p>

        <StockForm onSubmit={handleStockSubmit} />
      </div>
      <div className="p-4 glass-effect">
        <StockTable />
      </div>
    </div>
  );
}
