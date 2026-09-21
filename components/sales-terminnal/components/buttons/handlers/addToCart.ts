// app/inventory/components/stock-management/components/buttons/handlers/addToCart.ts
import {
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form";
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { CartItem } from "../../terminal-cart/types";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";
import { parseScaleBarcode } from "@/lib/utils/scaleBarcode";
import { playScanSuccess, playScanError } from "@/lib/utils/scanSounds";
import { extractGroceryMeta } from "@/lib/utils/groceryMeta";

// 22: Added isFreeMode to type
type AddToCartParams = {
  getValues: UseFormGetValues<PosFormValues>;
  setValue: UseFormSetValue<PosFormValues>;
  resetField: UseFormResetField<PosFormValues>;
  allItems: Item[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onError?: (message: string) => void; // Optional error callback
  inventoryData: InventoryItem[]; // Receive inventory from context
  isFreeMode?: boolean; // [NEW] Free Mode flag
};

export const handleAddToCart = ({
  getValues,
  resetField,
  allItems,
  cartItems,
  setCartItems,
  onError,
  inventoryData, // Receive from context
  isFreeMode = false, // [NEW] Default to false
}: AddToCartParams) => {
  console.log("--- [addToCart.ts] Executing Add to Cart Logic ---");

  // 1. Get values
  const { barcode: rawBarcode, quantity: rawQuantity, discount } = getValues();
  const discountValue = discount || 0; // Ensure 0 if undefined/null

  // 2. Validation
  if (!rawBarcode) {
    playScanError();
    onError?.("Please select an item first.");
    return;
  }

  // Check for quantity multiplier prefix (e.g. "12*480001" or "6x480001")
  let barcode = rawBarcode.trim();
  let quantityMultiplier = 1;
  const multiplierMatch = barcode.match(/^(\d+)[\*xX](.+)$/);
  if (multiplierMatch) {
    quantityMultiplier = parseInt(multiplierMatch[1], 10) || 1;
    barcode = multiplierMatch[2].trim();
  }

  const effectiveQuantity = (rawQuantity && rawQuantity > 0 ? rawQuantity : 1) * quantityMultiplier;

  // Check if barcode is a GS1 Price-Embedded or Weight-Embedded scale barcode (e.g. 2004011015507)
  const scaleBarcode = parseScaleBarcode(barcode);
  let itemDetails: Item | undefined = undefined;
  let isWeighedScaleScan = false;
  let scaleCalculatedQty = effectiveQuantity;
  let scaleCalculatedTotal: number | null = null;
  let isMultiPackScan = false;
  let multiPackQty = 1;
  let multiPackPrice: number | null = null;

  if (scaleBarcode) {
    // Find item matching PLU or SKU
    itemDetails = allItems.find((item) => {
      const gMeta = extractGroceryMeta(item);
      const plu = item.pluCode || gMeta.pluCode || item.sku;
      return (
        plu === scaleBarcode.pluCode ||
        item.sku === scaleBarcode.pluCode ||
        item.sku.replace(/^0+/, "") === scaleBarcode.pluCode
      );
    });

    if (itemDetails) {
      isWeighedScaleScan = true;
      const basePrice = itemDetails.sellingPrice ?? itemDetails.salesPrice ?? 0;
      if (scaleBarcode.embeddedType === "price") {
        scaleCalculatedTotal = scaleBarcode.embeddedValue;
        scaleCalculatedQty = basePrice > 0 ? Math.round((scaleBarcode.embeddedValue / basePrice) * 1000) / 1000 : 1;
      } else {
        scaleCalculatedQty = scaleBarcode.embeddedValue;
        scaleCalculatedTotal = Math.round(scaleCalculatedQty * basePrice * 100) / 100;
      }
    }
  }

  // If not scale barcode, check standard SKU match or multi-pack barcode
  if (!itemDetails) {
    // Direct SKU match
    itemDetails = allItems.find((item) => item.sku === barcode);

    // If not direct SKU, check multi-pack barcode
    if (!itemDetails) {
      itemDetails = allItems.find((item) => {
        const gMeta = extractGroceryMeta(item);
        return (
          (item.packBarcode && item.packBarcode === barcode) ||
          (gMeta.packBarcode && gMeta.packBarcode === barcode)
        );
      });

      if (itemDetails) {
        isMultiPackScan = true;
        const gMeta = extractGroceryMeta(itemDetails);
        multiPackQty = itemDetails.packQuantity || gMeta.packQuantity || 1;
        multiPackPrice =
          itemDetails.packSellingPrice ??
          gMeta.packSellingPrice ??
          (itemDetails.sellingPrice ?? itemDetails.salesPrice ?? 0) * multiPackQty;
      }
    }
  }

  if (!itemDetails) {
    playScanError();
    onError?.("Item not found. Please check the SKU/Barcode.");
    return;
  }

  // 3. STOCK VALIDATION - Use target SKU from itemDetails
  const targetSku = itemDetails.sku;
  const stockInfo = inventoryData.find((inv) => inv.sku === targetSku);

  if (!stockInfo) {
    playScanError();
    onError?.("Stock information not available for this item.");
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  // Check if item is out of stock
  if (stockInfo.current_stock <= 0) {
    playScanError();
    onError?.(`OUT OF STOCK: ${itemDetails.itemName} has no available stock.`);
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  // Calculate stock requirement (multi-pack consumes N units, weighed consumes by unit or fractional kg)
  const requiredStockUnits = isMultiPackScan ? effectiveQuantity * multiPackQty : effectiveQuantity;

  const quantityInCart = cartItems
    .filter((item) => item.sku === targetSku)
    .reduce((sum, item) => sum + (item.packQuantity ? item.quantity * item.packQuantity : item.quantity), 0);

  const totalStockRequired = quantityInCart + requiredStockUnits;

  if (totalStockRequired > stockInfo.current_stock) {
    playScanError();
    const remainingStock = stockInfo.current_stock - quantityInCart;
    if (remainingStock <= 0) {
      onError?.(`INSUFFICIENT STOCK: ${itemDetails.itemName} has ${stockInfo.current_stock} units available, but you already have ${quantityInCart} in the cart.`);
    } else {
      onError?.(`INSUFFICIENT STOCK: ${itemDetails.itemName} has only ${stockInfo.current_stock} units available. You have ${quantityInCart} in cart. You can add ${remainingStock} more.`);
    }
    resetField("barcode");
    resetField("quantity");
    resetField("discount");
    return;
  }

  console.log(`✅ Stock check passed: ${itemDetails.itemName} - Requested: ${totalStockRequired}, Available: ${stockInfo.current_stock}`);

  // 4. Calculate Costs & Line Properties
  let finalItemName = itemDetails.itemName;
  let finalQuantity = effectiveQuantity;
  let finalUnitPrice = isFreeMode ? 0 : (itemDetails.sellingPrice ?? itemDetails.salesPrice ?? 0);
  let finalTotal = finalQuantity * finalUnitPrice - discountValue;
  const gMeta = extractGroceryMeta(itemDetails);

  if (isWeighedScaleScan) {
    finalQuantity = scaleCalculatedQty;
    finalTotal = scaleCalculatedTotal !== null
      ? Math.max(0, scaleCalculatedTotal - discountValue)
      : Math.round(finalQuantity * finalUnitPrice * 100) / 100 - discountValue;
  } else if (isMultiPackScan) {
    finalItemName = `${itemDetails.itemName} (${multiPackQty}-Pack)`;
    finalUnitPrice = isFreeMode ? 0 : (multiPackPrice !== null ? multiPackPrice : finalUnitPrice * multiPackQty);
    finalTotal = finalQuantity * finalUnitPrice - discountValue;
  }

  // 5. Update Cart State
  const cartRowId = isWeighedScaleScan
    ? `${targetSku}-weighed-${Date.now()}`
    : isMultiPackScan
    ? `${targetSku}-pack-${multiPackQty}-${finalUnitPrice}`
    : `${targetSku}-${finalUnitPrice}`;

  const existingItemIndex = isWeighedScaleScan
    ? -1 // Don't merge distinct weighed items, keep separate weighed line entries
    : cartItems.findIndex(
        (item) => item.sku === targetSku && item.unitPrice === finalUnitPrice && (item.packQuantity || 1) === (isMultiPackScan ? multiPackQty : 1)
      );

  if (existingItemIndex !== -1) {
    // Update existing item
    setCartItems((prevCart) =>
      prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + finalQuantity;
          const newDiscount = (item.discount || 0) + discountValue;
          const newTotal = item.total + finalTotal;

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
      id: cartRowId,
      sku: targetSku,
      itemName: finalItemName,
      unitPrice: finalUnitPrice,
      discountType: 'flat',
      discountValue: discountValue,
      discount: discountValue,
      quantity: finalQuantity,
      total: finalTotal,
      // Pharmacy fields
      genericName: itemDetails.genericName || (stockInfo as any).generic_name || undefined,
      dosage: itemDetails.dosage || (stockInfo as any).dosage || undefined,
      formulation: itemDetails.formulation || (stockInfo as any).formulation || undefined,
      isRx: itemDetails.isRx || (stockInfo as any).is_rx || false,
      batchNumber: itemDetails.batchNumber || (stockInfo as any).batch_number || undefined,
      expiryDate: itemDetails.expiryDate || (stockInfo as any).expiry_date || undefined,
      // Grocery fields
      isWeighed: isWeighedScaleScan || itemDetails.isWeighed || gMeta.isWeighed || false,
      unitOfMeasure: itemDetails.unitOfMeasure || gMeta.unitOfMeasure || (isWeighedScaleScan ? "kg" : "pc"),
      tareWeight: itemDetails.tareWeight || gMeta.tareWeight || 0,
      packQuantity: isMultiPackScan ? multiPackQty : undefined,
      isPerishable: itemDetails.isPerishable || gMeta.isPerishable || false,
    };
    setCartItems((prevCart) => [...prevCart, newCartItem]);
  }

  // Play scanner chime
  playScanSuccess();

  // 6. Reset Fields
  resetField("barcode");
  resetField("quantity");
  resetField("discount");

  console.log("--- [addToCart.ts] Item added successfully ---");
};
