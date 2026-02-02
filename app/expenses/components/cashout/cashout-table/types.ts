import { RowData } from "@tanstack/react-table";
import { ExpenseData, ExpenseInput } from "../../../lib/expenses.api";
import { CategoryItem } from "../CashoutForm";

// Extended expense type with optimistic flags
export type OptimisticExpenseData = ExpenseData & {
  _optimistic?: boolean;
  _syncing?: boolean;
};

export interface CashoutTableProps {
  expenses: (ExpenseData & { _optimistic?: boolean; _syncing?: boolean })[];
  isLoading: boolean;
  dateRange: { start: string; end: string };
  onDateChange: (start: string, end: string) => void;
  onAdd?: () => void;
  isAdding?: boolean;
  onDelete?: (id: string) => void;
  categories?: CategoryItem[];
  onUpdate?: (id: string, data: ExpenseInput) => Promise<void>;
  // For infinite scroll
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  totalRecords?: number;
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    dateRange: { start: string; end: string };
    onDateChange: (start: string, end: string) => void;
    editingId: string | null;
    editValues: ExpenseInput | null;
    isSaving: boolean;
    categories: CategoryItem[];
    handleEditChange: (field: keyof ExpenseInput, value: any) => void;
    startEdit: (expense: ExpenseData) => void;
    cancelEdit: () => void;
    saveEdit: () => Promise<void>;
    onDelete?: (id: string) => void;
  }
}
