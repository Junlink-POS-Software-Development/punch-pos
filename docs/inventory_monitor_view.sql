create view public.inventory_monitor_view as
with
  flow_agg as (
    select
      stock_flow.item_id,
      COALESCE(
        sum(
          case
            when stock_flow.flow = 'stock-in'::text then stock_flow.quantity
            else 0::numeric
          end
        ),
        0::numeric
      ) as manual_added,
      COALESCE(
        sum(
          case
            when stock_flow.flow = 'stock-out'::text then stock_flow.quantity
            else 0::numeric
          end
        ),
        0::numeric
      ) as manual_removed
    from
      stock_flow
    group by
      stock_flow.item_id
  ),
  sales_agg as (
    select
      transactions.sku,
      transactions.store_id,
      COALESCE(sum(transactions.quantity), 0::numeric) as total_sold
    from
      transactions
    group by
      transactions.sku,
      transactions.store_id
  )
select
  i.id as item_id,
  i.store_id,
  i.item_name,
  i.sku,
  pc.category,
  i.sales_price,
  i.unit_cost,
  i.image_url,
  i.description,
  i.low_stock_threshold,
  COALESCE(fa.manual_added, 0::numeric) as quantity_in,
  COALESCE(fa.manual_removed, 0::numeric) as quantity_manual_out,
  COALESCE(sa.total_sold, 0::numeric) as quantity_sold,
  COALESCE(fa.manual_added, 0::numeric) - COALESCE(fa.manual_removed, 0::numeric) - COALESCE(sa.total_sold, 0::numeric) as current_stock,
  case
    when (
      COALESCE(fa.manual_added, 0::numeric) - COALESCE(fa.manual_removed, 0::numeric) - COALESCE(sa.total_sold, 0::numeric)
    ) <= 0::numeric then 'out_of_stock'::text
    when (
      COALESCE(fa.manual_added, 0::numeric) - COALESCE(fa.manual_removed, 0::numeric) - COALESCE(sa.total_sold, 0::numeric)
    ) <= i.low_stock_threshold::numeric then 'low_stock'::text
    else 'in_stock'::text
  end as stock_status
from
  items i
  left join product_category pc on i.category_id = pc.id
  left join flow_agg fa on i.id = fa.item_id
  left join sales_agg sa on i.sku = sa.sku
  and i.store_id = sa.store_id;
