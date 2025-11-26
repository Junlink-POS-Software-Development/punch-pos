// app/inventory/components/stock-management/components/form/usePosForm.ts
import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/app/inventory/components/item-registration/context/ItemsContext";
import {
  getDefaultFormValues,
  PosFormValues,
  posSchema,
  generateTransactionNo, // <--- Import this
} from "../../utils/posSchema";
import { CartItem } from "../TerminalCart";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers"; // Ensure TransactionResult is exported from handlers/done
import { TransactionResult } from "../buttons/handlers/done";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: () => Promise<void>; // Changed to async
  onRemoveItem: (sku: string) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: () => void;
  liveTime: string;
  isSubmitting: boolean;
  successData: TransactionResult | null; // <--- ADDED
  closeSuccessModal: () => void; // <--- ADDED
  errorMessage: string | null; // <--- ERROR MESSAGE STATE
  clearErrorMessage: () => void; // <--- CLEAR ERROR
}

export const usePosForm = (): UsePosFormReturn => {
  const queryClient = useQueryClient();
  const { items: allItems } = useItems();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [successData, setSuccessData] = useState<TransactionResult | null>(
    null
  ); // <--- STATE FOR MODAL
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // <--- ERROR STATE

  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: {
      ...getDefaultFormValues(),
      transactionNo: "", // <--- Initialize empty to avoid hydration mismatch
    },
    mode: "onBlur", // Changed from onChange to improve INP - validates on blur instead of every keystroke
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

  // ... (Existing useEffect for LIVE CLOCK - Keep as is) ...
  useEffect(() => {
    // Generate transaction number on client side only
    setValue("transactionNo", generateTransactionNo());

    const getNow = () =>
      new Date()
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/,/, "");

    const initialTimeout = setTimeout(() => setLiveTime(getNow()), 0);
    const timer = setInterval(() => setLiveTime(getNow()), 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, [setValue]);

  // ... (Existing Calculation Logic - Keep as is) ...
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );
  const [payment, voucher] = useWatch({
    control,
    name: ["payment", "voucher"],
  });

  useEffect(() => {
    setValue("grandTotal", cartTotal, { shouldValidate: false });
    const changeAmount = (payment || 0) + (voucher || 0) - cartTotal;
    setValue("change", changeAmount, { shouldValidate: false });
  }, [cartTotal, payment, voucher, setValue]);

  const onAddToCart = async () => {
    await handleAddToCart({
      getValues,
      setValue,
      resetField,
      allItems,
      cartItems,
      setCartItems,
      onError: (message) => setErrorMessage(message), // Pass error handler
    });
  };

  const onClear = () => {
    handleClear({ setCartItems, reset });
    setTimeout(() => setFocus("customerName"), 50);
  };

  const onRemoveItem = (sku: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // --- SUBMISSION HANDLER ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data) => {
    if (!data.payment || data.payment <= 0) {
      setErrorMessage("Payment must be greater than zero.");
      return;
    }
    if (data.change < 0) {
      setErrorMessage("Insufficient payment amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Perform the transaction
      // result is now the Payload Object (or null)
      const result = await handleDone(data, cartItems);

      if (result) {
        setIsSubmitting(false);

        // 2. SET SUCCESS DATA (Opens Modal) - Do NOT clear form yet
        setSuccessData(result);

        // 3. Invalidate Queries (Background update)
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["transaction-items"] });
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("❌ [UI CRASH] Error in submission flow:", error);
      setErrorMessage("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // This is called when the user clicks "Close" on the Modal
  const closeSuccessModal = () => {
    setSuccessData(null);
    onClear(); // NOW we clear the form for the next customer
  };

  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  const triggerDoneSubmit = () => {
    handleSubmit(onDoneSubmit)();
  };

  return {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onClear,
    onDoneSubmit,
    triggerDoneSubmit,
    liveTime,
    isSubmitting,
    successData, // Exported
    closeSuccessModal, // Exported
    errorMessage, // Exported
    clearErrorMessage, // Exported
  };
};
