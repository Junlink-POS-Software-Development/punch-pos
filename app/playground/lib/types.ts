
export interface PlaygroundState {
  id: string;
  store_id: string;
  name: string;
  content: any; // FortuneSheet/Luckysheet compatible JSON state
  created_at: string;
  updated_at: string;
}

export type DbTable = 'transactions' | 'expenses' | 'items' | 'customers' | 'stock_flow';
export type DbOperation = 'sum' | 'count' | 'avg' | 'min' | 'max';

export interface DbDataFilter {
  [key: string]: string | number | boolean | null;
}

export interface SummaryStats {
  transactions: {
    total_sales: number;
    count: number;
    avg_sale: number;
  };
  expenses: {
    total_expenses: number;
    count: number;
  };
  items: {
    total_items: number;
    total_valuation: number; // sales_price * quantity (if available) or similar
    low_stock_count: number;
  };
  customers: {
    total_customers: number;
    new_customers_this_month: number;
  };
  stock_flow: {
    recent_movements_count: number;
  };
  last_updated: string;
}
