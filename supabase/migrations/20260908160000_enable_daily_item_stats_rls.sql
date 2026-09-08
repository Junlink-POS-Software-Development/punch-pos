-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR `daily_item_stats`
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.daily_item_stats ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts or duplicate rules
DROP POLICY IF EXISTS "daily_item_stats_select_policy" ON public.daily_item_stats;
DROP POLICY IF EXISTS "daily_item_stats_insert_policy" ON public.daily_item_stats;
DROP POLICY IF EXISTS "daily_item_stats_update_policy" ON public.daily_item_stats;
DROP POLICY IF EXISTS "daily_item_stats_delete_policy" ON public.daily_item_stats;
DROP POLICY IF EXISTS "View Daily Item Stats" ON public.daily_item_stats;
DROP POLICY IF EXISTS "Insert Daily Item Stats" ON public.daily_item_stats;
DROP POLICY IF EXISTS "Update Daily Item Stats" ON public.daily_item_stats;
DROP POLICY IF EXISTS "Delete Daily Item Stats" ON public.daily_item_stats;

-- ------------------------------------------------------------------------------
-- 3. SELECT Policy: Who can view daily item stats?
-- ------------------------------------------------------------------------------
CREATE POLICY "View Daily Item Stats"
ON public.daily_item_stats
FOR SELECT
TO authenticated
USING (
  -- Fast path: JWT session claim contains store_id
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  -- User is an admin (via JWT claim or public.users table)
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  -- User is the store owner or a co-admin
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  -- User is staff assigned to this store in public.users
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_item_stats.store_id
  )
);

-- ------------------------------------------------------------------------------
-- 4. INSERT Policy: Restricted to admins and store owners/co-admins
-- ------------------------------------------------------------------------------
CREATE POLICY "Insert Daily Item Stats"
ON public.daily_item_stats
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
);

-- ------------------------------------------------------------------------------
-- 5. UPDATE Policy: Restricted to admins and store owners/co-admins
-- ------------------------------------------------------------------------------
CREATE POLICY "Update Daily Item Stats"
ON public.daily_item_stats
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
);

-- ------------------------------------------------------------------------------
-- 6. DELETE Policy: Restricted to admins and store owners/co-admins
-- ------------------------------------------------------------------------------
CREATE POLICY "Delete Daily Item Stats"
ON public.daily_item_stats
FOR DELETE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
);

-- ------------------------------------------------------------------------------
-- 7. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_item_stats_store_id
  ON public.daily_item_stats (store_id);

CREATE INDEX IF NOT EXISTS idx_daily_item_stats_date
  ON public.daily_item_stats (date);

CREATE INDEX IF NOT EXISTS idx_daily_item_stats_item_id
  ON public.daily_item_stats (item_id);

CREATE INDEX IF NOT EXISTS idx_daily_item_stats_category_id
  ON public.daily_item_stats (category_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_item_stats_store_item_date
  ON public.daily_item_stats (store_id, item_id, date);
