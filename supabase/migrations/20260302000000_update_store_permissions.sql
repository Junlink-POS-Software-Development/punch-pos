-- 1. Add column to staff_permissions
ALTER TABLE public.staff_permissions 
ADD COLUMN IF NOT EXISTS can_manage_store boolean NOT NULL DEFAULT false;

-- 2. Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_store_id uuid;
  passed_role text;
BEGIN
  -- Extract the role from metadata (default to 'member')
  passed_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'member'));

  -- UPSERT into public.users
  INSERT INTO public.users (user_id, first_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    passed_role
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email;

  -- Logic Split: Only create a store if it's a 'member' and they don't have a store yet
  -- This handles the "Store Owner" case during initial signup
  IF passed_role = 'member' AND NOT EXISTS (SELECT 1 FROM public.users WHERE user_id = NEW.id AND store_id IS NOT NULL) THEN
      INSERT INTO public.stores (store_name, user_id)
      VALUES ('My New Store', NEW.id)
      RETURNING store_id INTO new_store_id;
      
      UPDATE public.users SET store_id = new_store_id WHERE user_id = NEW.id;
  END IF;

  -- Ensure staff_permissions exist and set ALL permissions to true by default
  INSERT INTO public.staff_permissions (
    user_id,
    can_backdate,
    can_edit_price,
    can_edit_transaction,
    can_delete_transaction,
    can_manage_items,
    can_manage_categories,
    can_manage_customers,
    can_manage_expenses,
    can_manage_store
  )
  VALUES (
    NEW.id,
    true, -- can_backdate
    true, -- can_edit_price
    true, -- can_edit_transaction
    true, -- can_delete_transaction
    true, -- can_manage_items
    true, -- can_manage_categories
    true, -- can_manage_customers
    true, -- can_manage_expenses
    true  -- can_manage_store
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3. Update join_store RPC (to grant permissions to joining staff)
CREATE OR REPLACE FUNCTION public.join_store(provided_enrollment_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_store_id uuid;
  current_user_id uuid;
  user_email text;
  user_meta jsonb;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, raw_user_meta_data 
  INTO user_email, user_meta
  FROM auth.users 
  WHERE id = current_user_id;

  -- 1. Find store by enrollment_id
  SELECT store_id INTO target_store_id
  FROM public.stores
  WHERE enrollment_id = provided_enrollment_id;

  IF target_store_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Company Code');
  END IF;

  -- 2. Insert or Update public.users
  INSERT INTO public.users (
    user_id,
    store_id,
    email,
    role,
    first_name,
    last_name,
    avatar,
    metadata
  )
  VALUES (
    current_user_id,
    target_store_id,
    user_email,
    'member',
    COALESCE(user_meta->>'first_name', ''),
    COALESCE(user_meta->>'last_name', ''),
    user_meta->>'avatar_url', 
    jsonb_build_object(
        'job_title', user_meta->>'job_title',
        'business_name', user_meta->>'business_name'
    )
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    store_id = EXCLUDED.store_id,
    role = 'member';

  -- 3. Grant default permissions (Including store management)
  INSERT INTO public.staff_permissions (
    user_id,
    can_backdate,
    can_edit_price,
    can_edit_transaction,
    can_delete_transaction,
    can_manage_items,
    can_manage_categories,
    can_manage_customers,
    can_manage_expenses,
    can_manage_store
  )
  VALUES (
    current_user_id,
    true, true, true, true, true, true, true, true, true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    can_manage_store = EXCLUDED.can_manage_store;

  RETURN jsonb_build_object('success', true, 'store_id', target_store_id);
END;
$function$;

-- 4. Update custom_access_token hook to include the new permission in JWT
CREATE OR REPLACE FUNCTION public.custom_access_token(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  claims jsonb;
  user_permissions jsonb;
  assigned_store_id uuid;
  user_role text; 
BEGIN
  -- Fetch BOTH the store_id AND the role from the users table
  SELECT store_id, role INTO assigned_store_id, user_role 
  FROM public.users 
  WHERE user_id = (event->>'user_id')::uuid;

  -- Fetch ALL the boolean flags from staff_permissions
  SELECT jsonb_build_object(
    'can_backdate', can_backdate,
    'can_edit_price', can_edit_price,
    'can_edit_transaction', can_edit_transaction,
    'can_delete_transaction', can_delete_transaction,
    'can_manage_items', can_manage_items,
    'can_manage_categories', can_manage_categories,
    'can_manage_customers', can_manage_customers,
    'can_manage_expenses', can_manage_expenses,
    'can_manage_store', can_manage_store -- ADDED THIS
  ) INTO user_permissions
  FROM public.staff_permissions
  WHERE user_id = (event->>'user_id')::uuid;

  -- Inject the data into the JWT's app_metadata
  claims := event->'claims';
  
  IF assigned_store_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, store_id}', to_jsonb(assigned_store_id));
  END IF;

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
  END IF;

  IF user_permissions IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, permissions}', user_permissions);
  END IF;

  -- RETURN DIRECTLY INSTEAD OF REASSIGNING 'event'
  RETURN jsonb_set(event, '{claims}', claims);
END;
$function$;

-- 5. Update Stores RLS to allow staff with permission
DROP POLICY IF EXISTS "Staff with permission can update store" ON public.stores;
CREATE POLICY "Staff with permission can update store" ON public.stores
FOR UPDATE TO authenticated
USING (
  store_id IN (SELECT store_id FROM public.users WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.staff_permissions WHERE user_id = auth.uid() AND can_manage_store = true)
)
WITH CHECK (
  store_id IN (SELECT store_id FROM public.users WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.staff_permissions WHERE user_id = auth.uid() AND can_manage_store = true)
);

-- 6. Storage RLS (store_image bucket)
-- We allow users to upload/update if they are in their own folder (pattern `${user.id}/...`)
-- This matches the `uploadStoreLogo` implementation in `store.ts`
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
