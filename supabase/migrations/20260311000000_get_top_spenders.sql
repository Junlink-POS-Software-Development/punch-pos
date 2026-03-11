-- Create a security definer RPC to fetch top spending customers for the current store
CREATE OR REPLACE FUNCTION get_top_spenders()
RETURNS SETOF public.customers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_store_id UUID;
BEGIN
  -- 1. Get the store_id for the current user
  SELECT store_id INTO v_store_id FROM public.users WHERE user_id = auth.uid();
  
  IF v_store_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Return customers with spend > 0, sorted by total_spent DESC
  RETURN QUERY
  SELECT *
  FROM public.customers
  WHERE store_id = v_store_id
    AND total_spent > 0
  ORDER BY total_spent DESC
  LIMIT 50;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_top_spenders() TO authenticated;
