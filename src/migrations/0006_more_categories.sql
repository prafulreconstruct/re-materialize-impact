-- Extra material categories. 'Other' is pushed to the end of the index.

insert into public.material_categories (code, key, label, icon, sort_order)
values
  ('MAT-10', 'glass', 'Glass & windows', 'other', 10),
  ('MAT-11', 'paints', 'Paints & chemicals', 'other', 11),
  ('MAT-12', 'tools', 'Tools & equipment', 'other', 12)
on conflict (code) do update
set
  key = excluded.key,
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

update public.material_categories set sort_order = 99 where key = 'other';

update public.listings
set category_id = (select id from public.material_categories where key = 'glass')
where name = 'Aluminium Window Profiles (approx. 85 kg)';
