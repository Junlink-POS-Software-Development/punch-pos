import type { SelectedModifier, CourseType, KitchenStatus } from "@/lib/types/restaurant";

export type DiscountType = 'flat' | 'percent';

export type CartItem = {
  id: string;
  sku: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  // Per-item discount
  discountType: DiscountType;   // 'flat' = ₱ amount, 'percent' = %
  discountValue: number;        // Raw input (e.g. 10 for 10% or ₱10)
  discount: number;             // Computed flat amount (backward compat with DB)
  total: number;
  // Pharmacy & FEFO vertical extensions
  genericName?: string;
  dosage?: string;
  formulation?: string;
  isRx?: boolean;
  batchNumber?: string;
  expiryDate?: string;
  // Restaurant & F&B vertical extensions
  modifiers?: SelectedModifier[];
  course?: CourseType;
  kitchenStatus?: KitchenStatus;
  notes?: string;
};

export type TerminalCartProps = {
  rows: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onItemDiscountClick?: (item: CartItem) => void;
  onItemModifierClick?: (item: CartItem) => void;
  onOrderDiscountClick?: () => void;
  orderDiscountAmount?: number | null;
  orderDiscountValue?: number | null;
  orderDiscountType?: DiscountType | null;
  onRemoveOrderDiscount?: () => void;
  onCharge?: () => void;
  onSendKitchen?: () => void;
  onSplitCheck?: () => void;
};
