-- Add expiration check to join_store logic
CREATE OR REPLACE FUNCTION public.join_store_via_enrollment_id(provided_enrollment_id text)
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
  expiry_time timestamp with time zone;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, raw_user_meta_data 
  INTO user_email, user_meta
  FROM auth.users 
  WHERE id = current_user_id;

  -- 1. Find store by enrollment_id AND check expiration
  SELECT store_id, enrollment_code_expires_at INTO target_store_id, expiry_time
  FROM public.stores
  WHERE enrollment_id = provided_enrollment_id;

  IF target_store_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid Enrollment Code');
  END IF;

  -- Check if code is expired
  IF expiry_time IS NOT NULL AND expiry_time < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Enrollment Code has expired. Please ask for a new one.');
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

  -- 3. Grant default permissions
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

-- Also update the generic join_store for consistency
CREATE OR REPLACE FUNCTION public.join_store(provided_enrollment_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN public.join_store_via_enrollment_id(provided_enrollment_id);
END;
$function$;
