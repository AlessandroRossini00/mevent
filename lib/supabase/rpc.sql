
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


/*
funzione SQL per cercare eventi con filtri e ordinamento per distanza, usata nella explore
*/
create or replace function public.search_explore_event_ids(
  p_user_id uuid,
  p_category text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_user_lat double precision default null,
  p_user_lon double precision default null,
  p_min_distance_km double precision default 0,
  p_max_distance_km double precision default 100,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  event_id uuid,
  distance_km double precision
)
language sql
stable
as $$
  with filtered_events as (
    select
      e.id as event_id,
      e.event_at,
      (
        6371 * acos(
          least(
            1.0,
            greatest(
              -1.0,
              cos(radians(p_user_lat)) *
              cos(radians(e.latitude)) *
              cos(radians(e.longitude) - radians(p_user_lon)) +
              sin(radians(p_user_lat)) *
              sin(radians(e.latitude))
            )
          )
        )
      ) as distance_km
    from public.events e
    where e.status = 'active'
      and e.visibility = 'public'
      and e.latitude is not null
      and e.longitude is not null
      and (p_category is null or p_category = 'all' or e.category = p_category)
      and (p_date_from is null or e.event_at >= p_date_from)
      and (p_date_to is null or e.event_at <= p_date_to)
      and (p_min_price is null or e.price >= p_min_price)
      and (p_max_price is null or e.price <= p_max_price)
      and (
        p_user_id is null
        or not exists (
          select 1
          from public.event_members em
          where em.event_id = e.id
            and em.user_id = p_user_id
        )
      )
  )
  select
    fe.event_id,
    fe.distance_km
  from filtered_events fe
  where fe.distance_km >= coalesce(p_min_distance_km, 0)
    and (
      coalesce(p_max_distance_km, 100) >= 100
      or fe.distance_km <= p_max_distance_km
    )
  order by fe.event_at asc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;
