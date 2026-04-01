-- ============================================================
-- Admin system: super admin + district admins + district data
-- ============================================================

-- Admin users (login via email/password)
create table if not exists admins (
  id uuid primary key default uuid_generate_v4(),
  email varchar(200) unique not null,
  password_hash varchar(300) not null,
  full_name varchar(200) not null,
  role varchar(20) not null check (role in ('super_admin', 'district_admin')),
  district_id varchar(100), -- null for super_admin, required for district_admin
  is_active boolean default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index idx_admins_email on admins (email);
create index idx_admins_district on admins (district_id);

-- District data (entered by district admin)
create table if not exists district_data (
  id uuid primary key default uuid_generate_v4(),
  district_id varchar(100) unique not null,
  updated_by uuid references admins (id),
  updated_at timestamptz not null default now(),

  -- Demographics
  population int,
  families_count int,
  mahallas_count int,

  -- Employment
  labor_force int,
  employed_count int,
  unemployed_count int,
  unemployment_rate float,
  poverty_rate float,
  poverty_families int,
  migrants_abroad int,
  vacant_jobs int,

  -- Business environment
  small_businesses_count int,
  individual_entrepreneurs int,
  foreign_companies int,
  sme_loans_bln float,
  key_sectors text[], -- array of sector names
  industrial_zones int,
  markets_count int,
  export_volume_mln_usd float,

  -- Infrastructure
  schools_count int,
  kindergartens_count int,
  kindergarten_coverage_pct float,
  hospitals_count int,
  roads_km float,
  electricity_pct float,
  gas_pct float,
  water_pct float,
  road_quality_pct float,

  -- Recommendations
  recommended_sectors text[],
  development_priorities text[],
  notes text
);

create index idx_district_data_district on district_data (district_id);

-- RLS
alter table admins enable row level security;
alter table district_data enable row level security;

-- Only service_role can manage admins
create policy "service_role_admins"
  on admins for all
  to service_role
  using (true)
  with check (true);

-- District data: readable by anon (for AI prompts), writable by service_role
create policy "anon_read_district_data"
  on district_data for select
  to anon
  using (true);

create policy "service_role_district_data"
  on district_data for all
  to service_role
  using (true)
  with check (true);
