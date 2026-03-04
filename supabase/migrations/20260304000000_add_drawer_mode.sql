-- Add drawer_mode column to stores table
-- Valid values: 'unified' (default), 'multiple'
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS drawer_mode text NOT NULL DEFAULT 'unified'
  CONSTRAINT stores_drawer_mode_check CHECK (drawer_mode IN ('unified', 'multiple'));
