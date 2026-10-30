-- ---------------------------------------------------------------------------
-- audit-rls.sql — READ ONLY. Run the whole file in the Supabase SQL Editor and
-- read the six result grids. Nothing here writes, grants or changes anything.
--
-- HOW TO READ THE RESULT
--   1. `rowsecurity = false` on any table is a hole: every row is public.
--   2. A policy whose command is ALL or whose roles include anon/public is only
--      safe if its USING clause pins the rows (for example `auth.uid() = owner_id`).
--   3. An anon grant on a base table (not a view) is almost always wrong: the
--      public pages are meant to read the `public_*` views.
--   4. A SECURITY DEFINER function with `search_path` empty or null can be tricked
--      into calling an attacker's function of the same name. Fix with
--      `alter function ... set search_path = public, pg_temp;` (or `security invoker`
--      when it does not need the extra rights).
--   5. Any view exposing email, phone, role, is_active, id or password is a leak if
--      it is granted to anon. `public_members`, `public_projects`, `leaderboard` and
--      `public_site_stats` must not appear with those columns.
-- ---------------------------------------------------------------------------

-- 1. Every table in public, and whether RLS is on.
select c.relname as table_name, c.relrowsecurity as rls_on, c.relforcerowsecurity as forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;

-- 2. Every policy: table, name, command, roles, and the row filter.
select tablename, policyname, cmd, roles, qual::text as using_clause, with_check::text as check_clause
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 3. Tables and views granted to anon (the public surface, in full).
select table_schema, table_name, privilege_type
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public'
order by table_name, privilege_type;

-- 4. SECURITY DEFINER functions and whether their search_path is pinned.
select p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       case when p.prosecdef then 'DEFINER' else 'invoker' end as security,
       coalesce(array_to_string(p.proconfig, ', '), '(none)') as settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by p.proname;

-- 5. Views that expose a sensitive column name, and who can read them.
select table_name, column_name, grantee
from information_schema.columns c
join information_schema.role_table_grants g
  on g.table_schema = c.table_schema and g.table_name = c.table_name
where c.table_schema = 'public'
  and c.column_name in ('email', 'phone', 'role', 'is_active', 'id', 'password', 'author_id', 'member_id')
  and g.privilege_type = 'SELECT'
  and g.grantee in ('anon', 'authenticated')
order by table_name, column_name;

-- 6. Storage buckets: public or not, size limits, and every storage policy.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
order by id;

select policyname, cmd, roles, qual::text as using_clause
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
