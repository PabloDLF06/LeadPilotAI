-- LeadPilot AI - schema base
-- This migration contains only database objects and integrity constraints.

create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'admin', 'member');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost', 'archived');
create type public.lead_priority as enum ('cold', 'warm', 'hot', 'urgent');
create type public.analysis_status as enum ('pending', 'processing', 'completed', 'failed');
create type public.activity_type as enum (
  'lead_created',
  'lead_updated',
  'lead_analyzed',
  'lead_reanalyzed',
  'note_added',
  'status_changed',
  'email_generated',
  'email_sent',
  'email_simulated',
  'notification_sent',
  'automation_failed',
  'automation_retried',
  'webhook_sent',
  'webhook_failed'
);
create type public.automation_event_status as enum ('pending', 'success', 'failed', 'skipped');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 200),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  industry text,
  website text,
  description text,
  logo_url text,
  contact_email text,
  timezone text not null default 'Europe/Madrid',
  locale text not null default 'es',
  ai_tone text not null default 'professional' check (ai_tone in ('professional', 'friendly', 'premium', 'direct')),
  ai_custom_instructions text,
  score_alert_threshold integer not null default 70 check (score_alert_threshold between 0 and 100),
  auto_analyze_enabled boolean not null default true,
  auto_generate_reply_enabled boolean not null default true,
  auto_send_reply_enabled boolean not null default false,
  notification_email text,
  telegram_chat_id text,
  n8n_webhook_url text,
  n8n_webhook_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id)
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  public_id uuid unique not null default gen_random_uuid(),
  name text not null default 'Formulario web principal',
  title text not null default 'Cuéntanos cómo podemos ayudarte',
  subtitle text,
  success_title text not null default '¡Gracias por contactarnos!',
  success_message text not null default 'Hemos recibido tu solicitud y te responderemos lo antes posible.',
  primary_color text not null default '#6366F1' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  fields_config jsonb not null default jsonb_build_object(
    'full_name', jsonb_build_object('enabled', true, 'required', true),
    'email', jsonb_build_object('enabled', true, 'required', true),
    'phone', jsonb_build_object('enabled', true, 'required', false),
    'company', jsonb_build_object('enabled', true, 'required', false),
    'service', jsonb_build_object('enabled', true, 'required', false),
    'budget', jsonb_build_object('enabled', true, 'required', false),
    'urgency', jsonb_build_object('enabled', true, 'required', false),
    'message', jsonb_build_object('enabled', true, 'required', true)
  ),
  privacy_text text,
  redirect_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  form_id uuid references public.forms(id) on delete set null,
  public_reference text unique not null check (public_reference ~ '^LP-[0-9]{8}-[A-Z0-9]{4}$'),
  full_name text not null check (char_length(trim(full_name)) between 2 and 200),
  email text not null check (char_length(email) <= 254),
  phone text,
  company text,
  website text,
  service_interest text,
  budget_range text,
  urgency_input text,
  message text,
  source text not null default 'form' check (source in ('form', 'manual', 'import', 'api', 'demo')),
  status public.lead_status not null default 'new',
  priority public.lead_priority,
  score integer check (score between 0 and 100),
  assigned_to uuid references auth.users(id) on delete set null,
  tags text[] not null default '{}',
  internal_notes text,
  analysis_status public.analysis_status not null default 'pending',
  analyzed_at timestamptz,
  last_contacted_at timestamptz,
  responded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.lead_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid unique not null references public.leads(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  model text not null,
  prompt_version text not null default 'v1',
  summary text,
  intent text,
  service_interest text,
  estimated_budget text,
  urgency_level text,
  sentiment text,
  pain_points jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  recommended_next_action text,
  score_reasoning text,
  confidence integer check (confidence between 0 and 100),
  structured_data jsonb not null default '{}'::jsonb,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  direction text not null check (direction in ('outbound', 'inbound')),
  channel text not null check (channel in ('email', 'whatsapp', 'manual', 'system')),
  subject text,
  body text not null,
  status text not null check (status in ('draft', 'sent', 'failed', 'simulated')),
  provider_message_id text,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  type public.activity_type not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  automation_name text not null,
  event_name text not null,
  status public.automation_event_status not null,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  attempt_count integer not null default 1 check (attempt_count > 0),
  executed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.api_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  form_id uuid references public.forms(id) on delete set null,
  ip_hash text,
  user_agent text,
  payload_summary jsonb,
  status_code integer,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();
create trigger forms_set_updated_at
before update on public.forms
for each row execute function public.set_updated_at();
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();
create trigger lead_ai_analyses_set_updated_at
before update on public.lead_ai_analyses
for each row execute function public.set_updated_at();

create index leads_organization_created_at_idx on public.leads (organization_id, created_at desc);
create index leads_organization_status_idx on public.leads (organization_id, status);
create index leads_organization_priority_idx on public.leads (organization_id, priority);
create index leads_organization_score_idx on public.leads (organization_id, score desc);
create index leads_organization_email_idx on public.leads (organization_id, email);
create index lead_activities_lead_created_at_idx on public.lead_activities (lead_id, created_at desc);
create index automation_logs_lead_executed_at_idx on public.automation_logs (lead_id, executed_at desc);
create index forms_public_id_idx on public.forms (public_id);
create index organization_members_user_org_idx on public.organization_members (user_id, organization_id);
create index lead_ai_analyses_organization_idx on public.lead_ai_analyses (organization_id, created_at desc);
create index lead_messages_lead_created_at_idx on public.lead_messages (lead_id, created_at desc);

-- Every denormalized organization_id must agree with its parent row. This prevents
-- a client from attaching a child record from organization A to a lead in B.
create or replace function public.validate_lead_organization()
returns trigger
language plpgsql
as $$
declare
  parent_organization_id uuid;
begin
  select l.organization_id into parent_organization_id
  from public.leads l where l.id = new.lead_id;

  if parent_organization_id is null or parent_organization_id <> new.organization_id then
    raise exception 'lead and organization do not match';
  end if;

  return new;
end;
$$;

create trigger lead_ai_analyses_validate_organization
before insert or update on public.lead_ai_analyses
for each row execute function public.validate_lead_organization();
create trigger lead_messages_validate_organization
before insert or update on public.lead_messages
for each row execute function public.validate_lead_organization();
create trigger lead_activities_validate_organization
before insert or update on public.lead_activities
for each row execute function public.validate_lead_organization();
create trigger automation_logs_validate_organization
before insert or update on public.automation_logs
for each row when (new.lead_id is not null)
execute function public.validate_lead_organization();

create or replace function public.validate_lead_form_organization()
returns trigger
language plpgsql
as $$
declare
  form_organization_id uuid;
begin
  if new.form_id is not null then
    select f.organization_id into form_organization_id
    from public.forms f where f.id = new.form_id;
    if form_organization_id is null or form_organization_id <> new.organization_id then
      raise exception 'lead and form organizations do not match';
    end if;
  end if;
  if new.assigned_to is not null and not exists (
    select 1
    from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.assigned_to
  ) then
    raise exception 'assigned user is not a member of the lead organization';
  end if;
  return new;
end;
$$;

create trigger leads_validate_form_organization
before insert or update on public.leads
for each row execute function public.validate_lead_form_organization();

create or replace function public.prevent_organization_change()
returns trigger
language plpgsql
as $$
begin
  if old.organization_id is distinct from new.organization_id then
    raise exception 'organization_id is immutable';
  end if;
  return new;
end;
$$;

create trigger organization_members_organization_immutable
before update on public.organization_members
for each row execute function public.prevent_organization_change();
create trigger forms_organization_immutable
before update on public.forms
for each row execute function public.prevent_organization_change();
create trigger leads_organization_immutable
before update on public.leads
for each row execute function public.prevent_organization_change();
create trigger lead_ai_analyses_organization_immutable
before update on public.lead_ai_analyses
for each row execute function public.prevent_organization_change();
create trigger lead_messages_organization_immutable
before update on public.lead_messages
for each row execute function public.prevent_organization_change();
create trigger lead_activities_organization_immutable
before update on public.lead_activities
for each row execute function public.prevent_organization_change();
create trigger automation_logs_organization_immutable
before update on public.automation_logs
for each row execute function public.prevent_organization_change();

create or replace function public.prevent_membership_identity_change()
returns trigger
language plpgsql
as $$
begin
  if old.user_id is distinct from new.user_id then
    raise exception 'membership user_id is immutable';
  end if;
  return new;
end;
$$;

create trigger organization_members_user_immutable
before update on public.organization_members
for each row execute function public.prevent_membership_identity_change();
