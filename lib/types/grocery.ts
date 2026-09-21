// lib/types/grocery.ts

export type UnitOfMeasure = "pc" | "kg" | "g" | "lb" | "pack" | "case";

export interface ScaleBarcodeResult {
  rawBarcode: string;
  isScaleBarcode: boolean;
  prefix: string;
  pluCode: string; // 4 or 5-digit PLU
  embeddedType: "price" | "weight";
  embeddedValue: number; // In currency units (e.g. 15.50) or in kilograms (e.g. 1.250)
  checksum?: string;
}

export interface TareOption {
  id: string;
  label: string;
  weightKg: number; // Tare to deduct in kilograms
  description?: string;
}

export const STANDARD_TARE_OPTIONS: TareOption[] = [
  { id: "none", label: "No Tare", weightKg: 0, description: "Direct scale weight" },
  { id: "bag_small", label: "Produce Bag (5g)", weightKg: 0.005, description: "Thin plastic roll bag" },
  { id: "bag_paper", label: "Brown Kraft Bag (15g)", weightKg: 0.015, description: "Paper grocery bag" },
  { id: "deli_small", label: "Deli Tub (25g)", weightKg: 0.025, description: "Standard plastic deli tub" },
  { id: "deli_large", label: "Large Container (40g)", weightKg: 0.040, description: "Heavy salad/meal container" },
];

export interface ProduceItemPreset {
  plu: string;
  name: string;
  category: string;
  defaultPricePerKg: number;
  unit: "kg" | "pc";
  iconName: string;
}

export const COMMON_PRODUCE_PLU_PRESETS: ProduceItemPreset[] = [
  { plu: "4011", name: "Cavendish Bananas", category: "Fruits", defaultPricePerKg: 85.0, unit: "kg", iconName: "Banana" },
  { plu: "4046", name: "Hass Avocado", category: "Fruits", defaultPricePerKg: 160.0, unit: "kg", iconName: "Apple" },
  { plu: "4131", name: "Fuji Apples", category: "Fruits", defaultPricePerKg: 140.0, unit: "kg", iconName: "Apple" },
  { plu: "4087", name: "Roma Tomatoes", category: "Vegetables", defaultPricePerKg: 95.0, unit: "kg", iconName: "Carrot" },
  { plu: "4082", name: "Red Onions", category: "Vegetables", defaultPricePerKg: 120.0, unit: "kg", iconName: "Carrot" },
  { plu: "4072", name: "Russet Potatoes", category: "Vegetables", defaultPricePerKg: 90.0, unit: "kg", iconName: "Carrot" },
  { plu: "4608", name: "Native Garlic", category: "Vegetables", defaultPricePerKg: 180.0, unit: "kg", iconName: "Carrot" },
  { plu: "4065", name: "Green Bell Pepper", category: "Vegetables", defaultPricePerKg: 150.0, unit: "kg", iconName: "Carrot" },
  { plu: "4068", name: "Green Cabbage", category: "Vegetables", defaultPricePerKg: 70.0, unit: "kg", iconName: "Carrot" },
  { plu: "4062", name: "English Cucumber", category: "Vegetables", defaultPricePerKg: 80.0, unit: "kg", iconName: "Carrot" },
  { plu: "4030", name: "Seedless Watermelon", category: "Fruits", defaultPricePerKg: 65.0, unit: "kg", iconName: "Apple" },
  { plu: "4022", name: "White Grapes", category: "Fruits", defaultPricePerKg: 240.0, unit: "kg", iconName: "Apple" },
];
