-- Run in Supabase dashboard > SQL Editor.
create extension if not exists postgis;
create extension if not exists pg_trgm;

create table if not exists public.businesses (
  id          text primary key,              -- source id (Overture GERS id)
  name        text not null,
  taxonomy    text,
  confidence  real,
  phone       text,
  website     text,
  email       text,
  social      text,
  address     text,
  city        text,
  state       text,
  postcode    text,
  lat         double precision not null,
  lng         double precision not null,
  location    geography(Point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored,
  source      text,
  status      text not null default 'unclaimed' check (status in ('unclaimed','claimed','verified')),
  owner_id    uuid,                          -- phase 2
  rating_avg  real not null default 0,       -- phase 2
  rating_count int not null default 0,
  created_at  timestamptz not null default now()
);
create table if not exists public.business_categories (
  business_id text not null references public.businesses(id) on delete cascade,
  category    text not null,
  primary key (business_id, category)
);
create index if not exists businesses_location_idx on public.businesses using gist (location);
create index if not exists businesses_name_trgm on public.businesses using gin (name gin_trgm_ops);
create index if not exists business_categories_cat on public.business_categories (category);

alter table public.businesses enable row level security;
alter table public.business_categories enable row level security;
create policy "public read businesses" on public.businesses for select using (true);
create policy "public read categories" on public.business_categories for select using (true);

-- Nearby search used by the app: select * from nearby_businesses(18.52, 73.85, 'Plumber', 10000);
create or replace function public.nearby_businesses(p_lat double precision, p_lng double precision, p_category text, p_radius_m int default 10000, p_limit int default 50)
returns table (id text, name text, phone text, website text, address text, city text, lat double precision, lng double precision, rating_avg real, rating_count int, status text, distance_m double precision)
language sql stable as $$
  select b.id, b.name, b.phone, b.website, b.address, b.city, b.lat, b.lng, b.rating_avg, b.rating_count, b.status,
         st_distance(b.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distance_m
  from public.businesses b
  join public.business_categories c on c.business_id = b.id and c.category = p_category
  where st_dwithin(b.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_radius_m)
  order by distance_m
  limit p_limit;
$$;
