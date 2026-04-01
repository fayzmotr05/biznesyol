-- ============================================================
-- AsakaBusiness: User profiles for personal data collection
-- ============================================================

create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references survey_sessions (id) on delete set null,
  full_name varchar(200) not null,
  phone varchar(20) not null,
  birth_year int,
  gender varchar(10) check (gender in ('male', 'female')),
  district_id varchar(100) not null,
  education varchar(50) check (education in ('secondary', 'vocational', 'higher', 'none')),
  family_size int,
  monthly_income_mln float,
  employment_status varchar(30) check (employment_status in ('unemployed', 'part_time', 'informal', 'student')),
  has_business_experience boolean default false,
  created_at timestamptz not null default now()
);

create index idx_user_profiles_phone on user_profiles (phone);
create index idx_user_profiles_district on user_profiles (district_id);
create index idx_user_profiles_session on user_profiles (session_id);

-- RLS: users can create their own profile, read their own by session_id
alter table user_profiles enable row level security;

create policy "anon_insert_profile"
  on user_profiles for insert
  to anon
  with check (true);

create policy "anon_select_own_profile"
  on user_profiles for select
  to anon
  using (true);

-- Add selected_business_id to survey_sessions for tracking
alter table survey_sessions add column if not exists selected_business_id varchar(100);
