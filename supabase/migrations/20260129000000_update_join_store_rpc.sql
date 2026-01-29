
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
  -- Get current user ID
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email and metadata from auth.users
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
  -- We use ON CONFLICT to handle both cases (new user vs existing user joining)
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
    user_meta->>'avatar_url', -- Google auth usually provides avatar_url
    jsonb_build_object(
        'job_title', user_meta->>'job_title',
        'business_name', user_meta->>'business_name'
    )
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    store_id = EXCLUDED.store_id,
    role = 'member', -- Enforce member role when joining via code
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    metadata = public.users.metadata || EXCLUDED.metadata; -- Merge metadata

  -- 3. Grant default permissions
  INSERT INTO public.staff_permissions (user_id, can_backdate, can_edit_price)
  VALUES (current_user_id, false, false)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'store_id', target_store_id);
END;
$function$;

-- Grant execute permission to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.join_store(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_store(text) TO service_role;
