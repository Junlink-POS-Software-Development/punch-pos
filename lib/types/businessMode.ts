// lib/types/businessMode.ts

export type BusinessMode =
  | "retail"
  | "pharmacy"
  | "grocery"
  | "restaurant"
  | "mall"
  | "service"
  | "custom";

export interface ModulesConfig {
  // Pharmacy & Health
  batch_expiry: boolean;
  prescription_rx: boolean;
  statutory_sc_pwd: boolean;

  // Grocery & Supermarket
  weighed_items: boolean;
  fast_cash_tender: boolean;

  // Restaurant & F&B
  table_management: boolean;
  kitchen_display: boolean;
  menu_modifiers: boolean;
  split_check: boolean;

  // Malls & Services
  concessionaire_accounting: boolean;
  staff_commission: boolean;
}

export interface IndustryConfig {
  pharmacy?: {
    expiry_warning_days?: number;
    enforce_fefo?: boolean;
    require_rx_license?: boolean;
  };
  grocery?: {
    scale_barcode_prefix?: string; // e.g. "20"
    default_tare_weight?: number; // in kg
  };
  restaurant?: {
    default_service_charge_percent?: number; // e.g. 10
    kitchen_stations?: string[]; // e.g. ["Bar", "Grill", "Pantry"]
    allow_table_merge?: boolean;
  };
  mall?: {
    default_commission_percent?: number; // e.g. 15
  };
  service?: {
    default_labor_commission_percent?: number; // e.g. 30
    allow_tips?: boolean;
  };
}

export const DEFAULT_MODULES_CONFIG: ModulesConfig = {
  batch_expiry: false,
  prescription_rx: false,
  statutory_sc_pwd: false,
  weighed_items: false,
  fast_cash_tender: true, // Useful across standard retail too
  table_management: false,
  kitchen_display: false,
  menu_modifiers: false,
  split_check: false,
  concessionaire_accounting: false,
  staff_commission: false,
};

export interface BusinessModeInfo {
  id: BusinessMode;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: "Store" | "Pill" | "Apple" | "UtensilsCrossed" | "Building2" | "Scissors" | "SlidersHorizontal";
  defaultModules: ModulesConfig;
  starterCategories: string[];
}

export const BUSINESS_MODE_PRESETS: Record<BusinessMode, BusinessModeInfo> = {
  retail: {
    id: "retail",
    name: "General Retail",
    badge: "Classic Retail",
    tagline: "Clothing, electronics, hardware, general merchandise",
    description: "Standard fast barcode scanning, cart management, simple stock flow, and quick tender checkout.",
    iconName: "Store",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      fast_cash_tender: true,
    },
    starterCategories: ["Apparel", "Electronics", "Accessories", "Home & Living", "General Goods"],
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy & Healthcare",
    badge: "Drugstore & Health",
    tagline: "Medicines, medical supplies, wellness, clinical retail",
    description: "FEFO expiration date tracking, Rx doctor/license compliance, generic molecule lookup, and SC/PWD discounts.",
    iconName: "Pill",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      batch_expiry: true,
      prescription_rx: true,
      statutory_sc_pwd: true,
      fast_cash_tender: true,
    },
    starterCategories: ["Antibiotics", "Analgesics & Pain Relief", "Vitamins & Supplements", "Cold & Allergy", "First Aid & Medical Supplies"],
  },
  grocery: {
    id: "grocery",
    name: "Grocery & Supermarket",
    badge: "High Throughput",
    tagline: "Supermarkets, minimarts, produce, bulk wholesale",
    description: "High-speed continuous barcode scanning, scale/weighed items, price-embedded barcodes, and quick cash keys.",
    iconName: "Apple",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      weighed_items: true,
      fast_cash_tender: true,
      batch_expiry: true,
    },
    starterCategories: ["Fresh Produce", "Dairy & Eggs", "Beverages", "Snacks & Confectionery", "Canned & Packaged Goods", "Frozen Foods"],
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant, Cafe & F&B",
    badge: "Dining & Hospitality",
    tagline: "Cafes, casual dining, bars, fast food, food trucks",
    description: "Visual floor plan and table seating, menu modifiers (sizes, toppings), kitchen tickets (KDS), and split checks.",
    iconName: "UtensilsCrossed",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      table_management: true,
      kitchen_display: true,
      menu_modifiers: true,
      split_check: true,
    },
    starterCategories: ["Beverages & Coffee", "Appetizers", "Main Course", "Sides & Extras", "Desserts"],
  },
  mall: {
    id: "mall",
    name: "Mall & Multi-Vendor",
    badge: "Multi-Tenant",
    tagline: "Department stores, consignment bazaars, boutique complexes",
    description: "Multi-tenant concessionaire sales tracking, automated commission cuts, and universal mall voucher settlement.",
    iconName: "Building2",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      concessionaire_accounting: true,
      fast_cash_tender: true,
    },
    starterCategories: ["Men's Fashion", "Women's Fashion", "Cosmetics & Fragrance", "Footwear & Bags", "Kids & Toys"],
  },
  service: {
    id: "service",
    name: "Services & Salons",
    badge: "Labor & Appointments",
    tagline: "Barbershops, salons, spas, repair centers, clinics",
    description: "Service duration, stylist/technician commission allocation, tip distribution, and job order tracking.",
    iconName: "Scissors",
    defaultModules: {
      ...DEFAULT_MODULES_CONFIG,
      staff_commission: true,
    },
    starterCategories: ["Hair Treatments", "Nails & Spa", "Massage Therapy", "Retail Products", "Repair & Labor"],
  },
  custom: {
    id: "custom",
    name: "Custom / Modular",
    badge: "Fully Configurable",
    tagline: "Tailor each module individually to match unique workflows",
    description: "Hand-pick exact feature toggles suited for hybrid businesses.",
    iconName: "SlidersHorizontal",
    defaultModules: { ...DEFAULT_MODULES_CONFIG },
    starterCategories: ["Category 1", "Category 2", "Category 3"],
  },
};
