import { Plus, XCircle } from "lucide-react";

interface CashoutTableHeaderProps {
  onAdd?: () => void;
  isAdding?: boolean;
  recordCount: number;
  totalRecords?: number;
  hasActiveFilter?: boolean;
}

export const CashoutTableHeader = ({
  onAdd,
  isAdding,
  recordCount,
  totalRecords,
  hasActiveFilter,
}: CashoutTableHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-slate-950/20 border-b border-slate-800/50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-gray-100 text-lg tracking-tight uppercase font-lexend">
            Expense Records
          </h3>
          {onAdd && (
            <button
              onClick={onAdd}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-lg active:scale-95 border border-blue-400/20 ${
                isAdding
                  ? "bg-slate-700 hover:bg-slate-600 shadow-slate-900/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
              }`}
            >
              {isAdding ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  Close Form
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Record New Expense
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasActiveFilter && (
          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">
            Filtered
          </span>
        )}
        <div className="text-sm font-medium text-gray-500 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/30">
          {totalRecords !== undefined ? (
            <>
              Showing <span className="text-gray-300 font-bold">{recordCount}</span> of{" "}
              <span className="text-gray-300">{totalRecords}</span> records
            </>
          ) : (
            <>
              Total: <span className="text-gray-300 font-bold">{recordCount}</span> records
            </>
          )}
        </div>
      </div>
    </div>
  );
};
