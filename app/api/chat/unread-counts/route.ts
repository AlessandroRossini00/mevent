import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { eventIds?: string[] };
  const eventIds = Array.isArray(body.eventIds) ? body.eventIds : [];

  if (eventIds.length === 0) {
    return NextResponse.json({});
  }

  const { data, error } = await supabase.rpc("get_event_unread_counts", {
    event_ids: eventIds,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = Object.fromEntries(
    (data ?? []).map((row: { event_id: string; unread_count: number }) => [
      row.event_id,
      Number(row.unread_count ?? 0),
    ]),
  );

  return NextResponse.json(result);
}
