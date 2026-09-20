-- Migration: 20260920000000_add_business_modes_and_modules.sql
-- Description: Add business_mode, modules_enabled, and industry_config columns to public.stores

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS business_mode text NOT NULL DEFAULT 'retail'
    CONSTRAINT stores_business_mode_check 
    CHECK (business_mode IN ('retail', 'pharmacy', 'grocery', 'restaurant', 'mall', 'service', 'custom')),
  ADD COLUMN IF NOT EXISTS modules_enabled jsonb NOT NULL DEFAULT '{
    "batch_expiry": false,
    "prescription_rx": false,
    "statutory_sc_pwd": false,
    "weighed_items": false,
    "fast_cash_tender": true,
    "table_management": false,
    "kitchen_display": false,
    "menu_modifiers": false,
    "split_check": false,
    "concessionaire_accounting": false,
    "staff_commission": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS industry_config jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Optional index on business_mode for fast analytics / grouping
CREATE INDEX IF NOT EXISTS idx_stores_business_mode ON public.stores(business_mode);

COMMENT ON COLUMN public.stores.business_mode IS 'Primary business vertical (e.g. retail, pharmacy, grocery, restaurant, mall, service, custom)';
COMMENT ON COLUMN public.stores.modules_enabled IS 'JSON object of active feature module toggles for the store';
COMMENT ON COLUMN public.stores.industry_config IS 'JSON object containing vertical-specific configuration (e.g. service charge %, scale barcode prefixes)';
