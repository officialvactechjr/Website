-- 0003_profiles_protection.sql
-- Tightens the profiles column guard that 0001 installed. 0001 is already
-- applied, so this replaces the function instead of editing that file (the
-- trigger keeps pointing at it).
--
-- Who may write what on a profiles row:
--   role               super_admin only
--   is_active          admin, super_admin
--   full_name, class,
--   section            admin, super_admin  (a member submits a change request)
--   github_url,
--   avatar_url,
--   must_change_password   the member themselves
-- The service role and the SQL editor have no auth.uid() and are never blocked.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.user_role := public.current_role();
begin
  -- service role, the SQL editor and migrations have no auth.uid()
  if auth.uid() is null then
    return new;
  end if;

  if actor = 'super_admin' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only a super admin can change a role';
  end if;

  if new.is_active is distinct from old.is_active and actor <> 'admin' then
    raise exception 'Only an admin can change account status';
  end if;

  -- Remaining actors are member and manager. github_url and avatar_url stay
  -- self-service on purpose; name, class and section do not.
  if
    actor <> 'admin'
    and (
      new.full_name is distinct from old.full_name
      or new."class" is distinct from old."class"
      or new.section is distinct from old.section
    )
  then
    raise exception 'Only an admin can change a name, class or section';
  end if;

  return new;
end;
$$;
