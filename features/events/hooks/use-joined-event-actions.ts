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

  const leaveEvent = async (eventId: string) => {
    setIsPending(true);
    setError(null);

    try {
      await leaveJoinedEventAction(eventId);
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
      removeJoinedEvent(eventId);
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
