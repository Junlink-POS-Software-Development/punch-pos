-- Migration: 20260920010000_add_pharmacy_fields_and_item_batches.sql
-- Description: Adds Generic Name, Dosage, Formulation, and Rx requirement to items.
--              Creates item_batches table for FEFO (First-Expired, First-Out) tracking.
--              Creates prescriptions_log table for FDA/regulatory compliance.

-- 1. Extend items table with Pharmacy and Drug Formulation metadata
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS generic_name text,
  ADD COLUMN IF NOT EXISTS dosage text,
  ADD COLUMN IF NOT EXISTS formulation text,
  ADD COLUMN IF NOT EXISTS is_rx boolean NOT NULL DEFAULT false;

-- Indexes for fast dual-search (Brand + Generic)
CREATE INDEX IF NOT EXISTS idx_items_generic_name ON public.items (generic_name);
CREATE INDEX IF NOT EXISTS idx_items_is_rx ON public.items (is_rx);

COMMENT ON COLUMN public.items.generic_name IS 'Generic molecule / international nonproprietary name (e.g. Paracetamol, Amoxicillin)';
COMMENT ON COLUMN public.items.dosage IS 'Strength / dosage of medication (e.g. 500mg, 250mg/5mL)';
COMMENT ON COLUMN public.items.formulation IS 'Dosage form (e.g. Tablet, Capsule, Syrup, Suspension, Ointment, Injection)';
COMMENT ON COLUMN public.items.is_rx IS 'True if medication requires a valid doctor prescription to dispense';

-- 2. Create item_batches table for FEFO (First-Expired, First-Out) expiry tracking
CREATE TABLE IF NOT EXISTS public.item_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  expiry_date date NOT NULL,
  stock_quantity numeric NOT NULL DEFAULT 0,
  cost_price numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FEFO search index: queries order by expiry_date ASC
CREATE INDEX IF NOT EXISTS idx_item_batches_fefo ON public.item_batches (item_id, expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_item_batches_store ON public.item_batches (store_id);
CREATE INDEX IF NOT EXISTS idx_item_batches_expiry ON public.item_batches (expiry_date);

-- Enable RLS for item_batches
ALTER TABLE public.item_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow store members to select item_batches"
  ON public.item_batches FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow store members to insert item_batches"
  ON public.item_batches FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow store members to update item_batches"
  ON public.item_batches FOR UPDATE
  USING (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow store members to delete item_batches"
  ON public.item_batches FOR DELETE
  USING (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );

-- 3. Create prescriptions_log table for FDA / PDEA regulatory compliance
CREATE TABLE IF NOT EXISTS public.prescriptions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  invoice_no text,
  doctor_name text NOT NULL,
  doctor_prc text NOT NULL,
  doctor_ptr text,
  patient_name text NOT NULL,
  patient_age integer,
  patient_address text,
  rx_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  dispensed_by uuid REFERENCES public.users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_log_store ON public.prescriptions_log (store_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_log_invoice ON public.prescriptions_log (invoice_no);
CREATE INDEX IF NOT EXISTS idx_prescriptions_log_doctor ON public.prescriptions_log (doctor_prc);

-- Enable RLS for prescriptions_log
ALTER TABLE public.prescriptions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow store members to select prescriptions_log"
  ON public.prescriptions_log FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow store members to insert prescriptions_log"
  ON public.prescriptions_log FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM public.users WHERE user_id = auth.uid()
    )
  );
