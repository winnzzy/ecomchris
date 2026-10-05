-- ============================================================
-- Socyn Crest — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard > SQL).
-- Creates: profiles, products, orders, order_items + RLS policies
-- ============================================================

-- ---------- profiles (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.email,''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Make yourself admin after signing up (run once, replace the email):
-- update public.profiles set is_admin = true where email = 'you@example.com';

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Men',
  price numeric(10,2) not null default 0,
  badge text not null default '',
  image text not null default '',
  description text not null default '',
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  seq serial unique,                       -- human-friendly order number: SC-0001...
  customer_id uuid not null references public.profiles(id),
  customer_name text not null default '',
  email text not null default '',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  address jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- pending|processing|shipped|delivered|cancelled
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null default '',
  name text not null default '',
  price numeric(10,2) not null default 0,
  qty integer not null default 1
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.orders    enable row level security;
alter table public.order_items enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles: users read/update their own; admins read all
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own"   on public.profiles for insert with check (auth.uid() = id);

-- products: everyone reads active ones; admins manage all
create policy "products_select_public" on public.products for select using (active = true or public.is_admin());
create policy "products_admin_all"     on public.products for all using (public.is_admin()) with check (public.is_admin());

-- orders: customers see their own; admins see all
create policy "orders_select" on public.orders for select using (auth.uid() = customer_id or public.is_admin());
create policy "orders_insert" on public.orders for insert with check (auth.uid() = customer_id);
create policy "orders_admin_update" on public.orders for update using (public.is_admin());

-- order_items: visible with their order; created with an order
create policy "items_select" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin()))
);
create policy "items_insert" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);

-- ---------- seed the catalog (optional) ----------
-- Insert your products here, or manage them from the /admin panel once live.
-- Example:
-- insert into public.products (name, category, price, badge, image, description, stock)
-- values ('Essential Cotton T-Shirt', 'Men', 24.99, 'Everyday essential',
--         'photo-1521572163474-6864f9cf17ab',
--         'A breathable 100% cotton tee with a clean, classic cut.', 50);
