import { createClient } from "@/lib/supabase/client";
import type {
  CreatedEvent,
  EventWithRelations,
  JoinedEvent,
} from "@/features/events/services/types";

const eventSelect = `
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
`;

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
        ${eventSelect}
      )
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;

  // Per gli eventi joined partiamo da event_members perché il legame
  // utente-evento vive lì; poi estraiamo il record evento annidato.
  return (data ?? [])
    .map((row) => row.events)
    .filter(Boolean) as unknown as JoinedEvent[];
}

export async function getCreatedEventsQuery(): Promise<CreatedEvent[]> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Qui leggiamo direttamente dalla tabella events perché il filtro
  // dipende dalla ownership dell'evento, non dalla membership.
  return (data ?? []) as unknown as CreatedEvent[];
}

export async function getEventByIdQuery(
  eventId: string,
): Promise<EventWithRelations | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;

  // maybeSingle restituisce null se l'evento non esiste,
  // evitando di trattare l'assenza come errore applicativo.
  return data as unknown as EventWithRelations | null;
}
