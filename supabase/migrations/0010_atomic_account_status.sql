-- 0010_atomic_account_status.sql
-- Makes "you cannot deactivate the last active super admin" a single database
-- step instead of a check in the Edge Function followed by a write.
--
-- Why: a plain check-then-write can race. Two super admins deactivating each
-- other at the same moment each read "2 active", both pass, and both write —
-- leaving 0 active super admins and the club locked out of its own panel. The
-- rows are locked FOR UPDATE (in a fixed order) before the count, so the second
-- request waits, then re-reads the committed result and is refused.
--
-- Called only by the `set-account-status` function, with the service-role key.
-- Once applied, never edit this file: add a new numbered migration.

create or replace function public.set_account_active(p_user_id uuid, p_is_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role   public.user_role;
  v_active integer;
begin
  select role into v_role from public.profiles where id = p_user_id;
  if v_role is null then
    raise exception 'account_not_found';
  end if;

  if not p_is_active and v_role = 'super_admin' then
    -- Lock every active super admin in the same order from both transactions, so
    -- there is no deadlock and no double-deactivation.
    perform 1
      from public.profiles
      where role = 'super_admin' and is_active
      order by id
      for update;

    select count(*) into v_active
      from public.profiles
      where role = 'super_admin' and is_active;

    if v_active <= 1 then
      raise exception 'last_super_admin';
    end if;
  end if;

  update public.profiles set is_active = p_is_active where id = p_user_id;
end;
$$;

-- Only the account functions (service role) may call this. Postgres grants
-- EXECUTE to PUBLIC by default, so that grant is taken back from every client role.
revoke all on function public.set_account_active(uuid, boolean) from public;
revoke all on function public.set_account_active(uuid, boolean) from anon;
revoke all on function public.set_account_active(uuid, boolean) from authenticated;
grant execute on function public.set_account_active(uuid, boolean) to service_role;
