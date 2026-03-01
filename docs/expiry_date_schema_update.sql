-- 1. Add new columns to stock_flow for expiry date and batch tracking
ALTER TABLE public.stock_flow
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS batch_remaining numeric DEFAULT 0;

-- 2. Update insert_new_stock_item RPC to handle expiry_date and FIFO batch tracking
CREATE OR REPLACE FUNCTION public.insert_new_stock_item(
    item_name_in text,
    flow_in text,
    quantity_in numeric,
    capital_price_in numeric,
    notes_in text DEFAULT NULL,
    expiry_date_in date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_store_id uuid;
    v_item_id uuid;
    v_category_id uuid;
    
    -- Variables for FIFO deduction loop
    v_remaining_to_deduct numeric;
    v_batch_record RECORD;
    v_deduct_amount numeric;
BEGIN
    -- 1. Get current authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Get user's store_id
    SELECT store_id INTO v_store_id
    FROM public.users
    WHERE user_id = v_user_id;

    IF v_store_id IS NULL THEN
        RAISE EXCEPTION 'User does not belong to a store';
    END IF;

    -- 3. Find the item
    SELECT id, category_id INTO v_item_id, v_category_id
    FROM public.items
    WHERE item_name = item_name_in AND store_id = v_store_id
    LIMIT 1;

    IF v_item_id IS NULL THEN
         RAISE EXCEPTION 'Item "%" not found in your store. Please register it first.', item_name_in;
    END IF;

    -- 4. Handle Stock Flow (FIFO Logic)
    IF flow_in = 'stock-in' THEN
        -- Simply insert the stock-in record. 
        -- `batch_remaining` is set to the full `quantity_in`.
        INSERT INTO public.stock_flow (
            item_name, flow, quantity, capital_price, notes, 
            time_stamp, user_id, store_id, item_id, category_id,
            expiry_date, batch_remaining
        ) VALUES (
            item_name_in, flow_in, quantity_in, capital_price_in, notes_in, 
            now(), v_user_id, v_store_id, v_item_id, v_category_id,
            expiry_date_in, quantity_in
        );
        
    ELSIF flow_in = 'stock-out' THEN
        -- Insert the stock-out record first (for history)
        -- `batch_remaining` is 0 because stock-outs don't have remaining stock.
        INSERT INTO public.stock_flow (
            item_name, flow, quantity, capital_price, notes, 
            time_stamp, user_id, store_id, item_id, category_id,
            expiry_date, batch_remaining
        ) VALUES (
            item_name_in, flow_in, quantity_in, capital_price_in, notes_in, 
            now(), v_user_id, v_store_id, v_item_id, v_category_id,
            NULL, 0
        );

        -- *** FIFO BATCH DEDUCTION LOGIC ***
        -- We need to deduct `quantity_in` from the active stock-in batches, 
        -- prioritizing those that expire soonest (and then oldest if no expiry).
        
        v_remaining_to_deduct := quantity_in;

        FOR v_batch_record IN 
            SELECT id, batch_remaining 
            FROM public.stock_flow 
            WHERE item_id = v_item_id 
              AND flow = 'stock-in' 
              AND batch_remaining > 0
              AND store_id = v_store_id
            ORDER BY 
              -- Sort by expiry date ASC (expiring soonest first). 
              -- NULLS LAST means items without expiry are used AFTER items with expiry
              expiry_date ASC NULLS LAST, 
              -- Then sort by time_stamp ASC (oldest first - standard FIFO)
              time_stamp ASC
            FOR UPDATE -- Lock rows to prevent race conditions during deduction
        LOOP
            IF v_remaining_to_deduct <= 0 THEN
                EXIT; -- Loop finished when we matched the required quantity
            END IF;

            -- Determine how much we can take from this batch
            IF v_batch_record.batch_remaining <= v_remaining_to_deduct THEN
                -- Take everything from this batch
                v_deduct_amount := v_batch_record.batch_remaining;
            ELSE
                -- Take only what we need from this batch
                v_deduct_amount := v_remaining_to_deduct;
            END IF;

            -- Update the batch record
            UPDATE public.stock_flow 
            SET batch_remaining = batch_remaining - v_deduct_amount
            WHERE id = v_batch_record.id;

            -- Decrease the remaining counter
            v_remaining_to_deduct := v_remaining_to_deduct - v_deduct_amount;
        END LOOP;
        
        -- Optional: We could raise an error here if `v_remaining_to_deduct > 0`
        -- However, it's often better to let it pass and have negative overall stock 
        -- than block a vital sale/stock-out. We'll allow it for now.
        
    ELSE
         RAISE EXCEPTION 'Invalid flow type. Must be "stock-in" or "stock-out".';
    END IF;

END;
$$;
