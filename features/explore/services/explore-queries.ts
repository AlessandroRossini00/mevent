import { createClient } from "@/lib/supabase/client";
import type { ExploreEvent } from "@/features/explore/services/types";

type GetExploreEventsParams = {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: string;
  maxPrice?: string;
  page: number;
  pageSize: number;
};

export async function getExploreEventsQuery({
  category,
  dateFrom,
  dateTo,
  minPrice,
  maxPrice,
  page,
  pageSize,
}: GetExploreEventsParams): Promise<ExploreEvent[]> {
  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id ?? null;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (
        event_id,
        user_id,
        role,
        joined_at
      )
    `,
    )
    .eq("status", "active")
    .eq("visibility", "public")
    .order("event_at", { ascending: true })
    .range(from, to);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (dateFrom) {
    query = query.gte("event_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("event_at", `${dateTo}T23:59:59`);
  }

  if (minPrice.trim()) {
    query = query.gte("price", Number(minPrice));
  }

  if (maxPrice.trim()) {
    query = query.lte("price", Number(maxPrice));
  }

  const { data, error } = await query;

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
