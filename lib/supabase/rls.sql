// AI

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.event_join_requests enable row level security;
alter table public.event_messages enable row level security;
alter table public.event_images enable row level security;
alter table public.notifications enable row level security;
alter table public.user_push_tokens enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_public"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


drop policy if exists "events_select_authenticated" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_creator" on public.events;
drop policy if exists "events_delete_creator" on public.events;

create policy "events_select_authenticated"
on public.events
for select
to authenticated
using (true);

create policy "events_insert_own"
on public.events
for insert
to authenticated
with check (auth.uid() = creator_id);

create policy "events_update_creator"
on public.events
for update
to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "events_delete_creator"
on public.events
for delete
to authenticated
using (auth.uid() = creator_id);


drop policy if exists "event_members_select_authenticated" on public.event_members;
drop policy if exists "event_members_insert_self" on public.event_members;
drop policy if exists "event_members_delete_self_or_creator" on public.event_members;

create policy "event_members_select_authenticated"
on public.event_members
for select
to authenticated
using (true);

create policy "event_members_insert_self"
on public.event_members
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "event_members_delete_self_or_creator"
on public.event_members
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.events e
    where e.id = event_members.event_id
      and e.creator_id = auth.uid()
  )
);


drop policy if exists "event_join_requests_select_own_or_creator" on public.event_join_requests;
drop policy if exists "event_join_requests_insert_self" on public.event_join_requests;
drop policy if exists "event_join_requests_update_creator" on public.event_join_requests;
drop policy if exists "event_join_requests_delete_self_or_creator" on public.event_join_requests;

create policy "event_join_requests_select_own_or_creator"
on public.event_join_requests
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.events e
    where e.id = event_join_requests.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "event_join_requests_insert_self"
on public.event_join_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "event_join_requests_update_creator"
on public.event_join_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = event_join_requests.event_id
      and e.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events e
    where e.id = event_join_requests.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "event_join_requests_delete_self_or_creator"
on public.event_join_requests
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.events e
    where e.id = event_join_requests.event_id
      and e.creator_id = auth.uid()
  )
);

drop policy if exists "event_messages_select_event_members" on public.event_messages;
drop policy if exists "event_messages_insert_event_members" on public.event_messages;
drop policy if exists "event_messages_update_sender" on public.event_messages;
drop policy if exists "event_messages_delete_sender" on public.event_messages;

create policy "event_messages_select_event_members"
on public.event_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.event_members em
    where em.event_id = event_messages.event_id
      and em.user_id = auth.uid()
  )
);

create policy "event_messages_insert_event_members"
on public.event_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.event_members em
    where em.event_id = event_messages.event_id
      and em.user_id = auth.uid()
  )
);

create policy "event_messages_update_sender"
on public.event_messages
for update
to authenticated
using (auth.uid() = sender_id)
with check (auth.uid() = sender_id);

create policy "event_messages_delete_sender"
on public.event_messages
for delete
to authenticated
using (auth.uid() = sender_id);

/*
rls per event_message_reads, che tiene traccia di quando un utente ha letto l'ultima volta
la chat di un evento, in modo da poter calcolare gli unread
*/
alter table public.event_message_reads enable row level security;

create policy "Users can read their own chat reads"
on public.event_message_reads
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own chat reads"
on public.event_message_reads
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own chat reads"
on public.event_message_reads
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);



drop policy if exists "event_images_select_authenticated" on public.event_images;
drop policy if exists "event_images_insert_creator" on public.event_images;
drop policy if exists "event_images_update_creator" on public.event_images;
drop policy if exists "event_images_delete_creator" on public.event_images;

create policy "event_images_select_authenticated"
on public.event_images
for select
to authenticated
using (true);

create policy "event_images_insert_creator"
on public.event_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.events e
    where e.id = event_images.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "event_images_update_creator"
on public.event_images
for update
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = event_images.event_id
      and e.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events e
    where e.id = event_images.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "event_images_delete_creator"
on public.event_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = event_images.event_id
      and e.creator_id = auth.uid()
  )
);


drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "user_push_tokens_select_own" on public.user_push_tokens;
drop policy if exists "user_push_tokens_insert_own" on public.user_push_tokens;
drop policy if exists "user_push_tokens_update_own" on public.user_push_tokens;
drop policy if exists "user_push_tokens_delete_own" on public.user_push_tokens;

create policy "user_push_tokens_select_own"
on public.user_push_tokens
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_push_tokens_insert_own"
on public.user_push_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_push_tokens_update_own"
on public.user_push_tokens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_push_tokens_delete_own"
on public.user_push_tokens
for delete
to authenticated
using (auth.uid() = user_id);
