import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore";

import {
  getDefaultFormValues,
  PosFormValues,
  posSchema,
} from "../../utils/posSchema";
import { CartItem } from "../TerminalCart";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers";
import { TransactionResult } from "../buttons/handlers/done";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: (overrideFreeMode?: boolean) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: () => void;

  isSubmitting: boolean;
  successData: TransactionResult | null;
  closeSuccessModal: () => void;
  errorMessage: string | null;
  clearErrorMessage: () => void;
  // [NEW] Export Customer State
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
  // [NEW] Free Mode
  isFreeMode: boolean;
  toggleFreeMode: () => void;
}

export const usePosForm = (): UsePosFormReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { customTransactionDate } = useTransactionStore();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();

  // [NEW] Customer State
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false); // [NEW] Loading state
  const [isFreeMode, setIsFreeMode] = useState(false); // [NEW] Free Mode state

  const [successData, setSuccessData] = useState<TransactionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // [NEW] Load Cart from LocalStorage on Mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pos-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from local storage:", error);
      }
    }
    setIsCartLoaded(true);
  }, []);

  // [NEW] Save Cart to LocalStorage on Change (only after load)
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem("pos-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isCartLoaded]);

  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: {
      ...getDefaultFormValues(),
      transactionNo: "",
    },
    mode: "onBlur",
  });

  const {
    getValues,
    setValue,
    reset,
    resetField,
    setFocus,
    handleSubmit,
    control,
  } = methods;

  // --- CALCULATIONS ---
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );
  const [payment, voucher] = useWatch({
    control,
    name: ["payment", "voucher"],
  });

  useEffect(() => {
    setValue("grandTotal", cartTotal - (voucher || 0), { shouldValidate: false });
    const changeAmount = (payment || 0) + (voucher || 0) - cartTotal;
    const roundedChange = Math.round(changeAmount * 100) / 100;
    setValue("change", roundedChange, { shouldValidate: false });
  }, [cartTotal, payment, voucher, setValue]);

  /* Update onAddToCart to accept override */
  const onAddToCart = useCallback((overrideFreeMode?: boolean) => {
    handleAddToCart({
      getValues,
      setValue,
      resetField,
      allItems,
      cartItems,
      setCartItems,
      onError: (message) => setErrorMessage(message),
      inventoryData,
      isFreeMode: typeof overrideFreeMode === 'boolean' ? overrideFreeMode : isFreeMode,
    });
  }, [getValues, setValue, resetField, allItems, cartItems, inventoryData, isFreeMode]);

  const onClear = useCallback(() => {
    console.log("🧹 [Form] onClear triggered");
    handleClear({ setCartItems, reset });
    setCustomerId(null);
    localStorage.removeItem("pos-cart"); // Clear localStorage on clear
    setTimeout(() => setFocus("customerName"), 50);
  }, [reset, setCustomerId, setFocus]);

  const onRemoveItem = useCallback((id: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  const onUpdateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setCartItems((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, ...updates };
          if (
            updates.unitPrice !== undefined ||
            updates.quantity !== undefined ||
            updates.discount !== undefined
          ) {
            newItem.total =
              newItem.unitPrice * newItem.quantity - (newItem.discount || 0);
          }
          return newItem;
        }
        return item;
      })
    );
  }, []);

  // --- SUBMISSION HANDLER ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data, event) => {
    console.log("📝 [Form] onDoneSubmit triggered", data);

    if (event) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === "INPUT") {
        const name = activeElement.getAttribute("name");
        if (name !== "voucher") return;
      }
    }

    if (!user || !user.id) {
      setErrorMessage("Session invalid or expired. Please reload/login.");
      return;
    }

    const totalPayment = (data.payment || 0) + (data.voucher || 0);
    // If cart total is 0 (all free), payment can be 0.
    if (totalPayment <= 0 && cartTotal > 0) { 
       // Only enforce payment > 0 if cartTotal > 0. 
       // If cartTotal is 0, payment can be 0.
       // However, the original code enforced > 0.
       // If user gives free items, total is 0. Payment 0 + Voucher 0 = 0.
       // Change logic:
    }
    
    // [FIX] Validating payment for free items
    if (cartTotal > 0 && totalPayment <= 0) {
      setErrorMessage(
        "Total payment (Cash + Voucher) must be greater than zero."
      );
      return;
    }
    
    if (data.change < 0) {
      setErrorMessage("Insufficient payment amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      // [NEW] Pass customerId and customTransactionDate
      const effectiveDate = customTransactionDate
        ? new Date(customTransactionDate)
        : null;

      const result = await handleDone(
        data,
        cartItems,
        user.id,
        effectiveDate,
        customerId
      );

      console.log("📝 [Form] handleDone result:", result);

      if (result) {
        setIsSubmitting(false);
        setSuccessData(result);

        queryClient.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "payments" });
        queryClient.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "transaction-items" });
        queryClient.invalidateQueries({ queryKey: ["dashboard-financial-report"] });
      } else {
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ [UI CRASH] Error in submission flow:", error);
        setErrorMessage(error.message);
      } else {
        console.error("❌ [UI CRASH] Unknown error:", error);
        setErrorMessage("An unexpected error occurred.");
      }
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessData(null);
    onClear();
  };

  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  const triggerDoneSubmit = () => {
    handleSubmit(onDoneSubmit, (errors) => {
      console.error("Validation Errors:", errors);
      setErrorMessage("Please check all fields. Some values are invalid.");
    })();
  };
  
  const toggleFreeMode = () => setIsFreeMode(!isFreeMode);

  return {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
    onClear,
    onDoneSubmit,
    triggerDoneSubmit,

    isSubmitting,
    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
    customerId, // [NEW]
    setCustomerId, // [NEW]
    isFreeMode, // [NEW]
    toggleFreeMode, // [NEW]
  };
};
