// app/inventory/components/stock-management/components/buttons/handlers/addToCart.ts
import {
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form";
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { CartItem } from "../../TerminalCart";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";

type AddToCartParams = {
  getValues: UseFormGetValues<PosFormValues>;
  setValue: UseFormSetValue<PosFormValues>;
  resetField: UseFormResetField<PosFormValues>;
  allItems: Item[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onError?: (message: string) => void; // Optional error callback
  inventoryData: InventoryItem[]; // Receive inventory from context
};

export const handleAddToCart = ({
  getValues,
  resetField,
  allItems,
  cartItems,
  setCartItems,
  onError,
  inventoryData, // Receive from context
}: AddToCartParams) => {
  console.log("--- [addToCart.ts] Executing Add to Cart Logic ---");

  // 1. Get values
  const { barcode, quantity, discount } = getValues();
  const discountValue = discount || 0; // Ensure 0 if undefined/null

  // 2. Validation
  if (!barcode) {
    onError?.("Please select an item first.");
    return;
  }
  if (!quantity || quantity <= 0) {
    onError?.("Please enter a valid quantity.");
    return;
  }

  const itemDetails = allItems.find((item) => item.sku === barcode);

  if (!itemDetails) {
    onError?.("Item not found. Please check the SKU/Barcode.");
    return;
  }

  // 3. STOCK VALIDATION - Use inventory data from context (no fetch!)
  const stockInfo = inventoryData.find((inv) => inv.sku === barcode);

  if (!stockInfo) {
    onError?.("Stock information not available for this item.");
    // Clear fields on error
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  // Check if item is out of stock
  if (stockInfo.current_stock <= 0) {
    onError?.(`OUT OF STOCK: ${itemDetails.itemName} has no available stock.`);
    // Clear fields on error
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  // Calculate total quantity (existing in cart + new quantity)
  const existingItemIndex = cartItems.findIndex((item) => item.sku === barcode);
  const quantityInCart = existingItemIndex !== -1 ? cartItems[existingItemIndex].quantity : 0;
  const totalQuantity = quantityInCart + quantity;

  // Check if total quantity exceeds available stock
  if (totalQuantity > stockInfo.current_stock) {
    const remainingStock = stockInfo.current_stock - quantityInCart;
    if (remainingStock <= 0) {
      onError?.(`INSUFFICIENT STOCK: ${itemDetails.itemName} has ${stockInfo.current_stock} units available, but you already have ${quantityInCart} in the cart.`);
    } else {
      onError?.(`INSUFFICIENT STOCK: ${itemDetails.itemName} has only ${stockInfo.current_stock} units available. You have ${quantityInCart} in cart. You can add ${remainingStock} more.`);
    }
    // Clear fields on error
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  console.log(`✅ Stock check passed: ${itemDetails.itemName} - Requested: ${totalQuantity}, Available: ${stockInfo.current_stock}`);

  // 4. Calculate Costs
  // Logic: (Qty * Price) - Discount
  const unitPrice = itemDetails.costPrice;
  const total = quantity * unitPrice - discountValue;

  // 5. Update Cart State
  // Reuse existingItemIndex from stock validation (line 78)

  if (existingItemIndex !== -1) {
    // Update existing item
    setCartItems((prevCart) =>
      prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          // Request 1: Accumulate discount properly
          const newDiscount = (item.discount || 0) + discountValue;
          const newTotal = item.total + total;

          return {
            ...item,
            quantity: newQuantity,
            discount: newDiscount,
            total: newTotal,
          };
        }
        return item;
      })
    );
  } else {
    // Add new item
    const newCartItem: CartItem = {
      id: barcode,
      sku: barcode,
      itemName: itemDetails.itemName,
      unitPrice: unitPrice,
      discount: discountValue, // Request 1: Ensure discount is passed
      quantity: quantity,
      total: total,
    };
    setCartItems((prevCart) => [...prevCart, newCartItem]);
  }

  // 6. Reset Fields
  resetField("barcode");
  resetField("quantity");
  resetField("discount"); // Request 2: Clear discount field

  console.log("--- [addToCart.ts] Item added successfully ---");
};
