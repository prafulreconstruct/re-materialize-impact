create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text not null,
  role text not null check (role in ('buyer', 'seller')),
  phone text not null default '',
  address text,
  gst_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    address,
    gst_number
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'buyer'),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    nullif(new.raw_user_meta_data ->> 'gst_number', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    phone = excluded.phone,
    address = excluded.address,
    gst_number = excluded.gst_number,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_profile_from_auth on auth.users;
create trigger sync_profile_from_auth
after insert or update on auth.users
for each row execute procedure public.sync_profile_from_auth();

create table if not exists public.material_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  key text not null unique,
  label text not null unique,
  icon text not null check (icon in ('door', 'tile', 'steel', 'sanitary', 'wood', 'electric', 'other')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  seller_name text not null,
  category_id uuid not null references public.material_categories (id),
  name text not null,
  description text not null,
  location text not null,
  price numeric(12, 2) not null check (price >= 0),
  market_price numeric(12, 2) not null default 0 check (market_price >= 0),
  source text not null check (source in ('Demolition', 'Excess stock')),
  status text not null default 'live' check (status in ('live', 'paused', 'sold')),
  views integer not null default 0 check (views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_name text not null,
  buyer_phone text not null default '',
  seller_id uuid not null references public.profiles (id) on delete cascade,
  seller_name text not null,
  quote_price numeric(12, 2) not null check (quote_price >= 0),
  delivery_preference text not null,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  thread_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (buyer_id, listing_id)
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_name text not null,
  buyer_phone text not null default '',
  seller_id uuid not null references public.profiles (id) on delete cascade,
  seller_name text not null,
  seller_phone text not null default '',
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id),
  listing_name text not null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  seller_name text not null,
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'completed' check (status in ('completed')),
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute procedure public.set_updated_at();

drop trigger if exists interests_set_updated_at on public.interests;
create trigger interests_set_updated_at
before update on public.interests
for each row execute procedure public.set_updated_at();
