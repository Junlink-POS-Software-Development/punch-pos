-- ==============================================================================
-- FILE MANAGER STORAGE RLS POLICIES & HELPER FUNCTIONS
-- ==============================================================================
-- Enforces Row Level Security so that ONLY admins and members of the store
-- where files/folders are uploaded/created can perform CRUD (Create, Read, Update, Delete).
-- Storage path structure: {store_id}/{folder_name}/{file_name}
-- ==============================================================================

-- 1. Ensure the file-manager storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'file-manager',
  'file-manager',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Helper function to check if the current user is an admin or member of the target store
CREATE OR REPLACE FUNCTION public.can_access_store_files(folder_store_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_store_id uuid;
  user_store_id uuid;
  is_admin_user boolean;
BEGIN
  -- Unauthenticated requests cannot access store files
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Allow if folder path directly matches the user's personal ID (fallback)
  IF folder_store_text = auth.uid()::text THEN
    RETURN true;
  END IF;

  -- 1. Check Global System Admin from JWT app_metadata
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- 2. Check Global System Admin from public.users table
  SELECT (role = 'admin'), store_id INTO is_admin_user, user_store_id
  FROM public.users
  WHERE user_id = auth.uid();

  IF is_admin_user IS TRUE THEN
    RETURN true;
  END IF;

  -- 3. Check if folder matches store_id in JWT app_metadata
  IF (auth.jwt() -> 'app_metadata' ->> 'store_id') = folder_store_text THEN
    RETURN true;
  END IF;

  -- 4. Check if folder matches user's assigned store_id in public.users
  IF user_store_id IS NOT NULL AND user_store_id::text = folder_store_text THEN
    RETURN true;
  END IF;

  -- Validate UUID format before querying public.stores
  IF folder_store_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN false;
  END IF;

  target_store_id := folder_store_text::uuid;

  -- 5. Check if user is the Store Owner or Co-Admin in public.stores
  IF EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = target_store_id
      AND (
        s.user_id = auth.uid() 
        OR auth.uid() = ANY(s.co_admins)
      )
  ) THEN
    RETURN true;
  END IF;

  -- 6. Check if user is an active member of this store in public.users
  IF EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid()
      AND u.store_id = target_store_id
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.can_access_store_files(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_store_files(text) TO service_role;

-- ------------------------------------------------------------------------------
-- 3. Storage RLS Policies for 'file-manager' bucket
-- ------------------------------------------------------------------------------

-- SELECT (READ): Only store admin and members can view/list files
DROP POLICY IF EXISTS "Allow store members and admins to read files" ON storage.objects;
CREATE POLICY "Allow store members and admins to read files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'file-manager'
  AND public.can_access_store_files((storage.foldername(name))[1])
);

-- INSERT (CREATE): Only store admin and members can upload files
DROP POLICY IF EXISTS "Allow store members and admins to upload files" ON storage.objects;
CREATE POLICY "Allow store members and admins to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'file-manager'
  AND public.can_access_store_files((storage.foldername(name))[1])
);

-- UPDATE (UPDATE): Only store admin and members can update files or metadata
DROP POLICY IF EXISTS "Allow store members and admins to update files" ON storage.objects;
CREATE POLICY "Allow store members and admins to update files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'file-manager'
  AND public.can_access_store_files((storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'file-manager'
  AND public.can_access_store_files((storage.foldername(name))[1])
);

-- DELETE (DELETE): Only store admin and members can delete files or folders
DROP POLICY IF EXISTS "Allow store members and admins to delete files" ON storage.objects;
CREATE POLICY "Allow store members and admins to delete files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'file-manager'
  AND public.can_access_store_files((storage.foldername(name))[1])
);
