-- 1. Create a helper function to fetch the current user's store_id safely.
-- Using SECURITY DEFINER bypasses RLS for the internal query, breaking the circular dependency.
CREATE OR REPLACE FUNCTION public.get_auth_user_store_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT store_id FROM public.users WHERE user_id = auth.uid());
END;
$$;

-- 2. Update the stores SELECT policy to be more resilient to stale JWT claims
-- and avoid recursion by using the security definer function.
DROP POLICY IF EXISTS "Users can view own store" ON public.stores;
CREATE POLICY "Users can view own store" ON public.stores
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR auth.uid() = ANY (co_admins)
  OR (
    store_id = (auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid
  )
  OR (
    store_id = public.get_auth_user_store_id()
  )
);
