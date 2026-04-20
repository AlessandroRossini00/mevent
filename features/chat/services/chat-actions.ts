"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventMessage } from "@/features/chat/services/types";

export async function sendEventMessage(
  eventId: string,
  body: string,
): Promise<EventMessage> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const trimmedBody = body.trim();
  if (!trimmedBody) {
    throw new Error("Messaggio vuoto.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("event_messages")
    .insert({
      event_id: eventId,
      sender_id: user.id,
      body: trimmedBody,
      message_type: "text",
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

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
    .eq("id", inserted.id)
    .single();

  if (error) throw error;

  return data as unknown as EventMessage;
}
