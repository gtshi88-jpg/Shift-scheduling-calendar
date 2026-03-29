-- 職種マスタ（表示名・並びは可変。code は一意のスラッグ）
create table if not exists public.staff_job_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists staff_job_types_sort_idx
  on public.staff_job_types (sort_order, label);

insert into public.staff_job_types (id, code, label, sort_order) values
  ('00000001-0000-4000-8000-000000000001', 'counselor', 'カウンセラー', 0),
  ('00000002-0000-4000-8000-000000000002', 'doctor', 'ドクター', 1),
  ('00000003-0000-4000-8000-000000000003', 'nurse', 'ナース', 2)
on conflict (code) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

create table if not exists public.staff_members (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  active_from date,
  active_to date,
  created_at timestamptz not null default now()
);

alter table public.staff_members
  add column if not exists job_type_id uuid references public.staff_job_types(id) on delete restrict;

alter table public.staff_members
  add column if not exists active_from date;

alter table public.staff_members
  add column if not exists active_to date;

-- レガシー job_type テキスト列があれば id に移してから削除
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'staff_members'
      and column_name = 'job_type'
  ) then
    update public.staff_members m
    set job_type_id = t.id
    from public.staff_job_types t
    where m.job_type_id is null
      and t.code = m.job_type::text;
    alter table public.staff_members drop column job_type;
  end if;
end $$;

update public.staff_members
set job_type_id = '00000001-0000-4000-8000-000000000001'
where job_type_id is null;

alter table public.staff_members
  alter column job_type_id set not null;

create table if not exists public.shift_assignments (
  work_date date not null,
  staff_id text not null references public.staff_members(id) on delete cascade,
  shift_code text not null,
  updated_at timestamptz not null default now(),
  primary key (work_date, staff_id)
);

create index if not exists shift_assignments_staff_id_idx
  on public.shift_assignments (staff_id);

-- 月単位の確定（管理者が確定すると一般スタッフはその月を編集不可）
create table if not exists public.confirmed_months (
  year_month text primary key check (year_month ~ '^\d{4}-\d{2}$'),
  confirmed_at timestamptz not null default now(),
  confirmed_by text not null
);

-- 保存・確定操作の履歴
create table if not exists public.shift_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_username text not null,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists shift_audit_log_created_at_idx
  on public.shift_audit_log (created_at desc);

-- 管理者ロール判定ルール（メール完全一致・ドメイン一致。ダッシュボードの Table Editor または SQL で行を追加）
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

-- ルールテーブルはクライアントから直接は読ませず、RPC / トリガーのみ参照（ポリシーなし＝認証ユーザーは SELECT 不可）

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

-- Supabase Auth 連携: アプリ内ロール（RLS はログインユーザーが自分の行のみ SELECT）
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

-- 新規ユーザー: admin_email_* ルールに一致すれば admin、それ以外は member
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

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- ログイン中ユーザーの実効ロール（DB の profile が admin、またはメールルールが admin）
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
