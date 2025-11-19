import { useState, useEffect, useMemo } from "react"; // <-- ADD useEffect, useMemo
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useItems } from "@/app/inventory/components/item-registration/context/ItemsContext";
import {
  getDefaultFormValues,
  PosFormValues,
  posSchema,
} from "../../utils/posSchema";
import { CartItem } from "../TerminalCart";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: () => void;
  onRemoveItem: (sku: string) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: () => void;
}

export const usePosForm = (): UsePosFormReturn => {
  const { items: allItems } = useItems();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // State for Live Clock
  const [liveTime, setLiveTime] = useState(
    getDefaultFormValues().transactionTime
  ); // <-- NEW

  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange",
  });

  const {
    getValues,
    setValue,
    reset,
    resetField,
    setFocus,
    handleSubmit,
    watch,
  } = methods;

  // --- LIVE CLOCK EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      // We use the same format as in getDefaultFormValues
      const currentTime = new Date()
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/,/, ""); // Removes comma if present

      setValue("transactionTime", currentTime, {
        shouldValidate: false,
        shouldDirty: false,
      });
      setLiveTime(currentTime); // Update local state for display/debug
    }, 1000); // Update every second

    // Cleanup function
    return () => clearInterval(timer);
  }, [setValue]);

  // --- CALCULATION LOGIC ---

  // 1. Calculate running cart total
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  // 2. Watch payment and voucher fields
  const [payment, voucher] = watch(["payment", "voucher"]);

  // 3. Effect to update Grand Total and Change
  useEffect(() => {
    // a. Update Grand Total
    setValue("grandTotal", cartTotal, { shouldValidate: false });

    // b. Calculate Change
    const grandTotal = cartTotal; // Use the freshly calculated cartTotal
    const paymentAmount = payment || 0;
    const voucherAmount = voucher || 0;

    // Change = Payment + Voucher - Grand Total
    const changeAmount = paymentAmount + voucherAmount - grandTotal;

    // Only update 'change' if the new value is different (optional performance tweak)
    setValue("change", changeAmount, { shouldValidate: false });
  }, [cartTotal, payment, voucher, setValue]); // Recalculate whenever these change

  // 1. Wrapper for Add To Cart
  const onAddToCart = () => {
    handleAddToCart({
      getValues,
      setValue,
      resetField,
      allItems,
      cartItems,
      setCartItems,
    });
  };

  // 2. Wrapper for Clear
  const onClear = () => {
    handleClear({ setCartItems, reset });
    // Optional: Focus back to customer name after clear
    setTimeout(() => setFocus("customerName"), 50);
  };

  // 3. Local Remove Logic
  const onRemoveItem = (sku: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // 4. Wrapper for Done
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data) => {
    // We use your existing handleDone from done.ts
    const success = await handleDone(data, cartItems);

    if (success) {
      // Reuse the clear logic if transaction was successful
      handleClear({ setCartItems, reset });
      setTimeout(() => {
        setFocus("customerName");
      }, 100);
    }
  };

  const triggerDoneSubmit = () => {
    // Check for errors *before* submitting
    methods.trigger().then((isValid) => {
      if (!isValid) {
        console.error("Form Validation Failed:", methods.formState.errors);
      }
    });
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
  };
};
