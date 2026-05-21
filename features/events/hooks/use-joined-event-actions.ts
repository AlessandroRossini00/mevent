"use client";

import { useState } from "react";
import {
  deleteEventAction,
  leaveJoinedEventAction,
} from "@/features/events/services/event-actions";
import { useEventsStore } from "@/features/events/store/events";

export function useJoinedEventActions() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeJoinedEvent = useEventsStore((state) => state.removeJoinedEvent);
  const removeEvent = useEventsStore((state) => state.removeEvent);

  const leaveEvent = async (eventId: string) => {
    setIsPending(true);
    setError(null);

    try {
      await leaveJoinedEventAction(eventId);

      // Dopo l'uscita rimuoviamo subito l'evento dalla lista locale
      // per mantenere la UI allineata senza attendere un refetch.
      removeJoinedEvent(eventId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore uscita evento";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setIsPending(true);
    setError(null);

    try {
      await deleteEventAction(eventId);

      // L'eliminazione può toccare sia le liste joined sia created,
      // quindi usiamo il reset più ampio sullo store eventi.
      removeEvent(eventId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore eliminazione evento";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    leaveEvent,
    deleteEvent,
    isPending,
    error,
  };
}
