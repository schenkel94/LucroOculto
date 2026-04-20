create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Minha empresa',
  plan text not null default 'free',
  hourly_cost numeric(12, 2) not null default 65,
  target_margin numeric(6, 4) not null default 0.3500,
  rework_factor numeric(8, 2) not null default 1.50,
  urgency_factor numeric(8, 2) not null default 0.75,
  late_daily_penalty numeric(8, 4) not null default 0.0010,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations
  add column if not exists billing_status text not null default 'trial',
  add column if not exists billing_email text,
  add column if not exists billing_notes text,
  add column if not exists paid_until date,
  add column if not exists beta_started_at timestamptz default now();

update public.organizations
set billing_status = 'trial'
where billing_status is null;

do $$
begin
  alter table public.organizations
    add constraint organizations_plan_check check (plan in ('free', 'beta', 'pro'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.organizations
    add constraint organizations_billing_status_check
    check (billing_status in ('trial', 'requested', 'active', 'past_due', 'canceled'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  segment text,
  monthly_revenue numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  billing_type text not null default 'recurring',
  expected_monthly_revenue numeric(12, 2) not null default 0,
  expected_hours numeric(10, 2) not null default 0,
  start_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  entry_date date not null,
  revenue numeric(12, 2) not null default 0,
  hours numeric(10, 2) not null default 0,
  hourly_cost numeric(12, 2) not null default 0,
  ticket_count integer not null default 0,
  urgent_count integer not null default 0,
  rework_count integer not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  payment_delay_days integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  filename text not null,
  status text not null default 'processed',
  rows_total integer not null default 0,
  rows_valid integer not null default 0,
  rows_invalid integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  period text not null,
  chaos_score numeric(8, 2) not null default 0,
  estimated_profit numeric(12, 2) not null default 0,
  margin_percent numeric(8, 2) not null default 0,
  suggested_price numeric(12, 2) not null default 0,
  action text not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null default 'beta_requested',
  plan text not null default 'beta',
  amount numeric(12, 2) not null default 0,
  status text not null default 'open',
  contact_email text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists clients_organization_id_idx on public.clients(organization_id);
create index if not exists contracts_organization_id_idx on public.contracts(organization_id);
create index if not exists contracts_client_id_idx on public.contracts(client_id);
create index if not exists work_entries_organization_id_idx on public.work_entries(organization_id);
create index if not exists work_entries_client_id_idx on public.work_entries(client_id);
create index if not exists work_entries_entry_date_idx on public.work_entries(entry_date);
create index if not exists billing_events_organization_id_idx on public.billing_events(organization_id);
create index if not exists billing_events_created_at_idx on public.billing_events(created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.clients enable row level security;
alter table public.contracts enable row level security;
alter table public.work_entries enable row level security;
alter table public.imports enable row level security;
alter table public.recommendations enable row level security;
alter table public.billing_events enable row level security;

drop policy if exists "owners can select organizations" on public.organizations;
drop policy if exists "owners can insert organizations" on public.organizations;
drop policy if exists "owners can update organizations" on public.organizations;
drop policy if exists "owners can delete organizations" on public.organizations;
drop policy if exists "owners can select clients" on public.clients;
drop policy if exists "owners can insert clients" on public.clients;
drop policy if exists "owners can update clients" on public.clients;
drop policy if exists "owners can delete clients" on public.clients;
drop policy if exists "owners can manage contracts" on public.contracts;
drop policy if exists "owners can manage work entries" on public.work_entries;
drop policy if exists "owners can manage imports" on public.imports;
drop policy if exists "owners can manage recommendations" on public.recommendations;
drop policy if exists "owners can select billing events" on public.billing_events;
drop policy if exists "owners can request beta billing" on public.billing_events;

create policy "owners can select organizations"
on public.organizations for select
using (owner_user_id = auth.uid());

create policy "owners can insert organizations"
on public.organizations for insert
with check (
  owner_user_id = auth.uid()
  and plan = 'free'
  and billing_status = 'trial'
);

create policy "owners can update organizations"
on public.organizations for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "owners can delete organizations"
on public.organizations for delete
using (owner_user_id = auth.uid());

create policy "owners can select clients"
on public.clients for select
using (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can insert clients"
on public.clients for insert
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can update clients"
on public.clients for update
using (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can delete clients"
on public.clients for delete
using (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can manage contracts"
on public.contracts for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = contracts.organization_id
    and organizations.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = contracts.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can manage work entries"
on public.work_entries for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = work_entries.organization_id
    and organizations.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = work_entries.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can manage imports"
on public.imports for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = imports.organization_id
    and organizations.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = imports.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can manage recommendations"
on public.recommendations for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = recommendations.organization_id
    and organizations.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = recommendations.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can select billing events"
on public.billing_events for select
using (
  exists (
    select 1 from public.organizations
    where organizations.id = billing_events.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

create policy "owners can request beta billing"
on public.billing_events for insert
with check (
  event_type = 'beta_requested'
  and plan = 'beta'
  and status = 'open'
  and exists (
    select 1 from public.organizations
    where organizations.id = billing_events.organization_id
    and organizations.owner_user_id = auth.uid()
  )
);

revoke update on public.organizations from anon, authenticated;
grant update (
  name,
  hourly_cost,
  target_margin,
  rework_factor,
  urgency_factor,
  late_daily_penalty
) on public.organizations to authenticated;
