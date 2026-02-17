-- Create the overall_cash_flow view for live "Cash in Drawer" tracking
create view public.overall_cash_flow as
with
  daily_gross_sales as (
    select
      t.store_id,
      t.transaction_time::date as flow_date,
      sum(t.total_price) as gross_sales
    from
      transactions t
      join payments p on t.payment_id = p.id
    where
      t.store_id is not null
    group by
      t.store_id,
      (t.transaction_time::date)
  ),
  daily_vouchers as (
    select
      p.store_id,
      p.transaction_time::date as flow_date,
      sum(p.voucher) as total_voucher
    from
      payments p
    where
      p.voucher > 0::numeric
    group by
      p.store_id,
      (p.transaction_time::date)
  ),
  daily_expenses as (
    select
      e.store_id,
      e.transaction_date as flow_date,
      sum(e.amount) as total_expense
    from
      expenses e
    where
      e.store_id is not null
    group by
      e.store_id,
      e.transaction_date
  ),
  daily_summary as (
    select
      COALESCE(dgs.store_id, dv.store_id, de.store_id) as store_id,
      COALESCE(dgs.flow_date, dv.flow_date, de.flow_date) as date,
      COALESCE(dgs.gross_sales, 0::numeric) - COALESCE(dv.total_voucher, 0::numeric) as cash_in,
      COALESCE(de.total_expense, 0::numeric) as cash_out
    from
      daily_gross_sales dgs
      full join daily_vouchers dv on dgs.store_id = dv.store_id
      and dgs.flow_date = dv.flow_date
      full join daily_expenses de on COALESCE(dgs.store_id, dv.store_id) = de.store_id
      and COALESCE(dgs.flow_date, dv.flow_date) = de.flow_date
  ),
  running_ledger as (
    select
      ds.store_id,
      'Overall'::text as category,
      ds.date,
      ds.cash_in,
      ds.cash_out,
      sum(ds.cash_in - ds.cash_out) over (
        partition by
          ds.store_id
        order by
          ds.date
      ) as ending_balance
    from
      daily_summary ds
  )
select
  store_id,
  category,
  date,
  lag(ending_balance, 1, 0::numeric) over (
    partition by
      store_id
    order by
      date
  ) as forwarded,
  cash_in,
  cash_out,
  ending_balance as balance
from
  running_ledger;
