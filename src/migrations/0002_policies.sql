grant usage on schema public to anon, authenticated, service_role;

grant all on public.profiles to anon, authenticated;
grant all on public.material_categories to anon, authenticated;
grant all on public.listings to anon, authenticated;
grant all on public.interests to anon, authenticated;
grant all on public.cart_items to anon, authenticated;
grant all on public.threads to anon, authenticated;
grant all on public.messages to anon, authenticated;
grant all on public.orders to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.material_categories enable row level security;
alter table public.listings enable row level security;
alter table public.interests enable row level security;
alter table public.cart_items enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "material_categories_public_read" on public.material_categories;
drop policy if exists "listings_public_read_live" on public.listings;
drop policy if exists "listings_insert_seller" on public.listings;
drop policy if exists "listings_update_seller" on public.listings;
drop policy if exists "listings_delete_seller" on public.listings;
drop policy if exists "interests_participant_read" on public.interests;
drop policy if exists "interests_insert_buyer" on public.interests;
drop policy if exists "interests_update_buyer" on public.interests;
drop policy if exists "interests_update_seller" on public.interests;
drop policy if exists "cart_items_manage_own" on public.cart_items;
drop policy if exists "threads_participant_read" on public.threads;
drop policy if exists "threads_insert_seller" on public.threads;
drop policy if exists "messages_participant_read" on public.messages;
drop policy if exists "messages_insert_participant" on public.messages;
drop policy if exists "orders_participant_read" on public.orders;
drop policy if exists "orders_insert_buyer" on public.orders;

drop policy if exists "allow_all" on public.profiles;
drop policy if exists "allow_all" on public.material_categories;
drop policy if exists "allow_all" on public.listings;
drop policy if exists "allow_all" on public.interests;
drop policy if exists "allow_all" on public.cart_items;
drop policy if exists "allow_all" on public.threads;
drop policy if exists "allow_all" on public.messages;
drop policy if exists "allow_all" on public.orders;

create policy "allow_all"
on public.profiles
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.material_categories
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.listings
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.interests
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.cart_items
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.threads
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.messages
for all
to anon, authenticated
using (true)
with check (true);

create policy "allow_all"
on public.orders
for all
to anon, authenticated
using (true)
with check (true);
