import { createClient } from "@/utils/supabase/client";
import dayjs from "dayjs";

const supabase = createClient();

export interface CashFlowEntry {
  store_id: string;
  category: string;
  date: string;
  forwarded: number;
  cash_in: number;
  cash_out: number;
  balance: number;
}

export const fetchDailyCashFlow = async (date: string = dayjs().format("YYYY-MM-DD")): Promise<CashFlowEntry[]> => {
  const { data, error } = await supabase
    .from("categorical_cash_flow")
    .select("*")
    .eq("date", date);

  if (error) {
    console.error("Error fetching daily cash flow:", error);
    throw new Error(error.message);
  }

  return data || [];
};
