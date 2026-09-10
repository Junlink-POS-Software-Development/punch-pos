-- Migration: Allow client-provided invoice_no in insert_new_payment_and_transaction RPC
-- This allows POS terminals to generate collision-resistant invoice numbers immediately upfront,
-- preventing dual modal popups and eliminating client waits.

CREATE OR REPLACE FUNCTION public.insert_new_payment_and_transaction(
  header jsonb,
  items jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_payment_id uuid;
  new_invoice_no text;
  idx integer;
  item jsonb;
  v_customer_id uuid;
  v_transaction_time timestamp with time zone;
  v_cashier_name text;
  v_store_id uuid;
  v_category_id uuid;
BEGIN
  -- 1. Extract values or fall back to defaults
  v_customer_id := (header->>'customer_id')::uuid;
  
  IF header ? 'transaction_time' AND header->>'transaction_time' IS NOT NULL THEN
    v_transaction_time := (header->>'transaction_time')::timestamp with time zone;
  ELSE
    v_transaction_time := now();
  END IF;

  -- 2. Validate Data
  IF jsonb_array_length(items) = 0 THEN
    RAISE EXCEPTION 'Items array cannot be empty';
  END IF;

  -- 3. Get Auth Details
  v_cashier_name := auth.uid();
  IF v_cashier_name IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT store_id INTO v_store_id FROM users WHERE user_id = v_cashier_name::uuid;
  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Store not found for user';
  END IF;

  -- 4. Generate or Use Provided Invoice No
  IF header ? 'invoice_no' AND header->>'invoice_no' IS NOT NULL AND header->>'invoice_no' <> '' THEN
    new_invoice_no := header->>'invoice_no';
  ELSE
    new_invoice_no := 'INV-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(md5(random()::text) from 1 for 4);
  END IF;

  -- 5. Insert Payment
  INSERT INTO public.payments (
    invoice_no, 
    customer_name, 
    amount_rendered, 
    voucher, 
    amount_paid, 
    change, 
    transaction_no, 
    transaction_time, 
    customer_id, 
    cashier_id, 
    store_id,
    order_discount_type,
    order_discount_value,
    order_discount_amount,
    voucher_id,
    voucher_code
  ) VALUES (
    new_invoice_no,
    header->>'customer_name',
    COALESCE((header->>'amount_rendered')::numeric, 0),
    COALESCE((header->>'voucher')::numeric, 0),
    COALESCE((header->>'grand_total')::numeric, 0),
    COALESCE((header->>'change')::numeric, 0),
    new_invoice_no,
    v_transaction_time,
    v_customer_id,
    v_cashier_name::uuid,
    v_store_id,
    header->>'order_discount_type',
    COALESCE((header->>'order_discount_value')::numeric, 0),
    COALESCE((header->>'order_discount_amount')::numeric, 0),
    (header->>'voucher_id')::uuid,
    header->>'voucher_code'
  ) RETURNING id INTO new_payment_id;

  -- 6. Insert Transactions (Items)
  FOR item IN SELECT * FROM jsonb_array_elements(items) LOOP

    -- Validation
    IF item->>'sku' IS NULL OR item->>'item_name' IS NULL THEN
      RAISE EXCEPTION 'SKU and item_name are required';
    END IF;

    -- Look up category_id based on SKU and store_id
    SELECT category_id INTO v_category_id
    FROM public.items
    WHERE sku = item->>'sku' AND store_id = v_store_id
    LIMIT 1;

    INSERT INTO public.transactions (
      sku, 
      item_name, 
      sales_price, 
      total_price, 
      discount, 
      quantity, 
      invoice_no, 
      transaction_time, 
      payment_id, 
      cashier, 
      store_id,
      category_id,
      discount_type
    ) VALUES (
      item->>'sku',
      item->>'item_name',
      COALESCE((item->>'sales_price')::numeric, 0),
      COALESCE((item->>'total_price')::numeric, 0),
      COALESCE((item->>'discount')::numeric, 0),
      COALESCE((item->>'quantity')::numeric, 0),
      new_invoice_no,
      v_transaction_time,
      new_payment_id,
      v_cashier_name::uuid,
      v_store_id,
      v_category_id,
      COALESCE(item->>'discount_type', 'flat')
    );
  END LOOP;

  -- 7. Update Customer Metrics (if applicable)
  IF v_customer_id IS NOT NULL THEN
     UPDATE customers 
     SET 
       total_spent = total_spent + COALESCE((header->>'grand_total')::numeric, 0),
       visit_count = visit_count + 1,
       last_visit_at = v_transaction_time
     WHERE id = v_customer_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'invoice_no', new_invoice_no, 'payment_id', new_payment_id);
EXCEPTION 
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to insert payment and transactions: %', SQLERRM;
END;
$function$;
