-- HR schema for Supabase
-- Execute via Supabase SQL editor or automated migrations before using the HR APIs.

create extension if not exists "pgcrypto";
create extension if not exists "moddatetime";

-- Core workforce metrics ----------------------------------------------------
create table if not exists public.hr_dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  headcount integer default 0,
  open_roles integer default 0,
  pending_offers integer default 0,
  attrition_rate numeric(5,2) default 0,
  avg_time_to_fill numeric(6,2) default 0,
  engagement_score numeric(6,2) default 0,
  upcoming_actions jsonb default '[]'::jsonb,
  captured_at timestamptz not null default timezone('utc', now())
);

-- Recruitment ---------------------------------------------------------------
create table if not exists public.hr_recruitment_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  hiring_manager text,
  status text default 'Open',
  candidates integer default 0,
  avg_time_to_fill numeric(6,2),
  offer_acceptance numeric(6,2),
  openings integer default 1,
  location text,
  requisition_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_recruitment_jobs
  before update on public.hr_recruitment_jobs
  for each row execute procedure moddatetime(updated_at);

create table if not exists public.hr_recruitment_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.hr_recruitment_jobs(id) on delete cascade,
  candidate_name text not null,
  stage text default 'Applied',
  score numeric(5,2),
  submitted_on date,
  email text,
  phone text,
  resume_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists hr_recruitment_applications_job_idx on public.hr_recruitment_applications (job_id);

create trigger set_timestamp_hr_recruitment_applications
  before update on public.hr_recruitment_applications
  for each row execute procedure moddatetime(updated_at);

-- Employee lifecycle --------------------------------------------------------
create table if not exists public.hr_employee_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  employee_name text,
  event_type text,
  title text,
  owner text,
  status text,
  notes text,
  effective_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_lifecycle
  before update on public.hr_employee_lifecycle_events
  for each row execute procedure moddatetime(updated_at);

-- Performance ----------------------------------------------------------------
create table if not exists public.hr_performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  reviewer text,
  overall_rating numeric(4,2),
  submitted_on date,
  cycle text,
  strengths text,
  gaps text,
  action_items text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_reviews
  before update on public.hr_performance_reviews
  for each row execute procedure moddatetime(updated_at);

create table if not exists public.hr_performance_goals (
  id uuid primary key default gen_random_uuid(),
  employee_name text,
  title text,
  status text,
  progress numeric(5,2),
  due_on date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_goals
  before update on public.hr_performance_goals
  for each row execute procedure moddatetime(updated_at);

-- Shift & attendance --------------------------------------------------------
create table if not exists public.hr_shift_schedules (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  coverage numeric(5,2),
  location text,
  shift text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hr_attendance_logs (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  employee_name text,
  status text,
  variance_minutes integer,
  overtime_minutes integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Expenses ------------------------------------------------------------------
create table if not exists public.hr_expense_claims (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  category text,
  amount numeric(12,2) not null default 0,
  status text default 'Pending',
  submitted_on date,
  reimbursement_date date,
  notes text,
  receipt_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_expense
  before update on public.hr_expense_claims
  for each row execute procedure moddatetime(updated_at);

-- Leaves --------------------------------------------------------------------
create table if not exists public.hr_leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  type text,
  available_days numeric(6,2) default 0,
  upcoming_leave date,
  notes text,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hr_leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  type text,
  start_date date,
  end_date date,
  status text default 'Pending',
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_leave_requests
  before update on public.hr_leave_requests
  for each row execute procedure moddatetime(updated_at);

-- Projects & staffing -------------------------------------------------------
create table if not exists public.hr_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lead text,
  status text default 'Planned',
  due_on date,
  contributors jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_projects
  before update on public.hr_projects
  for each row execute procedure moddatetime(updated_at);

create table if not exists public.hr_project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.hr_projects(id) on delete cascade,
  employee_id text,
  employee_name text,
  hours_allocated numeric(6,2) default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hr_project_assignments_project_idx on public.hr_project_assignments (project_id);

-- Access management ---------------------------------------------------------
create table if not exists public.hr_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text,
  status text default 'Active',
  last_seen timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_users
  before update on public.hr_users
  for each row execute procedure moddatetime(updated_at);

create table if not exists public.hr_user_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text,
  invited_on timestamptz not null default timezone('utc', now()),
  invited_by text
);

create table if not exists public.hr_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text,
  target text,
  created_at timestamptz not null default timezone('utc', now()),
  metadata jsonb
);

-- Content -------------------------------------------------------------------
create table if not exists public.hr_website_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  status text,
  updated_at timestamptz not null default timezone('utc', now()),
  owner text,
  summary text
);

create table if not exists public.hr_website_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  published_on date,
  author text,
  summary text,
  status text default 'Ready'
);

-- Payroll -------------------------------------------------------------------
create table if not exists public.hr_payroll_runs (
  id uuid primary key default gen_random_uuid(),
  cycle text,
  period_start date,
  period_end date,
  disbursement_date date,
  status text,
  approvals_complete boolean default false,
  net_pay numeric(14,2) default 0,
  total_taxes numeric(14,2) default 0,
  total_benefits numeric(14,2) default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_hr_payroll_runs
  before update on public.hr_payroll_runs
  for each row execute procedure moddatetime(updated_at);

create table if not exists public.hr_payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_name text,
  adjustment_type text,
  amount numeric(12,2) default 0,
  effective_date date,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hr_payroll_benefits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text,
  category text,
  employer_contribution numeric(8,2) default 0,
  employee_contribution numeric(8,2) default 0,
  description text,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Disable RLS for quick prototyping (configure properly for production) -----
alter table if exists public.hr_dashboard_metrics disable row level security;
alter table if exists public.hr_recruitment_jobs disable row level security;
alter table if exists public.hr_recruitment_applications disable row level security;
alter table if exists public.hr_employee_lifecycle_events disable row level security;
alter table if exists public.hr_performance_reviews disable row level security;
alter table if exists public.hr_performance_goals disable row level security;
alter table if exists public.hr_shift_schedules disable row level security;
alter table if exists public.hr_attendance_logs disable row level security;
alter table if exists public.hr_expense_claims disable row level security;
alter table if exists public.hr_leave_balances disable row level security;
alter table if exists public.hr_leave_requests disable row level security;
alter table if exists public.hr_projects disable row level security;
alter table if exists public.hr_project_assignments disable row level security;
alter table if exists public.hr_users disable row level security;
alter table if exists public.hr_user_invites disable row level security;
alter table if exists public.hr_audit_log disable row level security;
alter table if exists public.hr_website_pages disable row level security;
alter table if exists public.hr_website_updates disable row level security;
alter table if exists public.hr_payroll_runs disable row level security;
alter table if exists public.hr_payroll_adjustments disable row level security;
alter table if exists public.hr_payroll_benefits disable row level security;
