-- ==============================================================================
-- FIX DAILY STATS RLS & SECURITY DEFINER TRIGGER FUNCTIONS
-- ==============================================================================
-- 1. Update RLS policies on daily_item_stats and daily_store_stats to allow
--    store staff/cashiers (members assigned to the store) to insert and update stats.
-- 2. Mark system triggers (sync_item_stats, update_stats_from_transaction,
--    update_stats_from_payment, sync_customer_metrics) and insert_new_payment_and_transaction
--    as SECURITY DEFINER with search_path = public.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RLS Policies: daily_item_stats
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insert Daily Item Stats" ON public.daily_item_stats;
DROP POLICY IF EXISTS "Update Daily Item Stats" ON public.daily_item_stats;

CREATE POLICY "Insert Daily Item Stats"
ON public.daily_item_stats
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_item_stats.store_id
  )
);

CREATE POLICY "Update Daily Item Stats"
ON public.daily_item_stats
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_item_stats.store_id
  )
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_item_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_item_stats.store_id
  )
);

-- ------------------------------------------------------------------------------
-- 2. RLS Policies: daily_store_stats
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insert Daily Store Stats" ON public.daily_store_stats;
DROP POLICY IF EXISTS "Update Daily Store Stats" ON public.daily_store_stats;

CREATE POLICY "Insert Daily Store Stats"
ON public.daily_store_stats
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_store_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_store_stats.store_id
  )
);

CREATE POLICY "Update Daily Store Stats"
ON public.daily_store_stats
FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_store_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_store_stats.store_id
  )
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.store_id = daily_store_stats.store_id
      AND (s.user_id = auth.uid() OR auth.uid() = ANY(s.co_admins))
  )
  OR
  store_id = ((auth.jwt() -> 'app_metadata' ->> 'store_id')::uuid)
  OR
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = auth.uid() AND u.store_id = daily_store_stats.store_id
  )
);

-- ------------------------------------------------------------------------------
-- 3. Trigger Functions as SECURITY DEFINER
-- ------------------------------------------------------------------------------

-- sync_item_stats
CREATE OR REPLACE FUNCTION public.sync_item_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_item_id uuid;
BEGIN
    -- HELPER: Get the item_id from the SKU
    -- 1. SUBTRACT OLD VALUES (For Update or Delete)
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        v_item_id := (SELECT id FROM public.items WHERE sku = OLD.sku AND store_id = OLD.store_id LIMIT 1);
        
        UPDATE public.daily_item_stats
        SET 
            quantity_sold = quantity_sold - OLD.quantity,
            total_revenue = total_revenue - OLD.total_price
        WHERE store_id = OLD.store_id 
          AND item_id = v_item_id
          AND date = (OLD.transaction_time AT TIME ZONE 'Asia/Manila')::date;
    END IF;

    -- 2. ADD NEW VALUES (For Update or Insert)
    IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        v_item_id := (SELECT id FROM public.items WHERE sku = NEW.sku AND store_id = NEW.store_id LIMIT 1);
        
        INSERT INTO public.daily_item_stats (store_id, item_id, item_name, category_id, date, quantity_sold, total_revenue)
        VALUES (
            NEW.store_id,
            v_item_id,
            NEW.item_name,
            NEW.category_id,
            (NEW.transaction_time AT TIME ZONE 'Asia/Manila')::date,
            NEW.quantity,
            NEW.total_price
        )
        ON CONFLICT (store_id, item_id, date) 
        DO UPDATE SET 
            quantity_sold = daily_item_stats.quantity_sold + EXCLUDED.quantity_sold,
            total_revenue = daily_item_stats.total_revenue + EXCLUDED.total_revenue;
    END IF;

    RETURN NULL;
END;
$function$;

-- update_stats_from_payment
CREATE OR REPLACE FUNCTION public.update_stats_from_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_old_date date; v_new_date date;
    v_old_store uuid; v_new_store uuid;
