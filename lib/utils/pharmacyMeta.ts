// lib/utils/pharmacyMeta.ts

export type BrandType = 'branded' | 'generic';

export interface PharmacyMeta {
  genericName?: string;
  dosage?: string;
  formulation?: string;
  isRx?: boolean;
  brandType?: BrandType;
  batchNumber?: string;
  expiryDate?: string;
}

const META_PREFIX = "<!--PHARMACY_META:";
const META_SUFFIX = "-->";

/**
 * Embeds structured pharmacy metadata into description string
 */
export function embedPharmacyMetaInDescription(
  userDescription: string = "",
  meta: PharmacyMeta
): string {
  // Strip any existing pharmacy meta tag
  const cleanedDesc = stripPharmacyMetaFromDescription(userDescription);
  
  const metaJson = JSON.stringify({
    generic_name: meta.genericName?.trim() || undefined,
    dosage: meta.dosage?.trim() || undefined,
    formulation: meta.formulation?.trim() || undefined,
    is_rx: meta.isRx || false,
    brand_type: meta.brandType || (isLikelyGeneric(meta.genericName, meta.genericName) ? 'generic' : 'branded'),
    batch_number: meta.batchNumber?.trim() || undefined,
    expiry_date: meta.expiryDate?.trim() || undefined,
  });

  const tag = `${META_PREFIX}${metaJson}${META_SUFFIX}`;
  return cleanedDesc ? `${cleanedDesc}\n${tag}` : tag;
}

/**
 * Strips hidden metadata tag from description for clean user display
 */
export function stripPharmacyMetaFromDescription(description?: string | null): string {
  if (!description) return "";
  return description
    .replace(/<!--PHARMACY_META:[\s\S]*?-->/g, "")
    .trim();
}

/**
 * Heuristic to determine if a medicine is an unbranded Generic vs Branded
 */
export function isLikelyGeneric(itemName?: string, genericName?: string): boolean {
  if (!itemName) return true;
  const lowerName = itemName.toLowerCase();
  if (lowerName.includes("generic") || lowerName.includes("ritemed") || lowerName.includes("unbranded")) {
    return true;
  }
  if (genericName && lowerName.trim() === genericName.toLowerCase().trim()) {
    return true;
  }
  return false;
}

/**
 * Extracts pharmacy metadata from item columns, description tag, or heuristics from item name
 */
