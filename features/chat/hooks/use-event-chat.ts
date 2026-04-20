"use client";

import { useEffect } from "react";
import { getEventMessages } from "@/features/chat/services/chat-queries";
import { useChatStore } from "@/features/chat/store/chat";

const EMPTY_MESSAGES: never[] = [];

export function useEventChat(eventId: string) {
  const messagesByEvent = useChatStore((state) => state.messagesByEvent);
  const isLoadingByEvent = useChatStore((state) => state.isLoadingByEvent);
  const errorByEvent = useChatStore((state) => state.errorByEvent);

  const setMessages = useChatStore((state) => state.setMessages);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);

  const messages = messagesByEvent[eventId] ?? EMPTY_MESSAGES;
  const isLoading = isLoadingByEvent[eventId] ?? false;
  const error = errorByEvent[eventId] ?? null;

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(eventId, true);
        setError(eventId, null);

        const data = await getEventMessages(eventId);

        if (!active) return;
        setMessages(eventId, data);
      } catch (err) {
        if (!active) return;
        setError(
          eventId,
          err instanceof Error ? err.message : "Errore caricamento chat",
        );
      } finally {
        if (active) setLoading(eventId, false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [eventId, setMessages, setLoading, setError]);

  return { messages, isLoading, error };
}
