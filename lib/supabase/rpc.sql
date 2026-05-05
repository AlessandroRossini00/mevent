
/*
funzione SQL che conta gli unread in una sola query
*/
create or replace function public.get_event_unread_counts(event_ids uuid[])
returns table (
  event_id uuid,
  unread_count bigint
)
language sql
security invoker
as $$
  with reads as (
    select r.event_id, r.last_read_at
    from public.event_message_reads r
    where r.user_id = auth.uid()
      and r.event_id = any(event_ids)
  )
  select
    e.id as event_id,
    coalesce(count(m.id), 0) as unread_count
  from public.events e
  left join reads r
    on r.event_id = e.id
  left join public.event_messages m
    on m.event_id = e.id
   and m.sender_id <> auth.uid()
   and m.created_at > coalesce(r.last_read_at, '1970-01-01'::timestamptz)
  where e.id = any(event_ids)
  group by e.id
$$;


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