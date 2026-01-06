import { CashFlowEntry } from "../../lib/types";
import { DragHandleProps } from "./DashboardGrid";

interface Props {
  totalNetBalance: number;
  cashFlow: CashFlowEntry[];
  dragHandleProps?: DragHandleProps;
}

const CashOnHand = ({ totalNetBalance, cashFlow, dragHandleProps }: Props) => {
  return (
    <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full overflow-hidden text-white">
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-slate-700/30 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Cash On Hand</h2>
      </div>
      {/* Date no more x here */}
      
      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Total Net Balance</p>
          <p className="font-bold text-emerald-400 text-3xl">
            ₱
            {totalNetBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-3">
          {cashFlow.map((entry) => (
            <div
              key={entry.category}
              className="flex justify-between items-center pb-2 border-slate-700 last:border-0 border-b"
            >
              <span className="text-slate-300">{entry.category}</span>
              <span className="font-medium">
                ₱
                {entry.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CashOnHand;
