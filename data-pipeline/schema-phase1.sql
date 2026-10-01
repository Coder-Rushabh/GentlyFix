-- Phase 1 migration. Run in Supabase dashboard > SQL Editor (after schema.sql).

create extension if not exists pg_trgm;

-- 1. Nearby search, now with an optional "has phone" filter.
drop function if exists public.nearby_businesses(double precision, double precision, text, int, int);
create or replace function public.nearby_businesses(
  p_lat double precision, p_lng double precision, p_category text,
  p_radius_m int default 10000, p_limit int default 50, p_require_phone boolean default false)
returns table (id text, name text, phone text, website text, address text, city text, lat double precision, lng double precision,
               rating_avg real, rating_count int, status text, distance_m double precision)
language sql stable set search_path = public, extensions as $$
  select b.id, b.name, b.phone, b.website, b.address, b.city, b.lat, b.lng, b.rating_avg, b.rating_count, b.status,
         st_distance(b.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distance_m
  from public.businesses b
  join public.business_categories c on c.business_id = b.id and c.category = p_category
  where st_dwithin(b.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_radius_m)
    and (not p_require_phone or coalesce(b.phone, '') <> '')
  order by distance_m
  limit p_limit;
$$;

-- 2. Fuzzy name search (typo tolerant), ranked by prefix match, similarity, then distance.
create or replace function public.search_businesses(
  p_query text, p_lat double precision default null, p_lng double precision default null, p_limit int default 50)
returns table (id text, name text, phone text, website text, address text, city text, lat double precision, lng double precision,
               rating_avg real, rating_count int, status text, distance_m double precision)
language sql stable set search_path = public, extensions as $$
  select s.id, s.name, s.phone, s.website, s.address, s.city, s.lat, s.lng, s.rating_avg, s.rating_count, s.status, s.distance_m
  from (
    select b.id, b.name, b.phone, b.website, b.address, b.city, b.lat, b.lng, b.rating_avg, b.rating_count, b.status,
           case when p_lat is null or p_lng is null then null
                else st_distance(b.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) end as distance_m,
           (b.name ilike p_query || '%') as prefix_hit,
           similarity(b.name, p_query) as sim
    from public.businesses b
    where length(trim(p_query)) >= 2
      and (b.name % p_query or b.name ilike '%' || p_query || '%')
  ) s
  order by prefix_hit desc, sim desc, distance_m nulls last
  limit p_limit;
$$;

-- 3. Cities with enough listings, for the manual location picker.
create or replace function public.list_cities()
returns table (city text, state text, lat double precision, lng double precision, n int)
language sql stable as $$
  select b.city, b.state, avg(b.lat)::double precision, avg(b.lng)::double precision, count(*)::int
  from public.businesses b
  where coalesce(b.city, '') <> ''
  group by b.city, b.state
  having count(*) >= 15
  order by count(*) desc;
$$;

-- 4. User reports (wrong info) and suggestions (missing business). Anyone may insert; nobody can read via the public key.
create table if not exists public.business_reports (
  id bigint generated always as identity primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('wrong_phone','wrong_address','wrong_location','closed','wrong_category','other')),
  message text check (char_length(message) <= 1000),
  suggested_value text check (char_length(suggested_value) <= 300),
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create table if not exists public.business_suggestions (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (char_length(category) <= 60),
  phone text check (char_length(phone) <= 20),
  address text check (char_length(address) <= 300),
  city text check (char_length(city) <= 100),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.business_reports enable row level security;
alter table public.business_suggestions enable row level security;
drop policy if exists "anyone can report" on public.business_reports;
drop policy if exists "anyone can suggest" on public.business_suggestions;
create policy "anyone can report" on public.business_reports for insert to anon, authenticated with check (status = 'new');
create policy "anyone can suggest" on public.business_suggestions for insert to anon, authenticated with check (status = 'new');

-- 5. Service categories shown on the home screen; icons live in the public Storage bucket "category-icons".
create table if not exists public.categories (
  id         bigint generated always as identity primary key,
  name       text not null unique,      -- matches business_categories.category
  icon       text,                      -- file name inside the category-icons bucket
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
drop policy if exists "public read categories list" on public.categories;
create policy "public read categories list" on public.categories for select using (active);
