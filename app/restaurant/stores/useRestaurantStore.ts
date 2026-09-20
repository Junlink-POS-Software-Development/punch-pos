import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RestaurantTable,
  DiningSession,
  KitchenTicket,
  KitchenTicketItem,
  TableStatus,
  FloorZone,
  CourseType,
} from "@/lib/types/restaurant";
import { CartItem } from "@/components/sales-terminnal/components/terminal-cart/types";

export const DEFAULT_STARTER_TABLES: RestaurantTable[] = [
  // Main Dining
  { id: "T-1", tableNumber: "T-1", tableName: "Table 1", floorZone: "main", seatingCapacity: 2, status: "vacant" },
  { id: "T-2", tableNumber: "T-2", tableName: "Table 2", floorZone: "main", seatingCapacity: 2, status: "vacant" },
  { id: "T-3", tableNumber: "T-3", tableName: "Table 3", floorZone: "main", seatingCapacity: 4, status: "vacant" },
  { id: "T-4", tableNumber: "T-4", tableName: "Table 4", floorZone: "main", seatingCapacity: 4, status: "vacant" },
  { id: "T-5", tableNumber: "T-5", tableName: "Table 5", floorZone: "main", seatingCapacity: 4, status: "vacant" },
  { id: "T-6", tableNumber: "T-6", tableName: "Table 6", floorZone: "main", seatingCapacity: 6, status: "vacant" },
  { id: "T-7", tableNumber: "T-7", tableName: "Table 7", floorZone: "main", seatingCapacity: 6, status: "vacant" },
  { id: "T-8", tableNumber: "T-8", tableName: "Table 8", floorZone: "main", seatingCapacity: 8, status: "vacant" },
  // Patio / Outdoor
  { id: "P-1", tableNumber: "P-1", tableName: "Patio 1", floorZone: "patio", seatingCapacity: 2, status: "vacant" },
  { id: "P-2", tableNumber: "P-2", tableName: "Patio 2", floorZone: "patio", seatingCapacity: 4, status: "vacant" },
  { id: "P-3", tableNumber: "P-3", tableName: "Patio 3", floorZone: "patio", seatingCapacity: 4, status: "vacant" },
  { id: "P-4", tableNumber: "P-4", tableName: "Patio 4", floorZone: "patio", seatingCapacity: 6, status: "vacant" },
  // Bar Lounge
  { id: "B-1", tableNumber: "B-1", tableName: "Bar 1", floorZone: "bar", seatingCapacity: 1, status: "vacant" },
  { id: "B-2", tableNumber: "B-2", tableName: "Bar 2", floorZone: "bar", seatingCapacity: 1, status: "vacant" },
  { id: "B-3", tableNumber: "B-3", tableName: "Bar 3", floorZone: "bar", seatingCapacity: 2, status: "vacant" },
  { id: "B-4", tableNumber: "B-4", tableName: "Bar 4", floorZone: "bar", seatingCapacity: 2, status: "vacant" },
  // Takeout
  { id: "TO-1", tableNumber: "TO-1", tableName: "Takeout Counter", floorZone: "takeout", seatingCapacity: 0, status: "vacant" },
];

interface RestaurantStoreState {
  tables: RestaurantTable[];
  activeTableId: string | null;
  kitchenTickets: KitchenTicket[];
  ticketCounter: number;

