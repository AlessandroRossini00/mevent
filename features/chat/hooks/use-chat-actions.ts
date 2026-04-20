"use client";

import { startTransition, useState } from "react";
import { sendEventMessage } from "@/features/chat/services/chat-actions";
import { useChatStore } from "@/features/chat/store/chat";

export function useChatActions(eventId: string) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addMessage = useChatStore((state) => state.addMessage);

  const sendMessage = async (body: string) => {
    setIsSending(true);
    setError(null);

    try {
      const message = await sendEventMessage(eventId, body);

      startTransition(() => {
        addMessage(eventId, message);
      });

      return message;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore invio messaggio";
      setError(message);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending, error };
}