export function extractPharmacyMeta(item: {
  item_name?: string;
  itemName?: string;
  description?: string | null;
  generic_name?: string | null;
  genericName?: string | null;
  dosage?: string | null;
  formulation?: string | null;
  is_rx?: boolean | null;
  isRx?: boolean | null;
  brand_type?: BrandType | null;
  brandType?: BrandType | null;
  batch_number?: string | null;
  batchNumber?: string | null;
  expiry_date?: string | null;
  expiryDate?: string | null;
}): PharmacyMeta {
  const result: PharmacyMeta = {};
  const effectiveName = item.item_name || item.itemName;

  // 1. Check direct database columns first (snake_case and camelCase)
  const gName = item.generic_name || item.genericName;
  if (gName) result.genericName = gName;
  if (item.dosage) result.dosage = item.dosage;
  if (item.formulation) result.formulation = item.formulation;
  const rxVal = item.is_rx !== undefined ? item.is_rx : item.isRx;
  if (typeof rxVal === "boolean") result.isRx = rxVal;
  const bType = item.brand_type || item.brandType;
  if (bType) result.brandType = bType;
  const bNum = item.batch_number || item.batchNumber;
  if (bNum) result.batchNumber = bNum;
  const expDate = item.expiry_date || item.expiryDate;
  if (expDate) result.expiryDate = expDate;

  // 2. Parse from description embedded tag
  if (item.description && item.description.includes(META_PREFIX)) {
    try {
      const match = item.description.match(/<!--PHARMACY_META:([\s\S]*?)-->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (!result.genericName && parsed.generic_name) result.genericName = parsed.generic_name;
        if (!result.dosage && parsed.dosage) result.dosage = parsed.dosage;
        if (!result.formulation && parsed.formulation) result.formulation = parsed.formulation;
        if (result.isRx === undefined && parsed.is_rx !== undefined) result.isRx = parsed.is_rx;
        if (!result.brandType && parsed.brand_type) result.brandType = parsed.brand_type;
        if (!result.batchNumber && parsed.batch_number) result.batchNumber = parsed.batch_number;
        if (!result.expiryDate && parsed.expiry_date) result.expiryDate = parsed.expiry_date;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // 3. Heuristic fallback from item name if genericName still missing
  // Examples: "Biogesic 500mg (Paracetamol)" -> generic: Paracetamol, dosage: 500mg
  if (effectiveName) {
    // Check for parentheses, e.g. "Brand (Generic)" or "Generic (Dosage)"
    const parenMatch = effectiveName.match(/\(([^)]+)\)/);
    if (!result.genericName && parenMatch && parenMatch[1]) {
      const candidate = parenMatch[1].trim();
      // If it's not just a dosage like "(500mg)"
      if (!/^\d+\s*(mg|ml|mcg|g)$/i.test(candidate)) {
        result.genericName = candidate;
      }
    }

    // Extract dosage from name or description if missing, e.g. "500mg", "500 mg", "250mg/5ml", "125mg / 5ml", "1000 IU"
    const DOSAGE_REGEX = /\b(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|%)\s*(?:\/\s*\d+(?:\.\d+)?\s*(?:ml|mg|g))?)\b/i;
    if (!result.dosage) {
      const dosageMatch = effectiveName.match(DOSAGE_REGEX);
      if (dosageMatch) {
        result.dosage = dosageMatch[1].trim();
      } else if (item.description) {
        const descMatch = item.description.match(DOSAGE_REGEX);
        if (descMatch) {
          result.dosage = descMatch[1].trim();
        }
      }
    }

    // Extract formulation from name or description if missing
    const FORM_REGEX = /\b(Tablet|Tab|Tabs|Capsule|Cap|Caps|Syrup|Syr|Suspension|Susp|Drops|Drop|Cream|Ointment|Oint|Gel|Patch|Vial|Ampule|Amp|Inhaler|Nebule|Solution|Soln)\b/i;
    if (!result.formulation) {
      const formMatch = effectiveName.match(FORM_REGEX);
      if (formMatch) {
        result.formulation = formMatch[1].charAt(0).toUpperCase() + formMatch[1].slice(1).toLowerCase();
      } else if (item.description) {
        const descFormMatch = item.description.match(FORM_REGEX);
        if (descFormMatch) {
          result.formulation = descFormMatch[1].charAt(0).toUpperCase() + descFormMatch[1].slice(1).toLowerCase();
        }
      }
    }
  }

  // 4. Default brand type
  if (!result.brandType) {
    result.brandType = isLikelyGeneric(effectiveName, result.genericName) ? 'generic' : 'branded';
  }

  return result;
}

/**
 * Finds all items with the same generic molecule name in the provided list
 */
export function findGenericEquivalents<
  T extends {
    item_name?: string;
    itemName?: string;
    sku?: string;
    id?: string;
    item_id?: string;
    description?: string | null;
    sales_price?: number | null;
    salesPrice?: number | null;
    sellingPrice?: number | null;
    unit_cost?: number;
  }
>(
  targetItem: {
    item_name?: string;
    itemName?: string;
    sku?: string;
    description?: string | null;
    generic_name?: string | null;
    genericName?: string | null;
  },
  allItems: T[]
): Array<T & { meta: PharmacyMeta; isCheaper: boolean; savings: number; displayName: string }> {
  const targetMeta = extractPharmacyMeta(targetItem);
  if (!targetMeta.genericName) return [];

  const targetGeneric = targetMeta.genericName.toLowerCase().trim();
  const targetSku = targetItem.sku;
  const targetPrice = (targetItem as any).sales_price ?? (targetItem as any).sellingPrice ?? (targetItem as any).salesPrice ?? 0;

  const equivalents: Array<T & { meta: PharmacyMeta; isCheaper: boolean; savings: number; displayName: string }> = [];

  for (const item of allItems) {
    // Don't include the item itself
    if (targetSku && item.sku === targetSku) continue;
    
    const itemMeta = extractPharmacyMeta(item);
    if (!itemMeta.genericName) continue;

    if (itemMeta.genericName.toLowerCase().trim() === targetGeneric) {
      const price = item.sales_price ?? item.sellingPrice ?? item.salesPrice ?? 0;
      const savings = targetPrice > price ? targetPrice - price : 0;
      equivalents.push({
        ...item,
        meta: itemMeta,
        isCheaper: price < targetPrice,
        savings,
        displayName: item.item_name || item.itemName || "Item",
      });
    }
  }

  // Sort: generics first, then lowest price
  return equivalents.sort((a, b) => {
    if (a.meta.brandType === 'generic' && b.meta.brandType !== 'generic') return -1;
    if (b.meta.brandType === 'generic' && a.meta.brandType !== 'generic') return 1;
    const priceA = a.sales_price ?? a.sellingPrice ?? a.salesPrice ?? 0;
    const priceB = b.sales_price ?? b.sellingPrice ?? b.salesPrice ?? 0;
    return priceA - priceB;
  });
}
