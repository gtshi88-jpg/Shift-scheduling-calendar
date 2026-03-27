create table if not exists public.staff_members (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  active_from date,
  active_to date,
  created_at timestamptz not null default now()
);

alter table public.staff_members
  add column if not exists active_from date;

alter table public.staff_members
  add column if not exists active_to date;

create table if not exists public.shift_assignments (
  work_date date not null,
  staff_id text not null references public.staff_members(id) on delete cascade,
  shift_code text not null,
  updated_at timestamptz not null default now(),
  primary key (work_date, staff_id)
);

create index if not exists shift_assignments_staff_id_idx
  on public.shift_assignments(staff_id);
