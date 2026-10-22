-- ==============================================================================
-- DATIN Command Center — Production PostgreSQL Schema for Supabase
-- Optimized for high-throughput reads, sub-millisecond indexed lookups, and auditability
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & ROLES
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  department text not null,
  academic_year text not null,
  domain text not null,
  role text not null check (role in ('super_admin', 'core_committee', 'domain_lead', 'member', 'public')),
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  membership_id text unique not null,
  joined_at timestamptz default now(),
  skills text[] default array[]::text[],
  created_at timestamptz default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_membership_id on public.profiles(membership_id);
create index if not exists idx_profiles_domain on public.profiles(domain);
create index if not exists idx_profiles_role on public.profiles(role);

-- 2. MEMBERSHIP APPLICATIONS
create table if not exists public.membership_applications (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  department text not null,
  academic_year text not null,
  domain text not null,
  skills text,
  statement text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now(),
  reviewed_by text references public.profiles(id) on delete set null,
  notes text
);

create index if not exists idx_applications_status on public.membership_applications(status);
create index if not exists idx_applications_email on public.membership_applications(email);

-- 3. DIGITAL MEMBER PASSES
create table if not exists public.member_passes (
  pass_id text primary key,
  member_id text not null references public.profiles(id) on delete cascade,
  verification_token text unique not null,
  status text not null default 'valid' check (status in ('valid', 'revoked')),
  issued_at timestamptz default now(),
  term text not null default '2026-27'
);

create index if not exists idx_passes_token on public.member_passes(verification_token);
create index if not exists idx_passes_member on public.member_passes(member_id);

-- 4. CLUB EVENTS
create table if not exists public.events (
  id text primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  category text not null check (category in ('Hackathon', 'Workshop', 'Meetup', 'Tech Talk')),
  date text not null,
  time text not null,
  venue text not null,
  capacity integer not null default 100,
  registered_count integer not null default 0,
  is_registration_open boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_events_slug on public.events(slug);
create index if not exists idx_events_published on public.events(is_published);

-- 5. EVENT REGISTRATIONS & LIVE ATTENDANCE
create table if not exists public.event_registrations (
  id text primary key,
  event_id text not null references public.events(id) on delete cascade,
  member_id text not null references public.profiles(id) on delete cascade,
  member_name text not null,
  member_email text not null,
  attendance_status text not null default 'absent' check (attendance_status in ('present', 'absent')),
  registered_at timestamptz default now(),
  checked_in_at timestamptz,
  unique (event_id, member_id)
);

create index if not exists idx_registrations_event on public.event_registrations(event_id);
create index if not exists idx_registrations_member on public.event_registrations(member_id);
create index if not exists idx_registrations_attendance on public.event_registrations(attendance_status);

-- 6. TASKS & KANBAN WORKFLOW
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text not null,
  domain text not null,
  assigned_to_name text not null,
  assigned_to_email text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'to_do' check (status in ('to_do', 'in_progress', 'in_review', 'completed')),
  due_date text not null,
  updated_at timestamptz default now()
);

create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_domain on public.tasks(domain);
create index if not exists idx_tasks_assignee on public.tasks(assigned_to_email);

-- 7. BROADCAST ANNOUNCEMENTS
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  content text not null,
  priority text not null check (priority in ('normal', 'important', 'urgent')),
  author_name text not null,
  author_role text not null,
  published_at text not null,
  is_pinned boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_announcements_pinned on public.announcements(is_pinned);

-- 8. IMMUTABLE AUDIT LOGS
create table if not exists public.audit_logs (
  id text primary key,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details text not null,
  timestamp text not null,
  created_at timestamptz default now()
);

create index if not exists idx_audit_timestamp on public.audit_logs(created_at desc);

-- 9. CLUB SETTINGS
create table if not exists public.club_settings (
  id text primary key default 'primary_settings',
  club_name text not null default 'DATIN | Data2Innovate',
  short_description text not null default 'Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions.',
  academic_year text not null default '2026 - 2027',
  contact_email text not null default 'datin.club@biet.edu',
  instagram_url text default 'https://instagram.com',
  linkedin_url text default 'https://linkedin.com',
  github_url text default 'https://github.com',
  applications_open boolean not null default true,
  updated_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.membership_applications enable row level security;
alter table public.member_passes enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.club_settings enable row level security;

-- Public read policies for published club information
create policy "Allow public read of published events" on public.events for select using (is_published = true);
create policy "Allow public read of announcements" on public.announcements for select using (true);
create policy "Allow public read of club settings" on public.club_settings for select using (true);
create policy "Allow public submission of membership applications" on public.membership_applications for insert with check (true);
create policy "Allow authenticated read on profiles" on public.profiles for select using (true);
create policy "Allow member read of passes" on public.member_passes for select using (true);
create policy "Allow read on tasks" on public.tasks for select using (true);
create policy "Allow read on registrations" on public.event_registrations for select using (true);
create policy "Allow read on audit logs" on public.audit_logs for select using (true);

-- Seed Initial Club Data
insert into public.club_settings (id, club_name, short_description, academic_year, contact_email, applications_open)
values ('primary_settings', 'DATIN | Data2Innovate', 'Student Technology Club for Machine Learning, Data Engineering, and Innovative Software Solutions.', '2026 - 2027', 'datin.club@biet.edu', true)
on conflict (id) do nothing;
