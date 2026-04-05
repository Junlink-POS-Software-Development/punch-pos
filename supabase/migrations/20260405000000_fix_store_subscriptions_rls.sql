-- Enable RLS on store_subscriptions (idempotent — safe to run even if already enabled)
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read subscription for their own store
-- Uses the users table to find the current user's store_id
DROP POLICY IF EXISTS "Users can view own store subscription" ON public.store_subscriptions;
CREATE POLICY "Users can view own store subscription" ON public.store_subscriptions
FOR SELECT TO authenticated
USING (
  store_id IN (
    SELECT u.store_id FROM public.users u WHERE u.user_id = auth.uid()
  )
);
