// app/inventory/components/stock-management/hooks/usePosForm.ts
import { useState } from "react";
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

  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange",
  });

  const { getValues, setValue, reset, resetField, setFocus, handleSubmit } =
    methods;

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

  // 3. Local Remove Logic (Simple enough to keep here, or move to remove.ts if desired)
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
