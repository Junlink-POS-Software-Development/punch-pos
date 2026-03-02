ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Basic visibility policies
-- Users can see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can see their own store
DROP POLICY IF EXISTS "Users can view own store" ON public.stores;
CREATE POLICY "Users can view own store" ON public.stores
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR auth.uid() = ANY (co_admins)
  OR (
    store_id = (auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid
  )
);

-- Users can see their own permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON public.staff_permissions;
CREATE POLICY "Users can view own permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 3. JWT-Based Stores Update Policy (PREVENTS RECURSION)
-- Instead of querying other tables, we read the store_id and permission directly from the session JWT.
-- This breaks the circular dependency between tables and fixes error 42P17.
DROP POLICY IF EXISTS "Staff with permission can update store" ON public.stores;
CREATE POLICY "Staff with permission can update store" ON public.stores
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() 
  OR auth.uid() = ANY (co_admins)
  OR (
    store_id = (auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid
    AND (auth.jwt() -> 'app_metadata' -> 'permissions' ->> 'can_manage_store')::boolean = true
  )
)
WITH CHECK (
  user_id = auth.uid() 
  OR auth.uid() = ANY (co_admins)
  OR (
    store_id = (auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid
    AND (auth.jwt() -> 'app_metadata' -> 'permissions' ->> 'can_manage_store')::boolean = true
  )
);

-- 4. Fix Storage RLS (ensure folders are correct and match user_id)
DROP POLICY IF EXISTS "Users can upload store logos to their own folder" ON storage.objects;
CREATE POLICY "Users can upload store logos to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'store_image' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update store logos in their own folder" ON storage.objects;
CREATE POLICY "Users can update store logos in their own folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'store_image' AND (storage.foldername(name))[1] = auth.uid()::text
);
