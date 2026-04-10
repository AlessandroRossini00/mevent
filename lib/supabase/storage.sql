// AI

insert into storage.buckets (id, name, public)
values
  ('avatar-images', 'avatar-images', true),
  ('event-images', 'event-images', true)
on conflict (id) do nothing;

drop policy if exists "avatar_images_select_public" on storage.objects;
drop policy if exists "avatar_images_insert_own" on storage.objects;
drop policy if exists "avatar_images_update_own" on storage.objects;
drop policy if exists "avatar_images_delete_own" on storage.objects;

create policy "avatar_images_select_public"
on storage.objects
for select
to public
using (bucket_id = 'avatar-images');

create policy "avatar_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatar-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatar_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatar-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatar-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatar_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatar-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "event_images_select_public" on storage.objects;
drop policy if exists "event_images_insert_creator" on storage.objects;
drop policy if exists "event_images_update_creator" on storage.objects;
drop policy if exists "event_images_delete_creator" on storage.objects;

create policy "event_images_select_public"
on storage.objects
for select
to public
using (bucket_id = 'event-images');

create policy "event_images_insert_creator"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-images'
  and exists (
    select 1
    from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.creator_id = auth.uid()
  )
);

create policy "event_images_update_creator"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-images'
  and exists (
    select 1
    from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.creator_id = auth.uid()
  )
)
with check (
  bucket_id = 'event-images'
  and exists (
    select 1
    from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.creator_id = auth.uid()
  )
);

create policy "event_images_delete_creator"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-images'
  and exists (
    select 1
    from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.creator_id = auth.uid()
  )
);