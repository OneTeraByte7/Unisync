-- CRM schema for Supabase
-- Run this in the SQL editor or include in your migration pipeline.

-- Required extensions -------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "moddatetime";

-- Leads --------------------------------------------------------------------
create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'New',
  source text not null default 'Website',
  owner text,
  value numeric(12, 2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_leads_status_idx on public.crm_leads (status);
create index if not exists crm_leads_source_idx on public.crm_leads (source);

create trigger set_timestamp_crm_leads
  before update on public.crm_leads
  for each row execute procedure moddatetime(updated_at);

-- Organizations -------------------------------------------------------------
create table if not exists public.crm_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  size text,
  website text,
  phone text,
  status text not null default 'Prospect',
  owner text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_org_status_idx on public.crm_organizations (status);
create index if not exists crm_org_industry_idx on public.crm_organizations (industry);

create trigger set_timestamp_crm_organizations
  before update on public.crm_organizations
  for each row execute procedure moddatetime(updated_at);

-- Contacts ------------------------------------------------------------------
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  role text,
  organization_id uuid references public.crm_organizations(id) on delete set null,
  owner text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_contacts_org_idx on public.crm_contacts (organization_id);
create index if not exists crm_contacts_owner_idx on public.crm_contacts (owner);

create trigger set_timestamp_crm_contacts
  before update on public.crm_contacts
  for each row execute procedure moddatetime(updated_at);

-- Deals ---------------------------------------------------------------------
create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  stage text not null default 'Prospecting',
  value numeric(12, 2),
  probability integer check (probability between 0 and 100),
  close_date date,
  lead_id uuid references public.crm_leads(id) on delete set null,
  organization_id uuid references public.crm_organizations(id) on delete set null,
  owner text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_deals_stage_idx on public.crm_deals (stage);
create index if not exists crm_deals_close_idx on public.crm_deals (close_date);
create index if not exists crm_deals_lead_idx on public.crm_deals (lead_id);
create index if not exists crm_deals_org_idx on public.crm_deals (organization_id);

create trigger set_timestamp_crm_deals
  before update on public.crm_deals
  for each row execute procedure moddatetime(updated_at);

-- Notes ---------------------------------------------------------------------
create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  note text,
  owner text,
  related_type text not null default 'lead' check (related_type in ('lead', 'deal', 'contact', 'organization')),
  related_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_notes_related_idx on public.crm_notes (related_type, related_id);
create index if not exists crm_notes_owner_idx on public.crm_notes (owner);

create trigger set_timestamp_crm_notes
  before update on public.crm_notes
  for each row execute procedure moddatetime(updated_at);

-- Row level security is disabled so all roles (including anon) can read/write.
alter table if exists public.crm_leads disable row level security;
alter table if exists public.crm_deals disable row level security;
alter table if exists public.crm_contacts disable row level security;
alter table if exists public.crm_organizations disable row level security;
alter table if exists public.crm_notes disable row level security;
