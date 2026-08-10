-- Trip's Trips shared spaces
-- Run this once in the Supabase SQL Editor.

create table if not exists public.trip_spaces (
  id text primary key,
  trips jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.trip_spaces enable row level security;

-- Anyone with the space code can read/write that row.
-- Treat the space code like a shared password.
drop policy if exists "Anyone can read trip spaces" on public.trip_spaces;
create policy "Anyone can read trip spaces"
  on public.trip_spaces
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can insert trip spaces" on public.trip_spaces;
create policy "Anyone can insert trip spaces"
  on public.trip_spaces
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can update trip spaces" on public.trip_spaces;
create policy "Anyone can update trip spaces"
  on public.trip_spaces
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Needed for live updates across phones
do $$
begin
  alter publication supabase_realtime add table public.trip_spaces;
exception
  when duplicate_object then null;
end $$;
