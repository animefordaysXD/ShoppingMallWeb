-- To Lead — remove the optional demo policies
-- Run this before the store goes live to require a Supabase Auth admin session
-- for reads of orders/customers and for every write.

drop policy if exists "demo anon products" on public.products;
drop policy if exists "demo anon customers" on public.customers;
drop policy if exists "demo anon accounts" on public.accounts;
drop policy if exists "demo anon orders" on public.orders;
drop policy if exists "demo anon order items" on public.order_items;
drop policy if exists "demo anon reviews" on public.reviews;
drop policy if exists "demo anon settings" on public.settings;
drop policy if exists "demo anon subscribers" on public.subscribers;

revoke select, insert, update, delete on
  public.products, public.customers, public.accounts, public.orders,
  public.order_items, public.reviews, public.settings, public.subscribers
  from anon;

-- Restore the storefront's minimal anon grants from schema.sql.
grant select on public.products, public.settings, public.reviews to anon;
grant insert on public.reviews, public.subscribers to anon;
