alter table public.material_categories drop constraint if exists material_categories_icon_check;
alter table public.material_categories add constraint material_categories_icon_check
  check (icon in ('door', 'tile', 'steel', 'sanitary', 'wood', 'electric', 'other'));

insert into public.material_categories (code, key, label, icon, sort_order)
values
  ('MAT-01', 'fixtures', 'Doors & fixtures', 'door', 1),
  ('MAT-02', 'tiles', 'Tiles & flooring', 'tile', 2),
  ('MAT-03', 'steel', 'Structural steel', 'steel', 3),
  ('MAT-04', 'sanitary', 'Sanitary ware', 'sanitary', 4),
  ('MAT-05', 'wood', 'Timber & wood', 'wood', 5),
  ('MAT-06', 'electrical', 'Electrical', 'electric', 6),
  ('MAT-07', 'other', 'other', 'other', 7)

on conflict (code) do update
set
  key = excluded.key,
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order;
