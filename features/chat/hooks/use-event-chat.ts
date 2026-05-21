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

  // Lo store chat è indicizzato per eventId:
  // ogni conversazione mantiene quindi i propri messaggi, loading ed errore separati.
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

        // Se l'hook non è più attivo ignoriamo il risultato,
        // così evitiamo aggiornamenti tardivi dello store.
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
      // Segniamo questa istanza come inattiva per ignorare risposte
      // arrivate dopo un cambio eventId o dopo l'unmount del componente.
      active = false;
    };
  }, [eventId, setMessages, setLoading, setError]);

  return { messages, isLoading, error };
}
