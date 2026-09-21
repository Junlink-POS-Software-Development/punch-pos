-- Migration: 20260921000000_add_grocery_fields.sql
-- Description: Adds Grocery & Supermarket vertical columns to items:
--              is_weighed, unit_of_measure, plu_code, tare_weight,
--              pack_barcode, pack_quantity, pack_selling_price, is_perishable.

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS is_weighed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unit_of_measure text NOT NULL DEFAULT 'pc',
  ADD COLUMN IF NOT EXISTS plu_code text,
  ADD COLUMN IF NOT EXISTS tare_weight numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pack_barcode text,
  ADD COLUMN IF NOT EXISTS pack_quantity numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pack_selling_price numeric,
  ADD COLUMN IF NOT EXISTS is_perishable boolean NOT NULL DEFAULT false;

-- Indexes for rapid barcode and PLU matching at checkout
CREATE INDEX IF NOT EXISTS idx_items_plu_code ON public.items (plu_code);
CREATE INDEX IF NOT EXISTS idx_items_pack_barcode ON public.items (pack_barcode);
CREATE INDEX IF NOT EXISTS idx_items_is_weighed ON public.items (is_weighed);
CREATE INDEX IF NOT EXISTS idx_items_is_perishable ON public.items (is_perishable);

COMMENT ON COLUMN public.items.is_weighed IS 'True if item is sold by weight (kg, g, lbs)';
COMMENT ON COLUMN public.items.unit_of_measure IS 'Unit of measure: pc, kg, g, lb, pack, case';
COMMENT ON COLUMN public.items.plu_code IS 'Price Look-Up code (e.g. 4011 for Bananas, 4046 for Avocado)';
COMMENT ON COLUMN public.items.tare_weight IS 'Default container tare weight in kg deducted from scale reading';
COMMENT ON COLUMN public.items.pack_barcode IS 'Secondary barcode for multi-pack/bundle (e.g. 6-pack or case barcode)';
COMMENT ON COLUMN public.items.pack_quantity IS 'Number of unit items contained in the multi-pack bundle';
COMMENT ON COLUMN public.items.pack_selling_price IS 'Discounted bundle price when purchased by pack';
COMMENT ON COLUMN public.items.is_perishable IS 'True if item has short shelf life requiring fresh markdown and expiry tracking';
