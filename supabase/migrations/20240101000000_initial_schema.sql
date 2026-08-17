-- 2.1 applications
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company text,
  title text,
  location text,
  salary_range text,
  seniority text,
  job_url text,
  raw_jd text,                      -- capped at 50,000 chars at write time, enforce in app code
  parse_status text,                -- enum: 'success' | 'partial' | 'failed' | 'manual'
  status text not null default 'draft', -- enum: 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  source_type text,                 -- enum: 'link' | 'paste' | 'manual'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- required field constraint: company and title must be non-empty to save (enforce in app layer AND here)
alter table applications add constraint company_required check (company is not null and length(trim(company)) > 0);
alter table applications add constraint title_required check (title is not null and length(trim(title)) > 0);

-- 2.2 status_history — write a row on EVERY status change, including initial creation at 'draft'
create table status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  status text not null,
  changed_at timestamptz default now()
);

-- 2.3 parse_rate_limits — one row per user, reset on rolling 24h window
create table parse_rate_limits (
  user_id uuid references auth.users primary key,
  attempt_count int not null default 0,
  window_started_at timestamptz not null default now()
);

-- 2.4 RLS — enable and enforce on all tables
alter table applications enable row level security;
alter table status_history enable row level security;
alter table parse_rate_limits enable row level security;

create policy "applications_owner_all" on applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "status_history_owner_all" on status_history
  for all using (
    auth.uid() = (select user_id from applications where id = application_id)
  );

-- parse_rate_limits: NO client-facing policy. Only the Edge Function (service role) reads/writes this table.
