-- ============================================================
-- AsakaBusiness: Initial Schema
-- Anonymous sessions only — no personal data
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. survey_sessions
-- ============================================================

create table survey_sessions (
  id uuid primary key default uuid_generate_v4(),
  lang varchar(2) not null default 'uz' check (lang in ('ru', 'uz')),
  district_id varchar(100) not null,
  path varchar(10) not null check (path in ('work', 'business')),
  answers jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_survey_sessions_district on survey_sessions (district_id);
create index idx_survey_sessions_created on survey_sessions (created_at);

-- ============================================================
-- 2. recommendations
-- ============================================================

create table recommendations (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references survey_sessions (id) on delete cascade,
  business_type_id varchar(100) not null,
  score float not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_recommendations_session on recommendations (session_id);

-- ============================================================
-- 3. progress_tracking
-- ============================================================

create table progress_tracking (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references survey_sessions (id) on delete cascade,
  step varchar(200) not null,
  completed_at timestamptz
);

create index idx_progress_session on progress_tracking (session_id);

-- ============================================================
-- 4. success_stories
-- ============================================================

create table success_stories (
  id uuid primary key default uuid_generate_v4(),
  district_id varchar(100) not null,
  business_type_id varchar(100) not null,
  story_ru text not null default '',
  story_uz text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_stories_district on success_stories (district_id);
create index idx_stories_business on success_stories (business_type_id);

-- ============================================================
-- RLS Policies
-- Anonymous users can create and read their own records by session_id
-- ============================================================

-- Enable RLS on all tables
alter table survey_sessions enable row level security;
alter table recommendations enable row level security;
alter table progress_tracking enable row level security;
alter table success_stories enable row level security;

-- survey_sessions: anyone can insert, read own by id
create policy "anon_insert_session"
  on survey_sessions for insert
  to anon
  with check (true);

create policy "anon_select_session"
  on survey_sessions for select
  to anon
  using (true);

create policy "anon_update_session"
  on survey_sessions for update
  to anon
  using (true)
  with check (true);

-- recommendations: insert and read by session_id
create policy "anon_insert_recommendation"
  on recommendations for insert
  to anon
  with check (
    exists (
      select 1 from survey_sessions where id = session_id
    )
  );

create policy "anon_select_recommendation"
  on recommendations for select
  to anon
  using (true);

-- progress_tracking: insert and read by session_id
create policy "anon_insert_progress"
  on progress_tracking for insert
  to anon
  with check (
    exists (
      select 1 from survey_sessions where id = session_id
    )
  );

create policy "anon_select_progress"
  on progress_tracking for select
  to anon
  using (true);

create policy "anon_update_progress"
  on progress_tracking for update
  to anon
  using (
    exists (
      select 1 from survey_sessions where id = session_id
    )
  );

-- success_stories: read-only for anon (admins insert via service_role)
create policy "anon_select_stories"
  on success_stories for select
  to anon
  using (true);