BEGIN
    -- STEP A: REVERSE THE OLD DATA (For Deletes and Updates)
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        v_old_date := DATE(OLD.transaction_time);
        v_old_store := OLD.store_id;
        
        UPDATE public.daily_store_stats
        SET 
            total_gross_sales = total_gross_sales - (COALESCE(OLD.amount_paid, 0) + COALESCE(OLD.voucher, 0)),
            total_net_sales = total_net_sales - COALESCE(OLD.amount_paid, 0),
            transaction_count = transaction_count - 1
        WHERE store_id = v_old_store AND date = v_old_date;
        
        UPDATE public.daily_store_stats
        SET 
            gross_profit = total_net_sales - total_cogs,
            net_profit = (total_net_sales - total_cogs) - total_opex
        WHERE store_id = v_old_store AND date = v_old_date;

        PERFORM public.sync_running_balances(v_old_store, v_old_date);
    END IF;

    -- STEP B: APPLY THE NEW DATA (For Inserts and Updates)
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_new_date := DATE(NEW.transaction_time);
        v_new_store := NEW.store_id;

        INSERT INTO public.daily_store_stats (
            store_id, date, total_gross_sales, total_net_sales, transaction_count
        ) VALUES (
            v_new_store, v_new_date, 
            (COALESCE(NEW.amount_paid, 0) + COALESCE(NEW.voucher, 0)), 
            COALESCE(NEW.amount_paid, 0), 1
        ) ON CONFLICT (store_id, date) DO UPDATE SET
            total_gross_sales = daily_store_stats.total_gross_sales + EXCLUDED.total_gross_sales,
            total_net_sales = daily_store_stats.total_net_sales + EXCLUDED.total_net_sales,
            transaction_count = daily_store_stats.transaction_count + 1;

        UPDATE public.daily_store_stats
        SET 
            gross_profit = total_net_sales - total_cogs,
            net_profit = (total_net_sales - total_cogs) - total_opex
        WHERE store_id = v_new_store AND date = v_new_date;

        PERFORM public.sync_running_balances(v_new_store, v_new_date);
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$function$;

-- update_stats_from_transaction
CREATE OR REPLACE FUNCTION public.update_stats_from_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    UPDATE public.daily_store_stats
    SET total_net_sales = total_net_sales - COALESCE(NEW.discount, 0),
        gross_profit = (total_net_sales - COALESCE(NEW.discount, 0)) - total_cogs,
        net_profit = ((total_net_sales - COALESCE(NEW.discount, 0)) - total_cogs) - total_opex
    WHERE store_id = NEW.store_id AND date = DATE(NEW.transaction_time);
    
    PERFORM public.sync_running_balances(NEW.store_id, DATE(NEW.transaction_time));
    RETURN NEW;
END;
$function$;

-- sync_customer_metrics
CREATE OR REPLACE FUNCTION public.sync_customer_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_target_customer uuid;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_target_customer := OLD.customer_id;
    ELSE
        v_target_customer := NEW.customer_id;
    END IF;

    IF v_target_customer IS NOT NULL THEN
        UPDATE public.customers
        SET 
            total_spent = (SELECT COALESCE(SUM(amount_paid), 0) FROM public.payments WHERE customer_id = v_target_customer),
            visit_count = (SELECT COUNT(id) FROM public.payments WHERE customer_id = v_target_customer),
            last_visit_at = (SELECT MAX(transaction_time) FROM public.payments WHERE customer_id = v_target_customer)
        WHERE id = v_target_customer;
    END IF;

    IF (TG_OP = 'UPDATE' AND OLD.customer_id IS DISTINCT FROM NEW.customer_id AND OLD.customer_id IS NOT NULL) THEN
        UPDATE public.customers
        SET 
            total_spent = (SELECT COALESCE(SUM(amount_paid), 0) FROM public.payments WHERE customer_id = OLD.customer_id),
            visit_count = (SELECT COUNT(id) FROM public.payments WHERE customer_id = OLD.customer_id),
            last_visit_at = (SELECT MAX(transaction_time) FROM public.payments WHERE customer_id = OLD.customer_id)
        WHERE id = OLD.customer_id;
    END IF;

    RETURN NULL; 
END;
$function$;

-- insert_new_payment_and_transaction
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

  -- 4. Generate Invoice No
  new_invoice_no := 'INV-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(md5(random()::text) from 1 for 4);

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
