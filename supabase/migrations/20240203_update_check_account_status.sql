CREATE OR REPLACE FUNCTION public.check_account_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_deleted timestamp with time zone;
  v_store_deleted timestamp with time zone;
  v_role text;
  v_store_id uuid;
BEGIN
  -- Get user info
  SELECT deleted_at, role, store_id INTO v_user_deleted, v_role, v_store_id
  FROM public.users
  WHERE user_id = auth.uid();

  -- If user is marked as deleted, block immediately
  IF v_user_deleted IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'user_deleted', 'message', 'Your account has been deactivated.');
  END IF;

  -- Check store status if the user belongs to one
  IF v_store_id IS NOT NULL THEN
    SELECT deleted_at INTO v_store_deleted FROM public.stores WHERE store_id = v_store_id;
    
    IF v_store_deleted IS NOT NULL THEN
      RETURN jsonb_build_object('status', 'store_deleted', 'message', 'This store is no longer active.');
    END IF;
  END IF;

  -- If they are a member but have no store, block them (extra safety)
  IF v_role = 'member' AND v_store_id IS NULL THEN
      RETURN jsonb_build_object('status', 'no_store', 'message', 'You are not enrolled in any store.');
  END IF;

  RETURN jsonb_build_object('status', 'active');
END;
$$;
