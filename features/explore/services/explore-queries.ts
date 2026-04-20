import { createClient } from "@/lib/supabase/client";
import type { ExploreEvent } from "@/features/explore/services/types";

export async function getExploreEventsQuery(): Promise<ExploreEvent[]> {
  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id ?? null;

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (event_id, user_id, role, joined_at)
    `,
    )
    .eq("status", "active")
    .eq("visibility", "public")
    .order("event_at", { ascending: true });

  if (error) throw error;

  const events = (data ?? []) as ExploreEvent[];

  return events.filter((event) => {
    if (!currentUserId) return true;
    const isMember =
      event.event_members?.some((member) => member.user_id === currentUserId) ??
      false;
    return !isMember;
  });
}
