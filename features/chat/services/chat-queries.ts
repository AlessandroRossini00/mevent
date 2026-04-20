import { createClient } from "@/lib/supabase/client";
import type { EventMessage } from "@/features/chat/services/types";

export async function getEventMessages(
  eventId: string,
): Promise<EventMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("event_messages")
    .select(
      `
      id,
      event_id,
      sender_id,
      body,
      message_type,
      created_at,
      updated_at,
      deleted_at,
      sender:sender_id (
        id,
        full_name,
        avatar_url,
        username
      )
    `,
    )
    .eq("event_id", eventId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as unknown as EventMessage[];
}
