-- ==============================================================================
-- DATIN COMMAND CENTER — ARCHITECTURAL REPAIR SCHEMA (v2.0)
-- Strict Two-Role Model: COORDINATOR & PARTICIPANT
-- Configurable Team Engine: Solo, Duo, Squad of 4, Flexible
-- ==============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- CLEAN RESET: DROP LEGACY / CONFLICTING TABLES
-- ==============================================================================
drop table if exists public.attendance_logs cascade;
drop table if exists public.team_members cascade;
drop table if exists public.teams cascade;
drop table if exists public.events cascade;
drop table if exists public.coordinator_invites cascade;
drop table if exists public.announcements cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.organization_settings cascade;

-- Drop legacy prototype tables if present
drop table if exists public.tasks cascade;
drop table if exists public.member_passes cascade;
drop table if exists public.membership_applications cascade;
drop table if exists public.profiles cascade;

-- ==============================================================================
-- 1. PROFILES & ROLES (STRICT 2 ROLES ONLY: coordinator | participant)
-- ==============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_usn on public.profiles(usn);
create index idx_profiles_pass_token on public.profiles(pass_token);

-- ==============================================================================
-- 2. COORDINATOR INVITATIONS
-- ==============================================================================
create table public.coordinator_invites (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_coord_invites_email on public.coordinator_invites(email);

-- ==============================================================================
-- 3. EVENTS (FLEXIBLE TEAM SIZES)
-- ==============================================================================
create table public.events (
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

create index idx_events_published on public.events(is_published);
create index idx_events_slug on public.events(slug);

-- ==============================================================================
-- 4. TEAMS
-- ==============================================================================
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  invite_code text unique not null,
  leader_id uuid references public.profiles(id) on delete cascade not null,
  is_finalized boolean not null default false,
  created_at timestamptz default now(),
  unique (event_id, name)
);

create index idx_teams_event on public.teams(event_id);
create index idx_teams_invite_code on public.teams(invite_code);

-- ==============================================================================
-- 5. TEAM MEMBERS & EVENT REGISTRATIONS
-- ==============================================================================
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (event_id, user_id) -- Participant cannot join multiple teams for the same event
);

create index idx_team_members_user on public.team_members(user_id);
create index idx_team_members_team on public.team_members(team_id);
create index idx_team_members_event on public.team_members(event_id);

-- ==============================================================================
-- 6. ATTENDANCE & CHECK-IN LOGS
-- ==============================================================================
create table public.attendance_logs (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scanned_by uuid references public.profiles(id) on delete set null,
  notes text,
  scanned_at timestamptz default now(),
  unique (event_id, user_id) -- Prevents duplicate check-ins
);

create index idx_attendance_event on public.attendance_logs(event_id);
create index idx_attendance_user on public.attendance_logs(user_id);

-- ==============================================================================
-- 7. ANNOUNCEMENTS
-- ==============================================================================
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  priority text not null check (priority in ('normal', 'important', 'urgent')) default 'normal',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'DATIN Coordinator',
  is_pinned boolean not null default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 8. AUDIT LOGS
