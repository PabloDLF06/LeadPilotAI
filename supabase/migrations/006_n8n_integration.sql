-- LeadPilot AI - optional internal n8n integration
-- Secrets and webhook URLs remain server-side environment variables.

do $$
begin
  create type public.n8n_integration_state as enum ('not_configured', 'healthy', 'failed', 'unknown');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.n8n_integration_status (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  n8n_enabled boolean not null default false,
  n8n_last_status public.n8n_integration_state not null default 'not_configured',
  n8n_last_checked_at timestamptz,
  n8n_last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.internal_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  notification_type text not null,
  severity text not null default 'info' check (severity in ('info', 'success', 'warning', 'error')),
  title text not null,
  body text not null,
  link_url text,
  dedupe_key text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.automation_logs add column if not exists idempotency_key text;

create unique index if not exists automation_logs_organization_idempotency_idx
  on public.automation_logs (organization_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists automation_logs_organization_status_created_idx
  on public.automation_logs (organization_id, status, created_at desc);

create index if not exists automation_logs_organization_lead_created_idx
  on public.automation_logs (organization_id, lead_id, created_at desc);

create unique index if not exists internal_notifications_dedupe_idx
  on public.internal_notifications (organization_id, recipient_user_id, dedupe_key)
  where dedupe_key is not null;

create index if not exists internal_notifications_recipient_created_idx
  on public.internal_notifications (recipient_user_id, created_at desc);

create index if not exists n8n_integration_status_updated_idx
  on public.n8n_integration_status (updated_at desc);

drop trigger if exists n8n_integration_status_set_updated_at on public.n8n_integration_status;
create trigger n8n_integration_status_set_updated_at
before update on public.n8n_integration_status
for each row execute function public.set_updated_at();

alter table public.n8n_integration_status enable row level security;
alter table public.internal_notifications enable row level security;

drop policy if exists n8n_integration_status_select_member on public.n8n_integration_status;
create policy n8n_integration_status_select_member on public.n8n_integration_status
for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists internal_notifications_select_member on public.internal_notifications;
create policy internal_notifications_select_member on public.internal_notifications
for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists internal_notifications_update_recipient on public.internal_notifications;
create policy internal_notifications_update_recipient on public.internal_notifications
for update to authenticated
using (recipient_user_id = (select auth.uid()) and public.is_org_member(organization_id))
with check (recipient_user_id = (select auth.uid()) and public.is_org_member(organization_id));

-- Statuses, notifications and automation logs are written by trusted server code.
