"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventMessage } from "@/features/chat/services/types";
import { sendPushToUsers } from "@/features/pwa/services/send-push";

export async function sendEventMessage(
  eventId: string,
  body: string,
): Promise<EventMessage> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Solo utenti autenticati possono inviare messaggi in chat.
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

  // Dopo l'insert rileggiamo il messaggio completo con i dati del sender,
  // così il client riceve subito il payload già pronto per il rendering.
  const message = data as unknown as EventMessage;

  const senderName =
    message.sender?.full_name || message.sender?.username || "Un utente";

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  const { data: members, error: membersError } = await supabase
    .from("event_members")
    .select("user_id")
    .eq("event_id", eventId)
    .neq("user_id", user.id);

  if (membersError) throw membersError;

  // Le notifiche push vengono inviate a tutti i partecipanti dell'evento
  // tranne chi ha appena mandato il messaggio.
  const recipientIds = Array.from(
    new Set((members ?? []).map((member) => member.user_id).filter(Boolean)),
  );

  if (recipientIds.length > 0) {
    const notificationTitle = `Nuovo messaggio in ${eventData.title}`;
    const notificationBody = `${senderName}: ${trimmedBody}`;
    const notificationUrl = `/events/${eventId}/chat`;

    await sendPushToUsers(recipientIds, {
      title: notificationTitle,
      body: notificationBody,
      url: notificationUrl,
      icon: "/icons/icon-256.png",
      badge: "/icons/icon-256.png",
    });
  }

  return message;
}

export async function markEventChatAsRead(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("event_message_reads").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    },
    {
      // Usiamo upsert perché per ogni coppia evento/utente
      // vogliamo mantenere un solo record con l'ultimo timestamp di lettura.
      onConflict: "event_id,user_id",
    },
  );

  if (error) throw error;
}
