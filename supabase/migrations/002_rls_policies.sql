-- LeadPilot AI - authorization helpers and RLS policies

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_organization_id is not null and exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(
  target_organization_id uuid,
  allowed_roles public.member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_organization_id is not null and exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
      and om.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.has_org_role(uuid, public.member_role[]) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.member_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.forms enable row level security;
alter table public.leads enable row level security;
alter table public.lead_ai_analyses enable row level security;
alter table public.lead_messages enable row level security;
alter table public.lead_activities enable row level security;
alter table public.automation_logs enable row level security;
alter table public.api_events enable row level security;

-- Profiles are private to the owning auth user.
create policy profiles_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Organizations cannot be created by arbitrary client inserts. Creation is done
-- by a trusted server action/trigger, while members can only see their own org.
create policy organizations_select_member on public.organizations
for select to authenticated using (public.is_org_member(id));
create policy organizations_update_admin on public.organizations
for update to authenticated
using (public.has_org_role(id, array['owner', 'admin']::public.member_role[]))
with check (public.has_org_role(id, array['owner', 'admin']::public.member_role[]));
create policy organizations_delete_owner on public.organizations
for delete to authenticated
using (public.has_org_role(id, array['owner']::public.member_role[]));

-- Membership reads are scoped to the caller's organization. Inserts/updates
-- cannot be used by an admin to mint an owner role.
create policy organization_members_select_same_org on public.organization_members
for select to authenticated using (public.is_org_member(organization_id));
create policy organization_members_insert_admin on public.organization_members
for insert to authenticated
with check (
  public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  and (role <> 'owner' or public.has_org_role(organization_id, array['owner']::public.member_role[]))
);
create policy organization_members_update_admin on public.organization_members
for update to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]))
with check (
  public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  and (role <> 'owner' or public.has_org_role(organization_id, array['owner']::public.member_role[]))
);
create policy organization_members_delete_admin on public.organization_members
for delete to authenticated
using (
  public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  and (role <> 'owner' or public.has_org_role(organization_id, array['owner']::public.member_role[]))
);

create policy forms_select_member on public.forms
for select to authenticated using (public.is_org_member(organization_id));
create policy forms_insert_admin on public.forms
for insert to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]));
create policy forms_update_admin on public.forms
for update to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]));
create policy forms_delete_admin on public.forms
for delete to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]));

create policy leads_select_member on public.leads
for select to authenticated using (public.is_org_member(organization_id));
create policy leads_insert_member on public.leads
for insert to authenticated with check (public.is_org_member(organization_id));
create policy leads_update_member on public.leads
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
create policy leads_delete_admin on public.leads
for delete to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[]));

create policy lead_ai_analyses_select_member on public.lead_ai_analyses
for select to authenticated using (public.is_org_member(organization_id));
-- No INSERT/UPDATE/DELETE policy: only service_role/trusted backend can write.

create policy lead_messages_select_member on public.lead_messages
for select to authenticated using (public.is_org_member(organization_id));
create policy lead_messages_insert_draft on public.lead_messages
for insert to authenticated
with check (public.is_org_member(organization_id) and status = 'draft');
-- Sent/failed/simulated status changes stay server-only.

create policy lead_activities_select_member on public.lead_activities
for select to authenticated using (public.is_org_member(organization_id));
create policy lead_activities_insert_member on public.lead_activities
for insert to authenticated with check (public.is_org_member(organization_id));

create policy automation_logs_select_member on public.automation_logs
for select to authenticated using (public.is_org_member(organization_id));
-- Automation logs are written by trusted backend only.

-- api_events contains public-endpoint audit data and is service-role only.
-- RLS is enabled with no client policies by design.