-- ==============================================================================
create table public.audit_logs (
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

create index idx_audit_created on public.audit_logs(created_at desc);

-- ==============================================================================
-- 9. ORGANIZATION SETTINGS
-- ==============================================================================
create table public.organization_settings (
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
-- 10. AUTH TRIGGER (AUTO-PROVISION PROFILES ON SIGNUP)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text := 'participant';
  v_onboarded boolean := false;
begin
  -- Auto-promote configured coordinator emails or invited coordinators
  if lower(new.email) in ('datin.club@gmail.com', 'theshadowquant@gmail.com') then
    v_role := 'coordinator';
    v_onboarded := true;
  elsif exists (select 1 from public.coordinator_invites where lower(email) = lower(new.email)) then
    v_role := 'coordinator';
    v_onboarded := true;
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    college,
    department,
    academic_year,
    phone,
    onboarding_completed
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    v_role,
    'Bapuji Institute of Engineering and Technology (BIET)',
    '',
    1,
    '',
    v_onboarded
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

-- Profiles Policies
drop policy if exists "Allow reading profiles" on public.profiles;
create policy "Allow reading profiles" on public.profiles
  for select using (true);

drop policy if exists "Allow insert profiles" on public.profiles;
create policy "Allow insert profiles" on public.profiles
  for insert with check (auth.uid() = id or public.is_coordinator());

drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles
  for update using (id = auth.uid() or public.is_coordinator());

-- Events Policies
drop policy if exists "Allow public reading published events" on public.events;
create policy "Allow public reading published events" on public.events
  for select using (is_published = true or public.is_coordinator());

drop policy if exists "Allow coordinator insert events" on public.events;
create policy "Allow coordinator insert events" on public.events
  for insert with check (public.is_coordinator());

drop policy if exists "Allow coordinator update events" on public.events;
create policy "Allow coordinator update events" on public.events
  for update using (public.is_coordinator());

drop policy if exists "Allow coordinator delete events" on public.events;
create policy "Allow coordinator delete events" on public.events
  for delete using (public.is_coordinator());

-- Teams Policies
drop policy if exists "Allow read teams" on public.teams;
create policy "Allow read teams" on public.teams
  for select using (true);

drop policy if exists "Allow insert teams" on public.teams;
create policy "Allow insert teams" on public.teams
  for insert with check (auth.uid() = leader_id or public.is_coordinator());

drop policy if exists "Allow update teams" on public.teams;
create policy "Allow update teams" on public.teams
  for update using (auth.uid() = leader_id or public.is_coordinator());

drop policy if exists "Allow delete teams" on public.teams;
create policy "Allow delete teams" on public.teams
  for delete using (auth.uid() = leader_id or public.is_coordinator());

-- Team Members Policies
drop policy if exists "Allow read team members" on public.team_members;
create policy "Allow read team members" on public.team_members
  for select using (true);

drop policy if exists "Allow join team members" on public.team_members;
create policy "Allow join team members" on public.team_members
  for insert with check (auth.uid() = user_id or public.is_coordinator());

drop policy if exists "Allow leave team members" on public.team_members;
create policy "Allow leave team members" on public.team_members
  for delete using (auth.uid() = user_id or public.is_coordinator());

-- Attendance Logs Policies
drop policy if exists "Allow coordinator attendance" on public.attendance_logs;
create policy "Allow coordinator attendance" on public.attendance_logs
  for all using (public.is_coordinator());

drop policy if exists "Allow participant read own attendance" on public.attendance_logs;
create policy "Allow participant read own attendance" on public.attendance_logs
  for select using (user_id = auth.uid());

-- Announcements Policies
drop policy if exists "Allow reading announcements" on public.announcements;
create policy "Allow reading announcements" on public.announcements
  for select using (true);

drop policy if exists "Allow coordinator manage announcements" on public.announcements;
create policy "Allow coordinator manage announcements" on public.announcements
  for all using (public.is_coordinator());

-- Audit Logs Policies
drop policy if exists "Allow coordinator view audit" on public.audit_logs;
create policy "Allow coordinator view audit" on public.audit_logs
  for select using (public.is_coordinator());

drop policy if exists "Allow insert audit" on public.audit_logs;
create policy "Allow insert audit" on public.audit_logs
  for insert with check (true);

-- Coordinator Invites Policies
drop policy if exists "Allow coordinator view invites" on public.coordinator_invites;
create policy "Allow coordinator view invites" on public.coordinator_invites
  for all using (public.is_coordinator());

-- Organization Settings Policies
drop policy if exists "Allow read organization settings" on public.organization_settings;
create policy "Allow read organization settings" on public.organization_settings
  for select using (true);

drop policy if exists "Allow coordinator update organization settings" on public.organization_settings;
create policy "Allow coordinator update organization settings" on public.organization_settings
  for update using (public.is_coordinator());
