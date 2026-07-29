create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_unit text not null default 'metric' check (preferred_unit in ('metric', 'imperial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  retired_at date,
  created_at timestamptz not null default now()
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shoe_id uuid references public.shoes(id) on delete set null,
  run_date date not null,
  distance_meters integer not null check (distance_meters > 0),
  duration_seconds integer not null check (duration_seconds > 0),
  avg_heart_rate integer check (avg_heart_rate is null or avg_heart_rate between 30 and 240),
  max_heart_rate integer check (max_heart_rate is null or max_heart_rate between 30 and 240),
  effort integer check (effort is null or effort between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint runs_heart_rate_order check (
    avg_heart_rate is null
    or max_heart_rate is null
    or avg_heart_rate <= max_heart_rate
  )
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (char_length(trim(type)) > 0),
  target_value numeric,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  insight_type text not null check (char_length(trim(insight_type)) > 0),
  input_summary jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null check (char_length(trim(agent_name)) > 0),
  tool_names text[] not null default '{}',
  status text not null check (status in ('success', 'error', 'skipped')),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now()
);

create index runs_user_run_date_idx on public.runs(user_id, run_date desc);
create index runs_user_shoe_idx on public.runs(user_id, shoe_id);
create index goals_user_status_idx on public.goals(user_id, status);
create index ai_insights_user_created_idx on public.ai_insights(user_id, created_at desc);
create index ai_usage_user_created_idx on public.ai_usage(user_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger runs_set_updated_at
before update on public.runs
for each row execute function public.set_updated_at();

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.shoes enable row level security;
alter table public.runs enable row level security;
alter table public.goals enable row level security;
alter table public.ai_insights enable row level security;
alter table public.ai_usage enable row level security;

create policy "Users can select their profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can insert their profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can delete their profile"
on public.profiles for delete
using (id = auth.uid());

create policy "Users can select their shoes"
on public.shoes for select
using (user_id = auth.uid());

create policy "Users can insert their shoes"
on public.shoes for insert
with check (user_id = auth.uid());

create policy "Users can update their shoes"
on public.shoes for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their shoes"
on public.shoes for delete
using (user_id = auth.uid());

create policy "Users can select their runs"
on public.runs for select
using (user_id = auth.uid());

create policy "Users can insert their runs"
on public.runs for insert
with check (
  user_id = auth.uid()
  and (
    shoe_id is null
    or exists (
      select 1 from public.shoes
      where shoes.id = runs.shoe_id
      and shoes.user_id = auth.uid()
    )
  )
);

create policy "Users can update their runs"
on public.runs for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    shoe_id is null
    or exists (
      select 1 from public.shoes
      where shoes.id = runs.shoe_id
      and shoes.user_id = auth.uid()
    )
  )
);

create policy "Users can delete their runs"
on public.runs for delete
using (user_id = auth.uid());

create policy "Users can select their goals"
on public.goals for select
using (user_id = auth.uid());

create policy "Users can insert their goals"
on public.goals for insert
with check (user_id = auth.uid());

create policy "Users can update their goals"
on public.goals for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their goals"
on public.goals for delete
using (user_id = auth.uid());

create policy "Users can select their AI insights"
on public.ai_insights for select
using (user_id = auth.uid());

create policy "Users can insert their AI insights"
on public.ai_insights for insert
with check (user_id = auth.uid());

create policy "Users can update their AI insights"
on public.ai_insights for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their AI insights"
on public.ai_insights for delete
using (user_id = auth.uid());

create policy "Users can select their AI usage"
on public.ai_usage for select
using (user_id = auth.uid());

create policy "Users can insert their AI usage"
on public.ai_usage for insert
with check (user_id = auth.uid());
