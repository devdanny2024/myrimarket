create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null,
  status text,
  country text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  source_id uuid references sources(id) on delete set null,
  source_url text,
  price_ngn numeric(12,2) not null default 0,
  compare_at_ngn numeric(12,2),
  weighted_score numeric(6,2),
  is_active boolean not null default true,
  is_published boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  run_date date not null,
  status text not null,
  total_candidates int,
  payload jsonb,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sync_run_id uuid not null references sync_runs(id) on delete cascade,
  trend_velocity int,
  margin_potential int,
  supplier_reliability int,
  delivery_fit int,
  repeat_potential int,
  weighted_score numeric(6,2),
  rank int,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_reviewed on products(reviewed_at);
create index if not exists idx_scores_product on scores(product_id);
