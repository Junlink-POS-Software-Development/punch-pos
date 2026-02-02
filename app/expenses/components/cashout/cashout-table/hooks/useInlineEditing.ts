import { useState, useCallback } from "react";
import { ExpenseData, ExpenseInput } from "../../../../lib/expenses.api";

interface UseInlineEditingProps {
  onUpdate?: (id: string, data: ExpenseInput) => Promise<void>;
}

export function useInlineEditing({ onUpdate }: UseInlineEditingProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ExpenseInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = useCallback((expense: ExpenseData) => {
    setEditingId(expense.id);
    setEditValues({
      transaction_date: expense.transaction_date,
      source: expense.source,
      classification: expense.classification_id,
      amount: expense.amount,
      receipt_no: expense.receipt_no || "",
      notes: expense.notes || "",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValues(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId || !editValues || !onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(editingId, editValues);
      setEditingId(null);
      setEditValues(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }, [editingId, editValues, onUpdate]);

  const handleEditChange = useCallback((field: keyof ExpenseInput, value: any) => {
    setEditValues((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  return {
    editingId,
    editValues,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    handleEditChange,
  };
}
