import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { CartItem } from "../terminal-cart/types";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers";
import { TransactionResult } from "../buttons/handlers/done";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";
import { broadcastStoreEvent } from "@/lib/realtimeBroadcast";
import {
  prependPaymentToQueryCache,
  generateInvoiceNo,
} from "@/app/transactions/lib/paymentCache";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: (overrideFreeMode?: boolean) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: (invoiceNo?: string) => void;

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
  const isSuccessModalOpenRef = useRef(false);
  const presetInvoiceNoRef = useRef<string | null>(null);
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
  // Step 1: Item subtotal (after per-item discounts)
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );

  const [payment, voucher, orderDiscountType, orderDiscountValue, voucherAmount] = useWatch({
    control,
    name: ["payment", "voucher", "orderDiscountType", "orderDiscountValue", "voucherAmount"],
  });

  useEffect(() => {
    // Step 2: Order-level discount
    let orderDiscountAmount = 0;
    if (orderDiscountType && orderDiscountValue) {
      if (orderDiscountType === 'percent') {
        orderDiscountAmount = Math.round(cartTotal * (orderDiscountValue / 100) * 100) / 100;
      } else {
        orderDiscountAmount = orderDiscountValue;
      }
      // Clamp: order discount cannot exceed subtotal
      orderDiscountAmount = Math.min(orderDiscountAmount, cartTotal);
    }
    setValue("orderDiscountAmount", orderDiscountAmount, { shouldValidate: false });

    // Step 3: Grand total = subtotal - order discount
    const grandTotal = Math.max(cartTotal - orderDiscountAmount, 0);
    setValue("grandTotal", grandTotal, { shouldValidate: false });

    // Step 4: Voucher reduces amount due, NOT grand total
    const effectiveVoucher = voucherAmount || 0;
    const amountDue = Math.max(grandTotal - effectiveVoucher, 0);

    // Step 5: Change = cash - amount due
    // Legacy: also account for old `voucher` field for backward compat
    const legacyVoucher = voucher || 0;
    const totalPaid = (payment || 0) + legacyVoucher;
    const changeAmount = totalPaid - amountDue;
    const roundedChange = Math.round(changeAmount * 100) / 100;
    setValue("change", roundedChange, { shouldValidate: false });
  }, [cartTotal, payment, voucher, orderDiscountType, orderDiscountValue, voucherAmount, setValue]);

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
          // Recompute flat discount if discount type/value changed
          if (
            updates.discountType !== undefined ||
            updates.discountValue !== undefined ||
            updates.unitPrice !== undefined ||
            updates.quantity !== undefined
          ) {
            const lineSubtotal = (newItem.unitPrice ?? 0) * (newItem.quantity ?? 0);
            if (newItem.discountType === 'percent') {
              newItem.discount = Math.round(lineSubtotal * ((newItem.discountValue || 0) / 100) * 100) / 100;
            } else {
              newItem.discount = newItem.discountValue || 0;
            }
            // Clamp: discount cannot exceed line subtotal
            newItem.discount = Math.min(newItem.discount, lineSubtotal);
            newItem.total = lineSubtotal - newItem.discount;
          }
          return newItem;
        }
        return item;
      })
    );
  }, []);

  // --- SUBMISSION HANDLER ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data, event) => {

    if (event) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === "INPUT") {
        const name = activeElement.getAttribute("name");
        if (name !== "voucher") return;
      }
    }

    // [VALIDATION] Check if cart is empty
    if (cartItems.length === 0) {
      setErrorMessage("Cannot complete transaction: cart is empty.");
      return;
    }

    if (!user || !user.id) {
      setErrorMessage("Session invalid or expired. Please reload/login.");
      return;
    }

    const totalPayment = (data.payment || 0) + (data.voucher || 0);
    
    // [FIX] Permit zero payment for gifts (cartTotal is 0 but items exist)
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

    const effectiveDate = customTransactionDate
      ? new Date(customTransactionDate)
      : null;

    const finalInvoiceNo =
      presetInvoiceNoRef.current || data.transactionNo || generateInvoiceNo();
    presetInvoiceNoRef.current = null;

    // [UPFRONT INVOICE] Show modal immediately with unique invoice number
    const initialResult: TransactionResult = {
      invoice_no: finalInvoiceNo,
      customer_name: data.customerName || "WALK-IN",
      amount_rendered: data.payment || 0,
      voucher: data.voucher || 0,
      voucher_code: data.voucherCode || null,
      voucher_amount: data.voucherAmount || 0,
      order_discount_amount: data.orderDiscountAmount || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: finalInvoiceNo,
      transaction_time: effectiveDate ? effectiveDate.toISOString() : new Date().toISOString(),
      cashier_name: user.id,
    };
    
    isSuccessModalOpenRef.current = true;
    setSuccessData(initialResult);

    // [OPTIMISTIC PAYMENTS] Instantly prepend the new transaction into the payments cache
    prependPaymentToQueryCache(queryClient, {
      id: finalInvoiceNo,
      transactionNo: finalInvoiceNo,
      transactionTime: new Date(initialResult.transaction_time).toLocaleString(),
      customerName: initialResult.customer_name || "",
      amountRendered: initialResult.amount_rendered,
      voucher: initialResult.voucher,
      grandTotal: initialResult.grand_total,
      change: initialResult.change,
    });

    try {
      // ─── Offline Queue Interception ──────────────────────────────────────────
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        // Build the same payload that handleDone would send to the RPC
        const transactionTime = effectiveDate ? effectiveDate.toISOString() : null;
        const headerPayload = {
          invoice_no: finalInvoiceNo,
          customer_name: data.customerName,
          amount_rendered: data.payment || 0,
          voucher: data.voucher || 0,
          grand_total: data.grandTotal,
          change: data.change,
          transaction_time: transactionTime,
          customer_id: customerId || null,
          order_discount_type: data.orderDiscountType,
          order_discount_value: data.orderDiscountValue,
          order_discount_amount: data.orderDiscountAmount,
          voucher_id: data.voucherId,
          voucher_code: data.voucherCode,
          cashier_name: user.id,
        };
        const itemsPayload = cartItems.map((item) => ({
          sku: item.sku,
          item_name: item.itemName,
          sales_price: item.unitPrice,
          total_price: item.total,
          discount: item.discount || 0,
          quantity: item.quantity,
        }));

        // Save to the offline queue (IndexedDB-backed Zustand store)
        const { useOfflineQueueStore } = await import("@/store/useOfflineQueueStore");
        useOfflineQueueStore.getState().enqueue({
          type: "transaction",
          payload: { headerPayload, itemsPayload },
        });

        if (isSuccessModalOpenRef.current) {
          setSuccessData((prev) => (prev ? { ...prev, isOffline: true } : null));
        }

        setIsSubmitting(false);
        return;
      }
      // ─── End Offline Queue Interception ───────────────────────────────────────

      const result = await handleDone(
        data,
        cartItems,
        user.id,
        effectiveDate,
        customerId,
        finalInvoiceNo
      );

      if (result) {
        setIsSubmitting(false);
        // [CRITICAL FIX]: Only update successData if the modal is STILL open!
        // If the cashier already closed the modal (pressed Enter, Escape, OK),
        // we DO NOT call setSuccessData(result) because that would cause the modal to appear a second time!
        if (isSuccessModalOpenRef.current) {
          setSuccessData((prev) => (prev ? { ...prev, ...result } : null));
        }

        // [OPTIMISTIC PAYMENTS] Update payments cache with confirmed payment_id
        if (result.payment_id) {
          prependPaymentToQueryCache(queryClient, {
            id: result.payment_id,
            transactionNo: result.invoice_no || finalInvoiceNo,
            transactionTime: result.transaction_time
              ? new Date(result.transaction_time).toLocaleString()
              : new Date().toLocaleString(),
            customerName: result.customer_name || "",
            amountRendered: result.amount_rendered ?? 0,
            voucher: result.voucher ?? 0,
            grandTotal: result.grand_total ?? 0,
            change: result.change ?? 0,
          });
        }

        // Broadcast to other computers (e.g. Dashboard) instantly over Realtime WebSocket
        broadcastStoreEvent("TRANSACTION_COMPLETED", {
          grand_total: result.grand_total,
          amount_rendered: result.amount_rendered,
        });

        // [OPTIMISTIC DASHBOARD UPDATE] If the transaction queued offline
        if (result.isOffline) {
          const todayStr = effectiveDate ? effectiveDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          
          queryClient.setQueryData<Record<string, number>>(["dashboard-stats", todayStr], (old) => {
            if (!old) return old;
            
            return {
              ...old,
              grossSales: (old.grossSales || 0) + result.grand_total,
              netSales: (old.netSales || 0) + result.grand_total,
              cashInDrawer: (old.cashInDrawer || 0) + result.amount_rendered, 
              netProfit: (old.netProfit || 0) + result.grand_total, 
            };
          });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }

        // [OPTIMISTIC] Update inventory caching immediately to avoid phantom stocks
        queryClient.setQueryData<{ data?: Array<{ sku: string; current_stock: number; [key: string]: unknown }> }>(
          ["inventory-all-pos"],
          (oldData) => {
            if (!oldData || !oldData.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((inv) => {
                const cartItemQuantity = cartItems
                  .filter((item) => item.sku === inv.sku)
                  .reduce((sum, item) => sum + item.quantity, 0);

                if (cartItemQuantity > 0) {
                  return {
                    ...inv,
                    current_stock: inv.current_stock - cartItemQuantity,
                  };
                }
                return inv;
              }),
            };
          }
        );

        queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
        queryClient.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "payments" });
        queryClient.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "transaction-items" });
        queryClient.refetchQueries({ queryKey: ["payments"], type: "all" });
        queryClient.refetchQueries({ queryKey: ["transaction-items"], type: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard-financial-report"] });
      } else {
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      if (isSuccessModalOpenRef.current) {
        setSuccessData(null); // Clear optimistic data if it failed
      }
      isSuccessModalOpenRef.current = false;
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
    isSuccessModalOpenRef.current = false;
    setSuccessData(null);
    onClear();
  };

  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  const triggerDoneSubmit = (invoiceNo?: string) => {
    if (invoiceNo) {
      presetInvoiceNoRef.current = invoiceNo;
      methods.setValue("transactionNo", invoiceNo);
    }
    handleSubmit(onDoneSubmit, (errors) => {
      console.error("Validation Errors:", JSON.parse(JSON.stringify(errors)));
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
