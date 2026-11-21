-- To Lead — OPTIONAL demo policies
--
-- The schema is secure by default: the admin UI needs a Supabase Auth session to
-- read orders/customers and to write anything. That is the right setup for a
-- real launch.
--
-- For the public demo you may prefer the hard-coded admin / admin login with no
-- sign-up flow. Running this file lets the anon (public) key read and write the
-- same tables, so admin edits still land in Postgres.
--
-- ⚠ Anyone who has the anon key can then edit or read your data. Use this only
--   for a throwaway demo project, and drop these policies before real customers
--   or real orders exist.

drop policy if exists "demo anon products" on public.products;
create policy "demo anon products" on public.products for all to anon using (true) with check (true);

drop policy if exists "demo anon customers" on public.customers;
create policy "demo anon customers" on public.customers for all to anon using (true) with check (true);

drop policy if exists "demo anon accounts" on public.accounts;
create policy "demo anon accounts" on public.accounts for all to anon using (true) with check (true);

drop policy if exists "demo anon orders" on public.orders;
create policy "demo anon orders" on public.orders for all to anon using (true) with check (true);

drop policy if exists "demo anon order items" on public.order_items;
create policy "demo anon order items" on public.order_items for all to anon using (true) with check (true);

drop policy if exists "demo anon reviews" on public.reviews;
create policy "demo anon reviews" on public.reviews for all to anon using (true) with check (true);

drop policy if exists "demo anon settings" on public.settings;
create policy "demo anon settings" on public.settings for all to anon using (true) with check (true);

drop policy if exists "demo anon subscribers" on public.subscribers;
create policy "demo anon subscribers" on public.subscribers for all to anon using (true) with check (true);

grant select, insert, update, delete on
  public.products, public.customers, public.accounts, public.orders,
  public.order_items, public.reviews, public.settings, public.subscribers
  to anon;

grant select on public.customer_purchase_history to anon;

-- To undo the demo mode later, run supabase/production-policies.sql.
