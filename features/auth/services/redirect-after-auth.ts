import { createClient } from "@/lib/supabase/server";

export async function getPostAuthRedirect(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return profile ? "/explore" : "/new-user";
}
