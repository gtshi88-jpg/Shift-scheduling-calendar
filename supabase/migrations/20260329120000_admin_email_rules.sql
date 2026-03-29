-- 既存 DB 向け: 管理者メール／ドメインルール + effective_auth_role（新規は schema.sql に含まれる）
create table if not exists public.admin_email_exact (
  email text primary key
);

create table if not exists public.admin_email_domain (
  domain text primary key
);

comment on table public.admin_email_exact is '小文字で保存推奨。一致するメールは管理者';
comment on table public.admin_email_domain is '@ 以右のみ（例: clinic.example.jp）。そのドメインのメールは管理者';

alter table public.admin_email_exact enable row level security;
alter table public.admin_email_domain enable row level security;

create or replace function public.role_from_email(p_email text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_email is null or btrim(p_email) = '' then 'member'
    when exists (
      select 1 from public.admin_email_exact e
      where lower(e.email) = lower(btrim(p_email))
    ) then 'admin'
    when exists (
      select 1 from public.admin_email_domain d
      where lower(btrim(d.domain)) = lower(split_part(lower(btrim(p_email)), '@', 2))
        and position('@' in lower(btrim(p_email))) > 0
    ) then 'admin'
    else 'member'
  end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
begin
  r := public.role_from_email(coalesce(new.email, ''));
  insert into public.user_profiles (id, role)
  values (new.id, r)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.effective_auth_role()
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  uid uuid := auth.uid();
  em text;
  prof_role text;
  rule_role text;
begin
  if uid is null then
    return 'member';
  end if;
  select u.email into em from auth.users u where u.id = uid;
  select p.role into prof_role from public.user_profiles p where p.id = uid;
  rule_role := public.role_from_email(coalesce(em, ''));
  if prof_role = 'admin' or rule_role = 'admin' then
    return 'admin';
  end if;
  return coalesce(prof_role, 'member');
end;
$$;

grant execute on function public.effective_auth_role() to authenticated;
