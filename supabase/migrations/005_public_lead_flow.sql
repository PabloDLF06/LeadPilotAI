-- LeadPilot AI - public form flow support
-- Public submissions are handled by a trusted server route using service_role.
-- There are intentionally no anon policies on forms, leads or api_events.

alter table public.forms enable row level security;
alter table public.leads enable row level security;
alter table public.lead_ai_analyses enable row level security;
alter table public.lead_activities enable row level security;
alter table public.automation_logs enable row level security;
alter table public.api_events enable row level security;

create index if not exists api_events_rate_limit_idx
  on public.api_events (event_type, ip_hash, created_at desc);

create index if not exists leads_public_flow_idx
  on public.leads (form_id, created_at desc);

-- The existing policies deliberately permit no direct anonymous INSERT into leads
-- and no direct anonymous SELECT from forms. The Route Handler validates the
-- public_id, applies anti-spam checks, and writes through service_role only.
