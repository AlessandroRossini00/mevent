// AI

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username varchar unique,
  full_name varchar not null,
  birth_date date,
  avatar_url varchar,
  bio text,
  city varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title varchar not null,
  description text,
  category varchar,
  event_at timestamptz not null,
  location_name varchar,
  address varchar,
  latitude decimal(10,7),
  longitude decimal(10,7),
  price decimal(10,2) not null default 0,
  website_url varchar,
  maps_url varchar,
  max_members int,
  visibility varchar not null default 'public' check (visibility in ('public', 'private')),
  approval_mode varchar not null default 'open' check (approval_mode in ('open', 'approval_required')),
  status varchar not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_members (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role varchar not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.event_join_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status varchar not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  message_type varchar not null default 'text' check (message_type in ('text', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url varchar not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type varchar not null check (type in ('join_request', 'join_approved', 'join_rejected', 'new_message', 'event_updated')),
  title varchar not null,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token varchar not null,
  platform varchar not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now()
);

create index if not exists idx_events_creator_id on public.events(creator_id);
create index if not exists idx_events_event_at on public.events(event_at);
create index if not exists idx_event_members_user_id on public.event_members(user_id);
create index if not exists idx_event_join_requests_user_id on public.event_join_requests(user_id);
create index if not exists idx_event_messages_event_id on public.event_messages(event_id);
create index if not exists idx_event_messages_event_created_at on public.event_messages(event_id, created_at);
create index if not exists idx_event_images_event_id on public.event_images(event_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_user_push_tokens_user_id on public.user_push_tokens(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row
execute procedure public.set_updated_at();

