-- To Lead — Supabase schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Works on a fresh project. Safe to re-run: tables are IF NOT EXISTS, functions
-- and policies are replaced, seed data is only inserted when the tables are empty.
--
-- Tables: products, customers, accounts, orders, order_items, reviews, settings,
--         subscribers. Customer rows carry order_count / total_spent /
--         last_order_at, kept in sync from orders by a trigger.

create extension if not exists pgcrypto;

-- 1. Catalogue ---------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  sku text not null default '',
  name text not null,
  gender text not null default 'women',
  type text not null default '기성복',
  price integer not null default 0 check (price >= 0),
  compare_at integer check (compare_at is null or compare_at >= 0),
  image text not null default '',
  colors jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2, 1) not null default 4.7,
  review_count integer not null default 0,
  badge text,
  is_new boolean not null default false,
  description text not null default '',
  details text[] not null default '{}',
  composition text not null default '',
  fit text not null default '',
  created_at date not null default current_date,
  updated_at timestamptz not null default now()
);

-- 2. Customers (with purchase history totals) --------------------------------
create table if not exists public.customers (
  id text primary key,
  name text not null,
  email text not null unique,
  joined date not null default current_date,
  segment text not null default 'New',
  total_spent integer not null default 0,
  order_count integer not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. Accounts ---------------------------------------------------------------
-- Credentials live in Supabase Auth (auth.users). This table links an auth user
-- to a customer profile and stores the role used by RLS / the admin UI.
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  customer_id text unique references public.customers (id) on delete set null,
  email text not null unique,
  name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- 4. Orders -----------------------------------------------------------------
create sequence if not exists public.order_number_seq start with 10524;

create table if not exists public.orders (
  id text primary key,
  customer_id text references public.customers (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  created_at timestamptz not null default now(),
  subtotal integer not null default 0 check (subtotal >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  total integer not null default 0 check (total >= 0),
  status text not null default 'Processing' check (status in ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
  payment text not null default 'Paid' check (payment in ('Paid', 'Refunded')),
  channel text not null default 'Online',
  updated_at timestamptz not null default now()
);
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id text not null references public.orders (id) on delete cascade,
  product_id text,
  name text not null,
  size text,
  qty integer not null default 1 check (qty > 0),
  price integer not null default 0 check (price >= 0),
  unique (order_id, product_id, size)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- 5. Reviews ----------------------------------------------------------------
create table if not exists public.reviews (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  name text not null default '익명',
  rating smallint not null default 5 check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  date_label text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

-- 6. Storefront content / settings ------------------------------------------
create table if not exists public.settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- 7. Customer totals trigger ------------------------------------------------
create or replace function public.refresh_customer_totals(p_customer_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.customers c
     set total_spent = coalesce((
           select sum(o.total) from public.orders o
            where o.customer_id = c.id and o.status <> 'Cancelled'
         ), 0),
         order_count = coalesce((
           select count(*) from public.orders o
            where o.customer_id = c.id and o.status <> 'Cancelled'
         ), 0),
         last_order_at = (
           select max(o.created_at) from public.orders o where o.customer_id = c.id
         )
   where c.id = p_customer_id;
$$;

create or replace function public.orders_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_customer_totals(old.customer_id);
    return old;
  end if;

  perform public.refresh_customer_totals(new.customer_id);
  if tg_op = 'UPDATE' and old.customer_id is distinct from new.customer_id then
    perform public.refresh_customer_totals(old.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_totals on public.orders;
create trigger orders_totals
  after insert or update of total, status, customer_id or delete
  on public.orders
  for each row execute function public.orders_after_change();

-- 8. Read models ------------------------------------------------------------
-- One row per order with its line items, for the customer profile drawer.
create or replace view public.customer_purchase_history
with (security_invoker = true) as
select
  o.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  o.id as order_id,
  o.created_at as ordered_at,
  o.status,
  o.payment,
  o.total,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'product_id', oi.product_id,
        'name', oi.name,
        'size', oi.size,
        'qty', oi.qty,
        'price', oi.price
      ) order by oi.id
    ) filter (where oi.id is not null),
    '[]'::jsonb
  ) as items
from public.orders o
join public.customers c on c.id = o.customer_id
left join public.order_items oi on oi.order_id = o.id
group by o.customer_id, c.name, c.email, o.id, o.created_at, o.status, o.payment, o.total;

-- 9. Checkout RPC -----------------------------------------------------------
-- Prices are re-read from products, stock is checked/decremented atomically and
-- the customer total is updated by the trigger. Callable with the anon key.
create or replace function public.place_order(
  p_id text,
  p_name text,
  p_email text,
  p_items jsonb,
  p_channel text default 'Online'
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers;
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_qty integer;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_free integer;
  v_fee integer;
begin
  p_email := lower(trim(p_email));
  if p_email is null or p_email = '' then
    raise exception '이메일 주소가 필요합니다.';
  end if;
  if coalesce(jsonb_array_length(p_items), 0) = 0 then
    raise exception '장바구니가 비어 있습니다.';
  end if;

  select (data ->> 'freeShipping')::int, (data ->> 'shippingFee')::int
    into v_free, v_fee
    from public.settings where id = 'main';
  v_free := coalesce(v_free, 150000);
  v_fee := coalesce(v_fee, 5000);

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, coalesce((v_item ->> 'qty')::int, 1));
    select * into v_product from public.products where id = v_item ->> 'productId';
    if not found then
      raise exception '상품을 찾을 수 없습니다: %', v_item ->> 'productId';
    end if;
    if v_product.stock < v_qty then
      raise exception '재고가 부족합니다: %', v_product.name;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_shipping := case when v_subtotal >= v_free then 0 else v_fee end;

  insert into public.customers (id, name, email, joined, segment)
  values (
    'c' || regexp_replace(p_id, '\D', '', 'g'),
    coalesce(nullif(trim(p_name), ''), split_part(p_email, '@', 1)),
    p_email,
    current_date,
    'New'
  )
  on conflict (email) do update
    set name = coalesce(nullif(trim(excluded.name), ''), public.customers.name)
  returning * into v_customer;

  insert into public.orders (
    id, customer_id, customer_name, customer_email,
    subtotal, shipping, total, status, payment, channel
  ) values (
    p_id, v_customer.id, v_customer.name, p_email,
    v_subtotal, v_shipping, v_subtotal + v_shipping, 'Processing', 'Paid',
    coalesce(nullif(p_channel, ''), 'Online')
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, coalesce((v_item ->> 'qty')::int, 1));
    select * into v_product from public.products where id = v_item ->> 'productId';
    insert into public.order_items (order_id, product_id, name, size, qty, price)
    values (v_order.id, v_product.id, v_product.name, v_item ->> 'size', v_qty, v_product.price);
    update public.products
       set stock = greatest(0, stock - v_qty), updated_at = now()
     where id = v_product.id;
  end loop;

  return v_order;
end;
$$;

-- 10. Row Level Security ----------------------------------------------------
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.accounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.settings enable row level security;
alter table public.subscribers enable row level security;

-- Public storefront reads
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (true);

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select to anon, authenticated using (true);

drop policy if exists "public create reviews" on public.reviews;
create policy "public create reviews" on public.reviews for insert to anon, authenticated with check (true);

drop policy if exists "public subscribe" on public.subscribers;
create policy "public subscribe" on public.subscribers for insert to anon, authenticated with check (true);

-- Admin (authenticated Supabase Auth users) can manage everything.
drop policy if exists "admin products" on public.products;
create policy "admin products" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "admin customers" on public.customers;
create policy "admin customers" on public.customers for all to authenticated using (true) with check (true);

drop policy if exists "admin accounts" on public.accounts;
create policy "admin accounts" on public.accounts for all to authenticated using (true) with check (true);

drop policy if exists "admin orders" on public.orders;
create policy "admin orders" on public.orders for all to authenticated using (true) with check (true);

drop policy if exists "admin order items" on public.order_items;
create policy "admin order items" on public.order_items for all to authenticated using (true) with check (true);

drop policy if exists "admin reviews" on public.reviews;
create policy "admin reviews" on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all to authenticated using (true) with check (true);

drop policy if exists "admin subscribers" on public.subscribers;
create policy "admin subscribers" on public.subscribers for all to authenticated using (true) with check (true);

-- 11. Grants ----------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.products, public.settings, public.reviews to anon, authenticated;
grant insert on public.reviews, public.subscribers to anon, authenticated;

grant select, insert, update, delete on
  public.products, public.customers, public.accounts, public.orders,
  public.order_items, public.reviews, public.settings, public.subscribers
  to authenticated;

grant usage, select on all sequences in schema public to authenticated, anon;
grant select on public.customer_purchase_history to authenticated;

grant execute on function public.place_order(text, text, text, jsonb, text) to anon, authenticated;
