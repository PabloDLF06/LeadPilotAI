-- LeadPilot AI - trusted auth/profile functions

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Organization creation and membership assignment belong to a trusted server
-- action. These functions are intentionally not executable by client roles.
create or replace function public.create_organization_for_user(
  organization_name text,
  organization_slug text
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  created_organization public.organizations;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  insert into public.organizations (name, slug)
  values (trim(organization_name), lower(trim(organization_slug)))
  returning * into created_organization;

  insert into public.organization_members (organization_id, user_id, role)
  values (created_organization.id, auth.uid(), 'owner');

  return created_organization;
end;
$$;

revoke all on function public.create_organization_for_user(text, text) from public, anon, authenticated;
