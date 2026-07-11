insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

alter table public.listings
add column if not exists image_paths text[] not null default '{}'::text[];

drop policy if exists "allow_all_listing_images" on storage.objects;
create policy "allow_all_listing_images"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'listing-images')
with check (bucket_id = 'listing-images');
