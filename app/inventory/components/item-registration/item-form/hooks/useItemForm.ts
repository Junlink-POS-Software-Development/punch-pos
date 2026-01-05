// app/inventory/components/item-registration/utils/useItemForm.ts

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Item, itemSchema, defaultItemValues } from "../../utils/itemTypes";
import { checkItemExistence } from "../../lib/item.api";

// Props for the hook (Inputs)
interface UseItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
  // REMOVED: setValue is not an input prop, it is an output from the hook
}

export const useItemForm = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}: UseItemFormProps) => {
  
  // 1. Destructure setValue from useForm here
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    setValue, // <--- Get it from React Hook Form
    formState: { errors, isSubmitting },
  } = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: defaultItemValues,
  });

  const isEditing = !!itemToEdit;
  const ignoreId = isEditing && itemToEdit?.id ? itemToEdit.id : undefined;

  // Effect to reset form when itemToEdit changes
  useEffect(() => {
    if (isEditing) {
      reset(itemToEdit);
    } else {
      reset(defaultItemValues);
    }
  }, [itemToEdit, isEditing, reset]);

  // Custom submission logic with async validation
  const onSubmitLogic = async (formData: Item) => {
    console.log("📝 [ItemForm] onSubmitLogic triggered", formData);
    let hasError = false;

    // Check 1: Item Name Existence
    if (formData.itemName) {
      const itemExists = await checkItemExistence(
        "itemName",
        formData.itemName,
        ignoreId
      );
      if (itemExists) {
        setError(
          "itemName",
          {
            type: "custom",
            message: "This Item Name already exists.",
          },
          { shouldFocus: true }
        );
        hasError = true;
      }
    }

    // Check 2: SKU Existence
    if (formData.sku) {
      const skuExists = await checkItemExistence("sku", formData.sku, ignoreId);
      if (skuExists) {
        setError(
          "sku",
          {
            type: "custom",
            message: "This SKU/Barcode already exists.",
          },
          { shouldFocus: !hasError }
        );
        hasError = true;
      }
    }

    if (hasError) {
      return; // Stop submission
    }

    // If all checks pass, call the final submit prop
    onFormSubmit(formData);

    if (!isEditing) {
      reset(defaultItemValues);
    }
  };

  // Custom keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const form = e.currentTarget;

    // Allow Shift + Enter to submit from ANY input or textarea
    if ((target.tagName === "TEXTAREA" || target.tagName === "INPUT") && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
      return;
    }

    if (target.tagName === "INPUT" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const focusableFields = Array.from(
        form.querySelectorAll(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
        )
      ) as HTMLElement[];

      const currentIndex = focusableFields.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableFields.length - 1) {
        focusableFields[currentIndex + 1].focus();
      }
    }
  };

  // Return everything the component needs (Outputs)
  return {
    isEditing,
    register,
    control,
    handleRHFSubmit: handleSubmit(onSubmitLogic),
    handleKeyDown,
    errors,
    isSubmitting,
    onCancelEdit,
    setValue, // <--- Return it so ItemForm can use it
  };
};