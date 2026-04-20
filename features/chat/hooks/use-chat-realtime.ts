"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/features/chat/store/chat";
import type { EventMessage } from "@/features/chat/services/types";

export function useChatRealtime(eventId: string) {
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`event-chat:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const insertedId = payload.new.id as string;

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
            .eq("id", insertedId)
            .single();

          if (error || !data) return;

          addMessage(eventId, data as unknown as EventMessage);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, addMessage]);
}
