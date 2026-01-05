import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSWRConfig } from "swr";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
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
  onUpdateItem: (sku: string, updates: Partial<CartItem>) => void;
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
  const { mutate } = useSWRConfig();
  const { user } = useAuthStore(); // <--- 2. GET USER FROM CONTEXT
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [successData, setSuccessData] = useState<TransactionResult | null>(
    null
  );
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

  const onUpdateItem = (sku: string, updates: Partial<CartItem>) => {
    setCartItems((prevCart) =>
      prevCart.map((item) => {
        if (item.sku === sku) {
          const newItem = { ...item, ...updates };
          // Recalculate total if price or quantity changes
          if (updates.unitPrice !== undefined || updates.quantity !== undefined || updates.discount !== undefined) {
             newItem.total = (newItem.unitPrice * newItem.quantity) - (newItem.discount || 0);
          }
          return newItem;
        }
        return item;
      })
    );
  };

  // --- SUBMISSION HANDLER ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data, event) => {
    console.log("📝 [Form] onDoneSubmit triggered", data);

    // Prevent submission on Enter key for non-voucher inputs
    if (event) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === "INPUT") {
        const name = activeElement.getAttribute("name");
        console.log(`[Form] Submission attempt from input: ${name}`);
        if (name !== "voucher") {
          console.log(
            "[Form] Blocking submission from non-voucher input. Only voucher input can trigger submit via Enter."
          );
          return;
        }
      }
    }

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
      const result = await handleDone(data, cartItems, user.id);

      console.log("📝 [Form] handleDone result:", result);

      if (result) {
        setIsSubmitting(false);
        setSuccessData(result);

        mutate((key) => Array.isArray(key) && key[0] === "payments");
        mutate((key) => Array.isArray(key) && key[0] === "transaction-items");
        mutate("dashboard-metrics");
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
    onUpdateItem,
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
