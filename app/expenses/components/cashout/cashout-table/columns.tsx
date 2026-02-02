import { createColumnHelper, CellContext } from "@tanstack/react-table";
import { Loader2, Edit, Trash2, Check, X } from "lucide-react";
import { ExpenseData, ExpenseInput } from "../../../lib/expenses.api";
import { DateColumnFilter } from "../components/DateColumnFilter";
import { CategorySelect } from "../../../utils/CategorySelect";
import { ClassificationSelect } from "../../../utils/ClassificationSelect";
import { OptimisticExpenseData } from "./types";

const columnHelper = createColumnHelper<OptimisticExpenseData>();

// Cell component renderers
const DateCell = ({ info }: { info: CellContext<OptimisticExpenseData, string> }) => {
  const { editingId, editValues, handleEditChange } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  return isEditing ? (
    <input
      type="date"
      className="bg-slate-950 px-2 py-1 border border-slate-700 rounded text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 outline-none w-full"
      value={editValues?.transaction_date || ""}
      onChange={(e) => handleEditChange?.("transaction_date", e.target.value)}
    />
  ) : (
    <>{info.getValue()}</>
  );
};

const SourceCell = ({ info }: { info: CellContext<OptimisticExpenseData, string> }) => {
  const { editingId, editValues, handleEditChange, categories } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  return isEditing ? (
    <CategorySelect
      value={editValues?.source || ""}
      onChange={(val: string) => handleEditChange?.("source", val)}
      options={categories || []}
      className="!w-full !px-2 !py-1 !text-xs"
    />
  ) : (
    <span className="font-medium text-cyan-400">{info.getValue()}</span>
  );
};

const ClassificationCell = ({ info }: { info: CellContext<OptimisticExpenseData, string> }) => {
  const { editingId, editValues, handleEditChange } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  return isEditing ? (
    <ClassificationSelect
      value={editValues?.classification || ""}
      onChange={(val) => handleEditChange?.("classification", val)}
      className="!w-full !px-2 !py-1 !text-xs"
    />
  ) : (
    <>{info.getValue()}</>
  );
};

const ReceiptCell = ({ info }: { info: CellContext<OptimisticExpenseData, string> }) => {
  const { editingId, editValues, handleEditChange } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  return isEditing ? (
    <input
      type="text"
      className="bg-slate-950 px-2 py-1 border border-slate-700 rounded text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 outline-none w-full"
      value={editValues?.receipt_no || ""}
      onChange={(e) => handleEditChange?.("receipt_no", e.target.value)}
      placeholder="Receipt #"
    />
  ) : (
    <span className="text-slate-400">{info.getValue() || "-"}</span>
  );
};

const AmountCell = ({ info }: { info: CellContext<OptimisticExpenseData, number> }) => {
  const { editingId, editValues, handleEditChange } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  if (isEditing) {
    return (
      <input
        type="number"
        step="0.01"
        className="bg-slate-950 px-2 py-1 border border-slate-700 rounded text-right text-emerald-400 text-xs focus:ring-1 focus:ring-cyan-500 outline-none w-full font-mono"
        value={editValues?.amount || 0}
        onChange={(e) => handleEditChange?.("amount", parseFloat(e.target.value))}
      />
    );
  }
  
  const val = info.getValue();
  return (
    <div className="font-mono font-medium text-emerald-400 text-right">
      ₱{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  );
};

const NotesCell = ({ info }: { info: CellContext<OptimisticExpenseData, string> }) => {
  const { editingId, editValues, handleEditChange } = info.table.options.meta || {};
  const isEditing = info.row.original.id === editingId;
  
  return isEditing ? (
    <input
      type="text"
      className="bg-slate-950 px-2 py-1 border border-slate-700 rounded text-slate-300 text-xs focus:ring-1 focus:ring-cyan-500 outline-none w-full italic"
      value={editValues?.notes || ""}
      onChange={(e) => handleEditChange?.("notes", e.target.value)}
      placeholder="Notes..."
    />
  ) : (
    <span className="block max-w-[200px] text-slate-500 text-sm truncate italic">
      {info.getValue()}
    </span>
  );
};

const ActionsCell = ({ info }: { info: CellContext<OptimisticExpenseData, unknown> }) => {
  const { editingId, isSaving, startEdit, cancelEdit, saveEdit, onDelete } = info.table.options.meta || {};
  const row = info.row.original;
  const isEditing = row.id === editingId;
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      onDelete?.(row.id);
    }
  };

  return isEditing ? (
    <div className="flex items-center gap-2">
      <button
        onClick={saveEdit}
        disabled={isSaving}
        className="group hover:bg-emerald-400/20 p-1.5 rounded-md text-emerald-400 hover:text-emerald-200 transition-all"
        title="Save Changes"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button
        onClick={cancelEdit}
        disabled={isSaving}
        className="group hover:bg-slate-700 p-1.5 rounded-md text-slate-400 hover:text-slate-200 transition-all"
        title="Cancel Edit"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <button
        onClick={() => startEdit?.(row)}
        className="group hover:bg-blue-400/20 p-1.5 rounded-md text-blue-400 hover:text-blue-200 transition-all"
        title="Edit Record"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="group hover:bg-red-400/20 p-1.5 rounded-md text-red-400 hover:text-red-200 transition-all"
        title="Delete Record"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Column definitions
export const getColumns = () => [
  columnHelper.accessor("transaction_date", {
    header: ({ table }) => {
      const { start, end } = table.options.meta?.dateRange || { start: "", end: "" };
      const onDateChange = table.options.meta?.onDateChange || (() => {});
      return (
        <DateColumnFilter
          startDate={start}
          endDate={end}
          onDateChange={onDateChange}
        />
      );
    },
    cell: (info) => <DateCell info={info} />,
  }),
  columnHelper.accessor("source", {
    header: "Source",
    cell: (info) => <SourceCell info={info} />,
  }),
  columnHelper.accessor("classification", {
    header: "Classification",
    cell: (info) => <ClassificationCell info={info} />,
  }),
  columnHelper.accessor("receipt_no", {
    header: "Receipt",
    cell: (info) => <ReceiptCell info={info} />,
  }),
  columnHelper.accessor("amount", {
    header: () => <div className="text-right">Amount</div>,
    cell: (info) => <AmountCell info={info} />,
  }),
  columnHelper.accessor("notes", {
    header: "Notes",
    cell: (info) => <NotesCell info={info} />,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => <ActionsCell info={info} />,
  }),
];
