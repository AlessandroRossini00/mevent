import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/features/profile/services/types";

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
