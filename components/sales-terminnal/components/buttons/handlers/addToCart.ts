// app/inventory/components/stock-management/components/buttons/handlers/addToCart.ts
import {
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form";
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema"; // Adjust path as needed
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes"; // Adjust path as needed
import { CartItem } from "../../TerminalCart";

type AddToCartParams = {
  getValues: UseFormGetValues<PosFormValues>;
  setValue: UseFormSetValue<PosFormValues>;
  resetField: UseFormResetField<PosFormValues>;
  allItems: Item[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export const handleAddToCart = ({
  getValues,
  setValue,
  resetField,
  allItems,
  cartItems,
  setCartItems,
}: AddToCartParams) => {
  console.log("--- [addToCart.ts] Executing Add to Cart Logic ---");
  const { barcode, quantity } = getValues();

  // 1. Validation
  if (!barcode) {
    alert("Please select an item first.");
    return;
  }
  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const itemDetails = allItems.find((item) => item.sku === barcode);

  if (!itemDetails) {
    alert("Item not found. Please check the SKU/Barcode.");
    return;
  }

  // 2. Calculate Costs
  const unitPrice = itemDetails.costPrice;
  const total = quantity * unitPrice;

  // 3. Update Cart State
  const existingItemIndex = cartItems.findIndex((item) => item.sku === barcode);

  if (existingItemIndex !== -1) {
    // Update existing item
    setCartItems((prevCart) =>
      prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          const newTotal = item.total + total;
          return { ...item, quantity: newQuantity, total: newTotal };
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
      quantity: quantity,
      total: total,
    };
    setCartItems((prevCart) => [...prevCart, newCartItem]);
  }

  // 4. Reset Fields
  resetField("barcode");
  resetField("quantity");
  setValue("availableStocks", 0);
  console.log("--- [addToCart.ts] Item added successfully ---");
};
