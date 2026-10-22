-- ==============================================================================
-- DATIN COMMAND CENTER — ARCHITECTURAL REPAIR SCHEMA (v2.0)
-- Strict Two-Role Model: COORDINATOR & PARTICIPANT
-- Configurable Team Engine: Solo, Duo, Squad of 4, Flexible
-- ==============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. PROFILES & ROLES
create table if not exists public.profiles (
  id uuid primary key,
  email text unique not null,
  full_name text not null default '',
  usn text unique,
  college text not null default 'Bapuji Institute of Engineering and Technology (BIET)',
  department text not null default '',
  academic_year int not null default 1,
  phone text not null default '',
  role text not null check (role in ('coordinator', 'participant')) default 'participant',
  pass_token text unique default encode(gen_random_bytes(16), 'hex'),
  onboarding_completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_usn on public.profiles(usn);
create index if not exists idx_profiles_pass_token on public.profiles(pass_token);

-- 2. COORDINATOR INVITATIONS
create table if not exists public.coordinator_invites (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_coord_invites_email on public.coordinator_invites(email);

-- 3. EVENTS (FLEXIBLE TEAM SIZES)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text not null default '',
  category text not null default 'Workshop',
  team_format text not null check (team_format in ('solo', 'duo', 'squad_4', 'flexible')) default 'solo',
  min_team_size int not null default 1,
  max_team_size int not null default 1,
  venue text not null default 'BIET Campus',
  date text not null,
  time text not null default '10:00 AM IST',
  capacity int not null default 100,
  registered_count int not null default 0,
  is_registration_open boolean not null default true,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_events_published on public.events(is_published);
create index if not exists idx_events_slug on public.events(slug);

-- 4. TEAMS
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  invite_code text unique not null,
  leader_id uuid references public.profiles(id) on delete cascade not null,
  is_finalized boolean not null default false,
  created_at timestamptz default now(),
  unique (event_id, name)
);

create index if not exists idx_teams_event on public.teams(event_id);
create index if not exists idx_teams_invite_code on public.teams(invite_code);

-- 5. TEAM MEMBERS & EVENT REGISTRATIONS
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (event_id, user_id) -- Unique constraint: Participant cannot join multiple teams for the same event
);

create index if not exists idx_team_members_user on public.team_members(user_id);
create index if not exists idx_team_members_team on public.team_members(team_id);
create index if not exists idx_team_members_event on public.team_members(event_id);

-- 6. ATTENDANCE & CHECK-IN LOGS
create table if not exists public.attendance_logs (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scanned_by uuid references public.profiles(id) on delete set null,
  notes text,
  scanned_at timestamptz default now(),
  unique (event_id, user_id) -- Prevents duplicate check-ins
);

create index if not exists idx_attendance_event on public.attendance_logs(event_id);
create index if not exists idx_attendance_user on public.attendance_logs(user_id);

-- 7. ANNOUNCEMENTS
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  priority text not null check (priority in ('normal', 'important', 'urgent')) default 'normal',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'DATIN Coordinator',
  is_pinned boolean not null default false,
  created_at timestamptz default now()
);

-- 8. AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details text not null,
  created_at timestamptz default now()
);

create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- 9. ORGANIZATION SETTINGS
create table if not exists public.organization_settings (
  id text primary key default 'primary',
  org_name text not null default 'DATIN | Data2Innovate',
  tagline text not null default 'Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions',
  college text not null default 'Bapuji Institute of Engineering and Technology (BIET)',
  academic_year text not null default '2026-27',
  public_registration_enabled boolean not null default true,
  updated_at timestamptz default now()
);

insert into public.organization_settings (id, org_name, tagline, college, academic_year, public_registration_enabled)
values ('primary', 'DATIN | Data2Innovate', 'Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions', 'Bapuji Institute of Engineering and Technology (BIET)', '2026-27', true)
on conflict (id) do nothing;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.coordinator_invites enable row level security;
alter table public.events enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.organization_settings enable row level security;

-- Helper function to check if requesting user is coordinator
create or replace function public.is_coordinator()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'coordinator'
  );
end;
$$ language plpgsql;

-- Profiles:
-- Anyone authenticated can read basic profile info (required for team mates lookup & coordinator badge)
drop policy if exists "Allow reading profiles" on public.profiles;
create policy "Allow reading profiles" on public.profiles
  for select using (auth.role() = 'authenticated' or true);

-- User can update only their own profile, cannot change role unless coordinator
drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles
  for update using (id = auth.uid());

-- Events:
-- Public read for published events
drop policy if exists "Allow public reading published events" on public.events;
create policy "Allow public reading published events" on public.events
  for select using (is_published = true or public.is_coordinator());

-- Only coordinators can mutate events
drop policy if exists "Allow coordinator insert events" on public.events;
create policy "Allow coordinator insert events" on public.events
  for insert with check (public.is_coordinator());

drop policy if exists "Allow coordinator update events" on public.events;
create policy "Allow coordinator update events" on public.events
  for update using (public.is_coordinator());

drop policy if exists "Allow coordinator delete events" on public.events;
create policy "Allow coordinator delete events" on public.events
  for delete using (public.is_coordinator());

-- Teams & Team Members:
drop policy if exists "Allow read teams" on public.teams;
create policy "Allow read teams" on public.teams
  for select using (true);

drop policy if exists "Allow insert teams" on public.teams;
create policy "Allow insert teams" on public.teams
  for insert with check (auth.uid() = leader_id or public.is_coordinator());

drop policy if exists "Allow read team members" on public.team_members;
create policy "Allow read team members" on public.team_members
  for select using (true);

drop policy if exists "Allow join team members" on public.team_members;
create policy "Allow join team members" on public.team_members
  for insert with check (auth.uid() = user_id or public.is_coordinator());

-- Attendance Logs:
drop policy if exists "Allow coordinator attendance" on public.attendance_logs;
create policy "Allow coordinator attendance" on public.attendance_logs
  for all using (public.is_coordinator());

drop policy if exists "Allow participant read own attendance" on public.attendance_logs;
create policy "Allow participant read own attendance" on public.attendance_logs
  for select using (user_id = auth.uid());

-- Announcements:
drop policy if exists "Allow reading announcements" on public.announcements;
create policy "Allow reading announcements" on public.announcements
  for select using (true);

drop policy if exists "Allow coordinator manage announcements" on public.announcements;
create policy "Allow coordinator manage announcements" on public.announcements
  for all using (public.is_coordinator());

-- Audit Logs:
drop policy if exists "Allow coordinator view audit" on public.audit_logs;
create policy "Allow coordinator view audit" on public.audit_logs
  for all using (public.is_coordinator());

-- Coordinator Invites:
drop policy if exists "Allow coordinator view invites" on public.coordinator_invites;
create policy "Allow coordinator view invites" on public.coordinator_invites
  for all using (public.is_coordinator());