  // Actions
  setActiveTable: (tableId: string | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  updateTableOrder: (
    tableId: string,
    items: CartItem[],
    guestCount?: number,
    serverName?: string,
    notes?: string
  ) => void;
  clearTable: (tableId: string) => void;
  sendOrderToKitchen: (
    tableId: string,
    station?: "kitchen" | "bar" | "grill" | "all"
  ) => KitchenTicket | null;
  updateTicketStatus: (
    ticketId: string,
    status: "pending" | "preparing" | "ready" | "completed"
  ) => void;
  toggleTicketItemCompleted: (ticketId: string, itemId: string) => void;
  bumpTicket: (ticketId: string) => void;
  clearCompletedTickets: () => void;
  resetTablesToDefault: () => void;
}

export const useRestaurantStore = create<RestaurantStoreState>()(
  persist(
    (set, get) => ({
      tables: DEFAULT_STARTER_TABLES,
      activeTableId: "T-1",
      kitchenTickets: [],
      ticketCounter: 101,

      setActiveTable: (tableId) => {
        set({ activeTableId: tableId });
      },

      updateTableStatus: (tableId, status) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, status } : t
          ),
        }));
      },

      updateTableOrder: (tableId, items, guestCount, serverName, notes) => {
        set((state) => {
          const subtotal = items.reduce((sum, item) => sum + item.total, 0);
          const total = subtotal;

          const updatedTables = state.tables.map((table) => {
            if (table.id !== tableId) return table;

            const hasItems = items.length > 0;
            const newStatus: TableStatus = hasItems
              ? table.status === "billing"
                ? "billing"
                : "occupied"
              : "vacant";

            const existingSession = table.currentSession;
            const session: DiningSession | undefined = hasItems
              ? {
                  id: existingSession?.id || `session-${Date.now()}`,
                  tableId: table.id,
                  tableNumber: table.tableNumber,
                  guestCount: guestCount ?? existingSession?.guestCount ?? (table.seatingCapacity || 2),
                  serverName: serverName ?? existingSession?.serverName ?? "Server",
                  startedAt: existingSession?.startedAt || new Date().toISOString(),
                  cartItems: items,
                  notes: notes ?? existingSession?.notes,
                  status: newStatus === "billing" ? "billing" : "active",
                  subtotal,
                  total,
                }
              : undefined;

            return {
              ...table,
              status: newStatus,
              currentSession: session,
            };
          });

          return { tables: updatedTables };
        });
      },

      clearTable: (tableId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? { ...table, status: "vacant", currentSession: undefined }
              : table
          ),
        }));
      },

      sendOrderToKitchen: (tableId, station = "all") => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table || !table.currentSession || table.currentSession.cartItems.length === 0) {
          return null;
        }

        const itemsToSend = table.currentSession.cartItems.filter(
          (item) => !item.kitchenStatus || item.kitchenStatus === "pending" || item.kitchenStatus === "unsent"
        );

        if (itemsToSend.length === 0) {
          // If all already sent, allow re-sending entire cart
          itemsToSend.push(...table.currentSession.cartItems);
        }

        const ticketNo = `KOT-#${state.ticketCounter}`;
        const newTicketItems: KitchenTicketItem[] = itemsToSend.map((item) => ({
          id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
          sku: item.sku,
          itemName: item.itemName,
          quantity: item.quantity,
          course: item.course || "main",
          modifiers: item.modifiers,
          notes: item.notes,
          isCompleted: false,
        }));

        const newTicket: KitchenTicket = {
          id: `kot-${Date.now()}`,
          ticketNumber: ticketNo,
          tableId: table.id,
          tableName: table.tableName || table.tableNumber,
          serverName: table.currentSession.serverName || "Staff",
          guestCount: table.currentSession.guestCount || table.seatingCapacity,
          station,
          createdAt: new Date().toISOString(),
          status: "pending",
          items: newTicketItems,
        };

        // Mark items as 'sent' in table cart
        const updatedCartItems = table.currentSession.cartItems.map((item) => ({
          ...item,
          kitchenStatus: "sent" as const,
        }));

        set((s) => ({
          ticketCounter: s.ticketCounter + 1,
          kitchenTickets: [newTicket, ...s.kitchenTickets],
          tables: s.tables.map((t) =>
            t.id === tableId && t.currentSession
              ? {
                  ...t,
                  currentSession: {
                    ...t.currentSession,
                    cartItems: updatedCartItems,
                  },
                }
              : t
          ),
        }));

        return newTicket;
      },

      updateTicketStatus: (ticketId, status) => {
        set((state) => ({
          kitchenTickets: state.kitchenTickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status,
                  completedAt: status === "completed" ? new Date().toISOString() : t.completedAt,
                }
              : t
          ),
        }));
      },

      toggleTicketItemCompleted: (ticketId, itemId) => {
        set((state) => ({
          kitchenTickets: state.kitchenTickets.map((ticket) => {
            if (ticket.id !== ticketId) return ticket;
            const updatedItems = ticket.items.map((item) =>
              item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
            );
            const allDone = updatedItems.every((item) => item.isCompleted);
            return {
              ...ticket,
              items: updatedItems,
              status: allDone ? "ready" : ticket.status === "pending" ? "preparing" : ticket.status,
            };
          }),
        }));
      },

      bumpTicket: (ticketId) => {
        set((state) => ({
          kitchenTickets: state.kitchenTickets.map((t) =>
            t.id === ticketId
              ? { ...t, status: "completed", completedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      clearCompletedTickets: () => {
        set((state) => ({
          kitchenTickets: state.kitchenTickets.filter((t) => t.status !== "completed"),
        }));
      },

      resetTablesToDefault: () => {
        set({
          tables: DEFAULT_STARTER_TABLES,
          activeTableId: "T-1",
          kitchenTickets: [],
          ticketCounter: 101,
        });
      },
    }),
    {
      name: "restaurant-store",
    }
  )
);
