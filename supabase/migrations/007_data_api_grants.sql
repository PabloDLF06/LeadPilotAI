-- LeadPilot AI - Data API grants for manually-created public tables
-- RLS remains the authorization boundary. These grants only allow the roles
-- to reach the tables through Supabase Data API/PostgREST.

grant usage on schema public to authenticated, service_role;

grant select, insert, update on public.profiles to authenticated;
grant select, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.forms to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select on public.lead_ai_analyses to authenticated;
grant select, insert on public.lead_messages to authenticated;
grant select, insert on public.lead_activities to authenticated;
grant select on public.automation_logs to authenticated;
grant select, update on public.n8n_integration_status to authenticated;
grant select, update on public.internal_notifications to authenticated;

grant all privileges on table
  public.profiles,
  public.organizations,
  public.organization_members,
  public.forms,
  public.leads,
  public.lead_ai_analyses,
  public.lead_messages,
  public.lead_activities,
  public.automation_logs,
  public.api_events,
  public.n8n_integration_status,
  public.internal_notifications
to service_role;

grant all privileges on all sequences in schema public to service_role;
