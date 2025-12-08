import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { TransactionItem, PaymentRecord } from "../types";
import { useAuthStore } from "@/store/useAuthStore";

// --- Types for Raw Supabase Responses ---
interface TransactionRow {
  id: string; // Changed to string for UUID
  invoice_no: string;
  sku: string;
  item_name: string;
  cost_price: number;
  discount: number;
  quantity: number;
  total_price: number;
  transaction_time: string; // This is the basis for sorting
  store_id: string; // Normalized column name
  category_id?: string; // New foreign key
  category?: string; // Snapshot text
}

interface PaymentRow {
  invoice_no: string;
  transaction_time: string;
  customer_name: string;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  cashier_id?: string; // Renamed from cashier_name
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
}

// --- 1. Hook for Line Items History ---
export const useTransactionHistory = (
  page: number,
  pageSize: number,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["transaction-items", page, pageSize, filters],
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
    queryFn: async () => {
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // We select * to get all columns including the new UUIDs and timestamps
      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" });

      // --- DATE FILTERS (Inclusive Range) ---
      // Ensures that selecting "Today" covers 00:00:00 to 23:59:59
      if (filters.startDate) {
        query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
      }
      if (filters.endDate) {
        query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
      }

      // --- COLUMN FILTERS ---
      const columnMap: Record<string, string> = {
        transactionNo: "invoice_no",
        barcode: "sku",
        ItemName: "item_name",
        // category: "category", // Uncomment if you want to filter by the category snapshot
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "startDate" && key !== "endDate") {
          const dbColumn = columnMap[key];
          if (dbColumn) {
            query = query.ilike(dbColumn, `%${value}%`);
          }
        }
      });

      // Sort by transaction_time (The Date Column)
      const { data, error, count } = await query
        .range(from, to)
        .order("transaction_time", { ascending: false });

      if (error) {
        console.error("Error fetching transaction history:", error);
        throw new Error(error.message);
      }

      const formattedData = (data as unknown as TransactionRow[]).map(
        (item) => ({
          transactionNo: item.invoice_no || "N/A",
          // Format the date for display, but keep the sorting logic in the query
          transactionTime: item.transaction_time 
            ? new Date(item.transaction_time).toLocaleString() 
            : "N/A", 
          barcode: item.sku,
          ItemName: item.item_name,
          unitPrice: item.cost_price,
          discount: item.discount,
          quantity: item.quantity,
          totalPrice: item.total_price,
        })
      ) as TransactionItem[];

      return {
        data: formattedData,
        count: count || 0,
      };
    },
  });
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = (
  page: number = 1,
  pageSize: number = 50,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["payments", page, pageSize, filters],
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
    queryFn: async () => {
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("payments")
        .select("*", { count: "exact" });

      // Apply Date Filters
      if (filters.startDate) {
        query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
      }
      if (filters.endDate) {
        query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
      }

      // Apply Column Filters
      const columnMap: Record<string, string> = {
        transactionNo: "invoice_no",
        customerName: "customer_name",
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "startDate" && key !== "endDate") {
          const dbColumn = columnMap[key];
          if (dbColumn) {
            query = query.ilike(dbColumn, `%${value}%`);
          }
        }
      });

      const { data, error, count } = await query
        .range(from, to)
        .order("transaction_time", { ascending: false });

      if (error) {
        console.error("Error fetching payment history:", error);
        throw new Error(error.message);
      }

      const formattedData = (data as unknown as PaymentRow[]).map((p) => ({
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        customerName: p.customer_name,
        amountRendered: p.amount_rendered,
        voucher: p.voucher,
        grandTotal: p.grand_total,
        change: p.change,
      })) as PaymentRecord[];

      return {
        data: formattedData,
        count: count || 0,
      };
    },
  });
};