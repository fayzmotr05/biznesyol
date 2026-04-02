-- Bank products table — managed via admin panel in future
create table if not exists bank_products (
  id varchar(100) primary key,
  bank_name varchar(200) not null default 'Asakabank',
  name_uz varchar(300) not null,
  name_ru varchar(300),
  type varchar(50) not null,
  description_uz text,
  who_can_get_uz text,
  min_amount_mln float not null,
  max_amount_mln float not null,
  interest_rate_percent varchar(200),
  interest_rate_number float,
  term_months_max int,
  grace_period_months int default 0,
  collateral_type text,
  requires_collateral boolean default false,
  requires_guarantor boolean default false,
  digital_application boolean default false,
  repayment varchar(100),
  target varchar(50),
  age_min int default 18,
  age_max int default 65,
  special_conditions_uz text,
  suitable_for_spheres text[],
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bank_products enable row level security;

create policy "anon_read_bank_products"
  on bank_products for select
  to anon
  using (is_active = true);

create policy "service_role_bank_products"
  on bank_products for all
  to service_role
  using (true)
  with check (true);
