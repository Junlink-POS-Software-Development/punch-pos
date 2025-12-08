import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/inventory/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore"; // <--- 1. IMPORT AUTH CONTEXT
import {
  getDefaultFormValues,
  PosFormValues,
  posSchema,
  generateTransactionNo,
} from "../../utils/posSchema";
import { CartItem } from "../TerminalCart";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers"; 
import { TransactionResult } from "../buttons/handlers/done";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: () => void;
  onRemoveItem: (sku: string) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: () => void;
  liveTime: string;
  isSubmitting: boolean;
  successData: TransactionResult | null;
  closeSuccessModal: () => void;
  errorMessage: string | null;
  clearErrorMessage: () => void;
}

export const usePosForm = (): UsePosFormReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore(); // <--- 2. GET USER FROM CONTEXT
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [successData, setSuccessData] = useState<TransactionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // --- LIVE CLOCK ---
  useEffect(() => {
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
    setValue("grandTotal", cartTotal, { shouldValidate: false });
    const changeAmount = (payment || 0) + (voucher || 0) - cartTotal;
    setValue("change", changeAmount, { shouldValidate: false });
  }, [cartTotal, payment, voucher, setValue]);

  const onAddToCart = () => {
    handleAddToCart({
      getValues,
      setValue,
      resetField,
      allItems,
      cartItems,
      setCartItems,
      onError: (message) => setErrorMessage(message),
      inventoryData,
    });
  };

  const onClear = () => {
    console.log("🧹 [Form] onClear triggered");
    handleClear({ setCartItems, reset });
    setTimeout(() => setFocus("customerName"), 50);
  };

  const onRemoveItem = (sku: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // --- SUBMISSION HANDLER ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data) => {
    console.log("📝 [Form] onDoneSubmit triggered", data);
    
    // 3. VALIDATE USER SESSION
    if (!user || !user.id) {
      setErrorMessage("Session invalid or expired. Please reload/login.");
      return;
    }

    const totalPayment = (data.payment || 0) + (data.voucher || 0);
    if (totalPayment <= 0) {
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
      // 4. PASS USER ID TO HANDLER (Removes the need for supabase.auth.getSession())
      // Ensure you have updated 'done.ts' to accept this 3rd argument!
      const result = await handleDone(data, cartItems, user.id);
      
      console.log("📝 [Form] handleDone result:", result);

      if (result) {
        setIsSubmitting(false);

        // Set success data to open modal
        setSuccessData(result);

        // Invalidate queries to refresh history tables
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["transaction-items"] });
        // Also refresh dashboard metrics if needed
        queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }); 
      } else {
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("❌ [UI CRASH] Error in submission flow:", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    console.log("❎ [Form] closeSuccessModal triggered");
    setSuccessData(null);
    onClear(); // Clear form for next customer
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
    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
  };
};