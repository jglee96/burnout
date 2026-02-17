-- Burnout Guard: Auth + Billing + AI access baseline schema
-- Target: Supabase Postgres

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Seoul',
  locale text not null default 'ko-KR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_identities (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google', 'sns_ci')),
  provider_subject text,
  ci_hash text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_identities_google_subject_ck check (
    (provider = 'google' and provider_subject is not null and ci_hash is null)
    or (provider = 'sns_ci' and ci_hash is not null)
  ),
  constraint user_identities_user_provider_uniq unique (user_id, provider)
);

create unique index if not exists user_identities_google_subject_uniq
  on public.user_identities (provider_subject)
  where provider = 'google';

create unique index if not exists user_identities_sns_ci_hash_uniq
  on public.user_identities (ci_hash)
  where provider = 'sns_ci';

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active'
    check (status in ('active', 'past_due', 'canceled', 'incomplete')),
  billing_provider text not null default 'none'
    check (billing_provider in ('none', 'stripe', 'toss')),
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id bigserial primary key,
  billing_provider text not null check (billing_provider in ('stripe', 'toss')),
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  process_status text not null default 'received'
    check (process_status in ('received', 'processed', 'ignored', 'failed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint payment_events_provider_event_uniq unique (billing_provider, provider_event_id)
);

create table if not exists public.ai_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  encrypted_api_key text not null,
  key_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_mode text not null default 'none'
    check (access_mode in ('none', 'byok', 'pro')),
  source text not null default 'none'
    check (source in ('none', 'self_key', 'subscription')),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_plan_status_idx
  on public.subscriptions (plan, status);

create index if not exists payment_events_status_idx
  on public.payment_events (process_status, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_identities_set_updated_at
before update on public.user_identities
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger ai_credentials_set_updated_at
before update on public.ai_credentials
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));

  insert into public.subscriptions (user_id, plan, status, billing_provider)
  values (new.id, 'free', 'active', 'none');

  insert into public.ai_entitlements (user_id, access_mode, source)
  values (new.id, 'none', 'none');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.user_identities enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_events enable row level security;
alter table public.ai_credentials enable row level security;
alter table public.ai_entitlements enable row level security;

-- profiles: user can read/write own profile
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_identities: user can manage own identity links
drop policy if exists user_identities_select_own on public.user_identities;
create policy user_identities_select_own
  on public.user_identities for select
  using (auth.uid() = user_id);

drop policy if exists user_identities_insert_own on public.user_identities;
create policy user_identities_insert_own
  on public.user_identities for insert
  with check (auth.uid() = user_id);

drop policy if exists user_identities_update_own on public.user_identities;
create policy user_identities_update_own
  on public.user_identities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_identities_delete_own on public.user_identities;
create policy user_identities_delete_own
  on public.user_identities for delete
  using (auth.uid() = user_id);

-- subscriptions: user can read own subscription only; writes by service role/webhook
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ai_credentials: user can manage own BYOK credential row
drop policy if exists ai_credentials_select_own on public.ai_credentials;
create policy ai_credentials_select_own
  on public.ai_credentials for select
  using (auth.uid() = user_id);

drop policy if exists ai_credentials_insert_own on public.ai_credentials;
create policy ai_credentials_insert_own
  on public.ai_credentials for insert
  with check (auth.uid() = user_id);

drop policy if exists ai_credentials_update_own on public.ai_credentials;
create policy ai_credentials_update_own
  on public.ai_credentials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists ai_credentials_delete_own on public.ai_credentials;
create policy ai_credentials_delete_own
  on public.ai_credentials for delete
  using (auth.uid() = user_id);

-- ai_entitlements: user can read own entitlement only; writes by backend logic
drop policy if exists ai_entitlements_select_own on public.ai_entitlements;
create policy ai_entitlements_select_own
  on public.ai_entitlements for select
  using (auth.uid() = user_id);

-- payment_events: service-only table
drop policy if exists payment_events_service_all on public.payment_events;
create policy payment_events_service_all
  on public.payment_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

commit;

