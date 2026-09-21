// lib/utils/scaleBarcode.ts

import { ScaleBarcodeResult } from "@/lib/types/grocery";

const STANDARD_SCALE_PREFIXES = ["20", "02", "21", "22", "23", "24", "25", "26", "27", "28", "29"];

/**
 * Parses a barcode string to check if it matches in-store variable-measure scale barcode formats.
 * GS1 standard:
 * - 13-digit EAN-13: [Prefix: 2 digits][PLU: 5 digits][Value: 5 digits][Check: 1 digit]
 *   Example: 20 04011 01550 7 -> Prefix 20, PLU 04011, ₱15.50 (or 1.550 kg)
 * - 12-digit UPC-A:  [Prefix: 1-2 digits][PLU: 4-5 digits][Value: 5 digits][Check: 1 digit]
 */
export function parseScaleBarcode(
  rawBarcode: string,
  preferredPrefix?: string
): ScaleBarcodeResult | null {
  if (!rawBarcode) return null;
  const cleaned = rawBarcode.trim();

  // Must be only digits and either 12 or 13 characters
  if (!/^\d{12,13}$/.test(cleaned)) {
    return null;
  }

  const activePrefixes = preferredPrefix
    ? [preferredPrefix, ...STANDARD_SCALE_PREFIXES.filter((p) => p !== preferredPrefix)]
    : STANDARD_SCALE_PREFIXES;

  let matchedPrefix: string | null = null;
  for (const prefix of activePrefixes) {
    if (cleaned.startsWith(prefix)) {
      matchedPrefix = prefix;
      break;
    }
  }

  if (!matchedPrefix) {
    return null;
  }

  if (cleaned.length === 13) {
    // 13-digit EAN-13:
    // [0..1] Prefix (2 digits)
    // [2..6] PLU/Item code (5 digits)
    // [7..11] Value (5 digits)
    // [12] Checksum (1 digit)
    const pluRaw = cleaned.slice(2, 7);
    const valueRaw = cleaned.slice(7, 12);
    const checksum = cleaned.slice(12, 13);

    // Strip leading zeros for lookup (e.g. "04011" -> "4011")
    const pluCode = pluRaw.replace(/^0+/, "") || pluRaw;
    const numericValue = parseInt(valueRaw, 10);

    // Determine if embedded is price (cents / 100) or weight (grams / 1000)
    // Standard in retail supermarket deli is price-embedded: 01550 = ₱15.50
    // Weight-embedded is also standard when items are billed by strict weight.
    // Default to price-embedded as primary, but expose both
    const priceValue = Math.round(numericValue) / 100;

    return {
      rawBarcode: cleaned,
      isScaleBarcode: true,
      prefix: matchedPrefix,
      pluCode,
      embeddedType: "price",
      embeddedValue: priceValue,
      checksum,
    };
  }

  if (cleaned.length === 12) {
    // 12-digit UPC-A:
    // [0..1] or [0] Prefix
    // [matchedPrefix.length .. matchedPrefix.length + 5] PLU
    // remaining before checksum is value
    const prefixLen = matchedPrefix.length;
    const pluRaw = cleaned.slice(prefixLen, prefixLen + 4);
    const valueRaw = cleaned.slice(prefixLen + 4, 11);
    const checksum = cleaned.slice(11, 12);

    const pluCode = pluRaw.replace(/^0+/, "") || pluRaw;
    const numericValue = parseInt(valueRaw, 10);
    const priceValue = Math.round(numericValue) / 100;

    return {
      rawBarcode: cleaned,
      isScaleBarcode: true,
      prefix: matchedPrefix,
      pluCode,
      embeddedType: "price",
      embeddedValue: priceValue,
      checksum,
    };
  }

  return null;
}

/**
 * Calculates net weight after tare deduction
 */
export function calculateNetWeight(grossWeightKg: number, tareWeightKg: number = 0): number {
  const net = Math.max(0, grossWeightKg - tareWeightKg);
  // Round to 3 decimal places (1 gram precision)
  return Math.round(net * 1000) / 1000;
}

/**
 * Calculates line price for weighed item
 */
export function calculateWeighedTotal(netWeightKg: number, pricePerKg: number): number {
  return Math.round(netWeightKg * pricePerKg * 100) / 100;
}
