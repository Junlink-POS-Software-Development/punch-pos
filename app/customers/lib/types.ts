export type CustomerGroup = {
  id: string;
  name: string;
  is_shared: boolean;
  created_by: string;
  store_id: string;
};

import { z } from "zod";

export interface GuestTransaction {
  store_id: string;
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string; // ISO String from DB
  cashier_id: string;
}

export const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  group_id: z.string().optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  date_of_registration: z.string().min(1, "Registration date is required"),
});

// Derive the type from the schema
export type CustomerFormValues = z.infer<typeof customerSchema>;

export type Customer = {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null; //
  address: string | null; //
  remarks: string | null; //
  birthdate: string | null; //
  date_of_registration: string; //
  documents: string[]; //
  group_id: string | null;
  total_spent: number;
};
