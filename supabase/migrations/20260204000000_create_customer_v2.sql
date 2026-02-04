CREATE OR REPLACE FUNCTION create_customer_v2(
  p_full_name TEXT,
  p_phone_number TEXT,
  p_email TEXT,
  p_address TEXT,
  p_remarks TEXT,
  p_birthdate DATE,
  p_date_of_registration DATE,
  p_group_id UUID,
  p_civil_status TEXT,
  p_gender TEXT,
  p_documents TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_store_id UUID;
  v_existing_id UUID;
  v_existing_birthdate DATE;
  v_search_name TEXT;
BEGIN
  -- 1. Get the store_id for the current user
  SELECT store_id INTO v_store_id FROM public.users WHERE user_id = auth.uid();
  
  IF v_store_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User has no associated store');
  END IF;

  -- Verify input name is trimmed
  v_search_name := TRIM(p_full_name);

  -- 2. Check if a customer with this name already exists in this store
  -- Using TRIM to ignore leading/trailing whitespace inconsistencies
  SELECT id, birthdate INTO v_existing_id, v_existing_birthdate 
  FROM public.customers 
  WHERE LOWER(TRIM(full_name)) = LOWER(v_search_name) 
    AND store_id = v_store_id
  LIMIT 1;

  IF FOUND THEN
    -- Check if it's an exact match (Name + Birthdate)
    IF (v_existing_birthdate IS NOT DISTINCT FROM p_birthdate) THEN
      RETURN jsonb_build_object(
        'status', 'exists',
        'message', 'A customer with this name and birthdate already exists.',
        'customer_id', v_existing_id
      );
    ELSE
      -- Name exists, but birthdate is different (Potentially a different person)
      RETURN jsonb_build_object(
        'status', 'conflict',
        'message', 'A customer with this name exists but has a different birthdate.',
        'customer_id', v_existing_id
      );
    END IF;
  END IF;

  -- 3. Insert the new customer (Use the trimmed name)
  INSERT INTO public.customers (
    full_name, phone_number, email, address, remarks, 
    birthdate, date_of_registration, group_id, 
    civil_status, gender, documents, store_id
  )
  VALUES (
    v_search_name, p_phone_number, p_email, p_address, p_remarks, 
    p_birthdate, p_date_of_registration, p_group_id, 
    p_civil_status, p_gender, p_documents, v_store_id
  )
  RETURNING id INTO v_existing_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'customer_id', v_existing_id,
    'debug_store_id', v_store_id,
    'debug_name_used', v_search_name
  );
END;
$$;
