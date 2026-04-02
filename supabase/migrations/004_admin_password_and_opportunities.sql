-- 1. Store plain password for super admin to view/share
alter table admins add column if not exists password_plain varchar(200);

-- 2. Opportunities/loans table (admin can add bank products, government programs, etc.)
create table if not exists opportunities (
  id uuid primary key default uuid_generate_v4(),
  title_uz varchar(300) not null,
  title_ru varchar(300) not null,
  title_en varchar(300),
  provider varchar(200) not null,
  type varchar(30) not null check (type in ('loan', 'grant', 'subsidy', 'program', 'training')),
  description_uz text,
  description_ru text,
  description_en text,
  min_amount_mln float,
  max_amount_mln float,
  interest_rate float,
  term_months int,
  target_spheres text[],
  target_districts text[],
  gender_filter varchar(10) check (gender_filter in ('any', 'female', 'male')),
  age_min int,
  age_max int,
  requires_collateral boolean default false,
  application_url varchar(500),
  is_active boolean default true,
  created_at timestamptz not null default now()
);

alter table opportunities enable row level security;

create policy "anon_read_opportunities"
  on opportunities for select
  to anon
  using (is_active = true);

create policy "service_role_opportunities"
  on opportunities for all
  to service_role
  using (true)
  with check (true);
