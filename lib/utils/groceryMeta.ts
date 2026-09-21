// lib/utils/groceryMeta.ts

import { UnitOfMeasure } from "@/lib/types/grocery";

export interface GroceryMeta {
  isWeighed?: boolean;
  unitOfMeasure?: UnitOfMeasure;
  pluCode?: string;
  tareWeight?: number;
  packBarcode?: string;
  packQuantity?: number;
  packSellingPrice?: number;
  isPerishable?: boolean;
}

const GROCERY_META_PREFIX = "<!--GROCERY_META:";
const GROCERY_META_SUFFIX = "-->";

/**
 * Embeds structured grocery metadata into description string
 */
export function embedGroceryMetaInDescription(
  userDescription: string = "",
  meta: GroceryMeta
): string {
  const cleanedDesc = stripGroceryMetaFromDescription(userDescription);

  const metaJson = JSON.stringify({
    is_weighed: meta.isWeighed || false,
    unit_of_measure: meta.unitOfMeasure || "pc",
    plu_code: meta.pluCode?.trim() || undefined,
    tare_weight: meta.tareWeight || 0,
    pack_barcode: meta.packBarcode?.trim() || undefined,
    pack_quantity: meta.packQuantity || 1,
    pack_selling_price: meta.packSellingPrice || undefined,
    is_perishable: meta.isPerishable || false,
  });

  const tag = `${GROCERY_META_PREFIX}${metaJson}${GROCERY_META_SUFFIX}`;
  return cleanedDesc ? `${cleanedDesc}\n${tag}` : tag;
}

/**
 * Strips hidden grocery metadata tag from description for clean display
 */
export function stripGroceryMetaFromDescription(description?: string | null): string {
  if (!description) return "";
  return description
    .replace(/<!--GROCERY_META:[\s\S]*?-->/g, "")
    .trim();
}

/**
 * Extracts grocery metadata from item or its description
 */
export function extractGroceryMeta(item: any): GroceryMeta {
  if (!item) return {};

  const directMeta: GroceryMeta = {
    isWeighed: item.is_weighed ?? item.isWeighed,
    unitOfMeasure: item.unit_of_measure ?? item.unitOfMeasure,
    pluCode: item.plu_code ?? item.pluCode,
    tareWeight: item.tare_weight ?? item.tareWeight,
    packBarcode: item.pack_barcode ?? item.packBarcode,
    packQuantity: item.pack_quantity ?? item.packQuantity,
    packSellingPrice: item.pack_selling_price ?? item.packSellingPrice,
    isPerishable: item.is_perishable ?? item.isPerishable,
  };

  if (
    directMeta.isWeighed !== undefined ||
    directMeta.pluCode !== undefined ||
    directMeta.packBarcode !== undefined
  ) {
    return directMeta;
  }

  // Fallback: extract from description tag
  if (item.description && typeof item.description === "string") {
    const match = item.description.match(/<!--GROCERY_META:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        return {
          isWeighed: parsed.is_weighed,
          unitOfMeasure: parsed.unit_of_measure,
          pluCode: parsed.plu_code,
          tareWeight: parsed.tare_weight,
          packBarcode: parsed.pack_barcode,
          packQuantity: parsed.pack_quantity,
          packSellingPrice: parsed.pack_selling_price,
          isPerishable: parsed.is_perishable,
        };
      } catch (e) {
        console.error("Failed to parse embedded grocery metadata", e);
      }
    }
  }

  return {};
}
