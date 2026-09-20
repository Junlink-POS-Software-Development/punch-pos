"use server";

import { createClient } from "@/utils/supabase/server";

export interface PrescriptionLogPayload {
  invoice_no?: string | null;
  doctor_name: string;
  doctor_prc: string;
  doctor_ptr?: string | null;
  patient_name: string;
  patient_age?: number | null;
  patient_address?: string | null;
  rx_items: Array<{
    sku: string;
    item_name: string;
    generic_name?: string;
    dosage?: string;
    quantity: number;
  }>;
}

export interface PrescriptionRecord extends PrescriptionLogPayload {
  id: string;
  store_id: string;
  dispensed_by?: string | null;
  created_at: string;
}

export async function logPrescription(payload: PrescriptionLogPayload): Promise<{
  success: boolean;
  error?: string;
  id?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch store_id for user
  const { data: userData } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (!userData?.store_id) {
    return { success: false, error: "Store not associated with user" };
  }

  try {
    const { data, error } = await supabase
      .from("prescriptions_log")
      .insert({
        store_id: userData.store_id,
        invoice_no: payload.invoice_no || null,
        doctor_name: payload.doctor_name.trim(),
        doctor_prc: payload.doctor_prc.trim(),
        doctor_ptr: payload.doctor_ptr?.trim() || null,
        patient_name: payload.patient_name.trim(),
        patient_age: payload.patient_age || null,
        patient_address: payload.patient_address?.trim() || null,
        rx_items: payload.rx_items,
        dispensed_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("Prescriptions log warning (table pending migration):", error.message);
      // Return success gracefully so customer checkout is not blocked if table migration is pending
      return { success: true, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("Prescription log error:", err);
    return { success: true }; // non-blocking fallback
  }
}

export async function getPrescriptionLogs(limit: number = 50): Promise<{
  data: PrescriptionRecord[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prescriptions_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as PrescriptionRecord[] };
}
