// lib/types/restaurant.ts

import { CartItem } from "@/components/sales-terminnal/components/terminal-cart/types";

export type TableStatus = "vacant" | "occupied" | "reserved" | "billing";

export type FloorZone = "main" | "patio" | "bar" | "private" | "takeout";

export type CourseType = "beverage" | "appetizer" | "main" | "dessert" | "side";

export type KitchenStatus = "pending" | "unsent" | "sent" | "preparing" | "ready" | "served";

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelections?: number;
  maxSelections?: number;
  isRequired?: boolean;
  options: ModifierOption[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
}

export interface DiningSession {
  id: string;
  tableId: string;
  tableNumber: string;
  guestCount: number;
  serverName: string;
  startedAt: string;
  cartItems: CartItem[];
  notes?: string;
  status: "active" | "billing" | "completed";
  subtotal: number;
  total: number;
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  tableName?: string;
  floorZone: FloorZone;
  seatingCapacity: number;
  status: TableStatus;
  currentSession?: DiningSession;
}

export interface KitchenTicketItem {
  id: string;
  sku: string;
  itemName: string;
  quantity: number;
  course?: CourseType;
  modifiers?: SelectedModifier[];
  notes?: string;
  isCompleted?: boolean;
}

export interface KitchenTicket {
  id: string;
  ticketNumber: string; // e.g. "KOT-101"
  tableId: string;
  tableName: string;
  serverName: string;
  guestCount: number;
  station: "kitchen" | "bar" | "grill" | "all";
  createdAt: string;
  status: "pending" | "preparing" | "ready" | "completed";
  completedAt?: string;
  items: KitchenTicketItem[];
}
