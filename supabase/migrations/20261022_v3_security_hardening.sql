-- ==============================================================================
-- DATIN COMMAND CENTER — CRITICAL AUTHORIZATION POLICY ENFORCEMENT (v3.0)
-- 1. Exclusively Administrator-Controlled Coordinator Provisioning
-- 2. Single-Use Expiring Coordinator Invitations (7 days)
-- 3. Strict 2 Roles Only (coordinator | participant) with Role Elevation Protection
-- 4. Active / Suspended Coordinator Lifecycle Controls
-- ==============================================================================

-- 1. Add account_status and membership_status to profiles
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'account_status') then
    alter table public.profiles add column account_status text not null default 'active' check (account_status in ('active', 'suspended'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'membership_status') then
    alter table public.profiles add column membership_status text not null default 'approved' check (membership_status in ('approved', 'pending', 'rejected'));
  end if;
end $$;

-- 2. Add status, expires_at, and accepted_at to coordinator_invites
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'coordinator_invites' and column_name = 'status') then
    alter table public.coordinator_invites add column status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'coordinator_invites' and column_name = 'expires_at') then
    alter table public.coordinator_invites add column expires_at timestamptz not null default (now() + interval '7 days');
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'coordinator_invites' and column_name = 'accepted_at') then
    alter table public.coordinator_invites add column accepted_at timestamptz;
  end if;
end $$;

-- 3. Update is_coordinator() to strictly check active status
create or replace function public.is_coordinator()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'coordinator'
      and account_status = 'active'
  );
end;
$$ language plpgsql;

-- 4. Role Elevation Protection Trigger: Prevent non-coordinators from changing role
create or replace function public.protect_profile_role()
returns trigger as $$
begin
  if new.role <> old.role then
    -- If user is logged in via auth.uid(), verify they are an active coordinator
    if auth.uid() is not null and not public.is_coordinator() then
      raise exception 'Security Violation: Non-coordinators cannot elevate or modify user roles.';
    end if;
  end if;

  -- Prevent non-coordinators from altering account_status or membership_status
  if new.account_status <> old.account_status or new.membership_status <> old.membership_status then
    if auth.uid() is not null and not public.is_coordinator() then
      raise exception 'Security Violation: Only active coordinators can modify account governance status.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- 5. Auto-Provisioning Trigger on auth.users: Default PARTICIPANT, require valid unexpired invite for coordinator
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text := 'participant';
  v_onboarded boolean := false;
  v_invite_id uuid;
begin
  -- Check for unexpired, pending coordinator invitation
  select id into v_invite_id
  from public.coordinator_invites
  where lower(email) = lower(new.email)
    and status = 'pending'
    and expires_at > now()
  order by created_at desc
  limit 1;

  if v_invite_id is not null then
    v_role := 'coordinator';
    v_onboarded := true;

    -- Mark single-use invitation as accepted
    update public.coordinator_invites
    set status = 'accepted', accepted_at = now()
    where id = v_invite_id;

    -- Log acceptance in audit_logs
    insert into public.audit_logs (
      actor_id,
      actor_name,
      actor_role,
      action,
      entity_type,
      entity_id,
      details
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      'coordinator',
      'COORDINATOR_INVITE_ACCEPTED',
      'coordinator_invite',
      v_invite_id::text,
      'Coordinator invitation successfully claimed during authentication.'
    );
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    account_status,
    membership_status,
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
    'active',
    'approved',
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

-- Re-attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Update Row-Level Security Policies for Profiles
drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles
  for update using (id = auth.uid() or public.is_coordinator());

-- 7. Coordinator Invites Policies: only active coordinators can view/mutate
drop policy if exists "Allow coordinator view invites" on public.coordinator_invites;
create policy "Allow coordinator view invites" on public.coordinator_invites
  for all using (public.is_coordinator());
