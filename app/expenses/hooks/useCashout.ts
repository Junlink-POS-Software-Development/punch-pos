
import { useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "@/app/inventory/hooks/useCategories";
import { ExpenseInput, ExpenseData } from "../lib/expenses.api";

// Helper
const getLocalDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

export function useCashout() {
  const { expenses, addExpense, editExpense, isLoading, isSubmitting } = useExpenses();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Refs
  const refs = {
    amount: useRef<HTMLInputElement | null>(null),
    classification: useRef<HTMLElement | null>(null),
    source: useRef<HTMLSelectElement | null>(null),
    receipt: useRef<HTMLInputElement | null>(null),
    notes: useRef<HTMLTextAreaElement | null>(null),
    date: useRef<HTMLInputElement | null>(null),
    submitBtn: useRef<HTMLButtonElement | null>(null),
  };

  // 2. Form Setup
  const form = useForm<ExpenseInput>({
    defaultValues: {
      transaction_date: getLocalDate(),
      source: "",
      classification: "",
      amount: 0,
      notes: "",
      receipt_no: "",
    },
  });

  const { reset, handleSubmit, setValue } = form;

  // 3. Handlers
  const handleEdit = useCallback((expense: ExpenseData) => {
    setEditingId(expense.id);
    setValue("transaction_date", expense.transaction_date);
    setValue("source", expense.source);
    // Use the ID now available in ExpenseData!
    setValue("classification", expense.classification_id); 
    setValue("amount", expense.amount);
    setValue("receipt_no", expense.receipt_no);
    setValue("notes", expense.notes);
    
    // Optional: Focus logic could be added here if we had access to refs/modal
  }, [setValue]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    reset({
      transaction_date: getLocalDate(),
      amount: 0,
      classification: "",
      source: "",
      receipt_no: "",
      notes: "",
    });
  }, [reset]);

  const onSubmit = async (data: ExpenseInput) => {
    try {
      if (editingId) {
        await editExpense(editingId, data);
        alert("Expense updated successfully!");
        setEditingId(null);
      } else {
        await addExpense(data);
        alert("Expense registered successfully!");
      }

      reset({
        transaction_date: getLocalDate(),
        amount: 0,
        classification: "",
        source: "",
        receipt_no: "",
        notes: "",
      });
      
      // Only focus amount if adding new (keeps flow fast), or maybe for edit too
      setTimeout(() => refs.amount.current?.focus(), 100);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  function handleKeyDown(
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLElement | null>
  ) {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      nextRef.current?.focus();
    }
  }

  // FIX: Helper to set refs from child without mutating props directly
  const setRef = (key: keyof typeof refs, node: HTMLElement | null) => {
    (refs[key] as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  return {
    form,
    refs, // Still needed for reading (passing to handleKeyDown)
    data: {
      expenses,
      categories,
      isLoading,
      isSubmitting,
      isCategoriesLoading,
      editingId, // Expose editing state
    },
    handlers: {
      onSubmit,
      handleKeyDown,
      setRef, 
      handleEdit, // Expose handleEdit
      cancelEdit, // Expose cancelEdit
    },
  };
}
