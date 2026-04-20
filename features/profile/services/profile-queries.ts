import { createClient } from "@/lib/supabase/client";
import type { CreatedEvent, Profile } from "@/features/profile/services/types";

export async function getMyProfileQuery(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
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
    .select(
      `
      *,
      event_images (*),
      event_members (event_id, user_id, role, joined_at)
    `,
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as CreatedEvent[];
}
