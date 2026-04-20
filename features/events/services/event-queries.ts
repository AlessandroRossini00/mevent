import { createClient } from "@/lib/supabase/client";
import type {
  EventWithRelations,
  JoinedEvent,
} from "@/features/events/services/types";

export async function getJoinedEventsQuery(): Promise<JoinedEvent[]> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("event_members")
    .select(
      `
      role,
      joined_at,
      events:event_id (
        *,
        event_images (*),
        event_members (
          event_id,
          user_id,
          role,
          joined_at,
          profile:user_id (
            id,
            username,
            full_name,
            birth_date,
            avatar_url,
            bio,
            city
          )
        )
      )
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? [])
    .map((row) => row.events)
    .filter(Boolean) as unknown as EventWithRelations[];
}

export async function getEventByIdQuery(
  eventId: string,
): Promise<EventWithRelations | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (
        event_id,
        user_id,
        role,
        joined_at,
        profile:user_id (
          id,
          username,
          full_name,
          birth_date,
          avatar_url,
          bio,
          city
        )
      )
    `,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;

  return data as unknown as EventWithRelations | null;
}
