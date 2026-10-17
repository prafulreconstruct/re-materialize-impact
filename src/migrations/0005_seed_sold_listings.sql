-- Archive of lots already sold through ReConstruct (Aug–Oct 2026).
-- Listings are attached to the earliest seller profile and marked 'sold'.

insert into public.material_categories (code, key, label, icon, sort_order)
values
  ('MAT-09', 'roofing', 'Roofing & Sheets', 'other', 9)
on conflict (code) do update
set
  key = excluded.key,
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

with seller as (
  select id, full_name
  from public.profiles
  where role = 'seller'
  order by created_at
  limit 1
),
sold (name, category_key, description, location, price, market_price, source, sold_on) as (
  values
    ('AAC Blocks, 600 x 200 x 150 mm (approx. 400 blocks)', 'masonry',
     'Unused AAC blocks left over from a residential tower. Stacked on pallets, edges intact.',
     'Sector 150, Noida', 13500, 24000, 'Excess stock', date '2026-08-03'),
    ('Aluminium Window Profiles (approx. 85 kg)', 'other',
     'Sliding window frames and mullions stripped from an office refit. Sold as one lot by weight.',
     'Okhla Phase II, Delhi', 18500, 34000, 'Demolition', date '2026-08-13'),
    ('Copper Wire Scrap (approx. 22 kg)', 'electrical',
     'Stripped copper wiring recovered from a commercial rewiring job.',
     'Udyog Vihar, Gurugram', 17000, 27000, 'Demolition', date '2026-09-02'),
    ('Modular RWH Crates (30 crates)', 'other',
     'Rainwater harvesting crates, never installed after a design change. Original packaging.',
     'Sector 62, Noida', 17500, 33000, 'Excess stock', date '2026-09-05'),
    ('Teak Wood Door Frames (5 frames)', 'fixtures',
     'Solid teak chaukhats salvaged from a 1980s bungalow. Hardware removed, wood sound.',
     'Greater Kailash, Delhi', 16500, 36000, 'Demolition', date '2026-09-24'),
    ('Galvalume Roofing Sheets (approx. 350 sq ft)', 'roofing',
     'Galvalume sheets taken down from a temporary site shed. Minor fixing holes only.',
     'Sector 37, Gurugram', 15000, 27500, 'Demolition', date '2026-09-25'),
    ('Vitrified Floor Tiles, 600 x 600 mm (approx. 450 sq ft)', 'tiles',
     'Surplus boxes of glazed vitrified tiles from a housing project, same batch and shade.',
     'Greater Noida West', 11000, 22500, 'Excess stock', date '2026-10-06'),
    ('TMT Steel Bar Offcuts, 12 mm (approx. 750 kg)', 'steel',
     'Fe 500D TMT offcuts in mixed lengths from a slab pour. Clean, no corrosion.',
     'Sector 18, Noida', 28000, 47000, 'Excess stock', date '2026-10-11'),
    ('Ceramic Washbasins and WC Units (4 basins, 3 WCs)', 'sanitary',
     'Wall-hung basins and floor-mounted WCs removed from a hotel renovation. No chips.',
     'Karol Bagh, Delhi', 9000, 25000, 'Demolition', date '2026-10-14')
)
insert into public.listings (
  seller_id,
  seller_name,
  category_id,
  name,
  description,
  location,
  price,
  market_price,
  source,
  status,
  created_at,
  updated_at
)
select
  seller.id,
  seller.full_name,
  c.id,
  sold.name,
  sold.description,
  sold.location,
  sold.price,
  sold.market_price,
  sold.source,
  'sold',
  sold.sold_on::timestamptz,
  sold.sold_on::timestamptz
from sold
cross join seller
join public.material_categories c on c.key = sold.category_key
where not exists (
  select 1 from public.listings l where l.name = sold.name
);
