"use client";

import { useState } from "react";
import { joinEventAction } from "@/features/events/services/event-actions";
import {
  saveEventImageRecord,
  uploadEventImage,
} from "@/features/events/services/event-storage";

export function useEventActions() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinEvent = async (eventId: string) => {
    setIsPending(true);
    setError(null);

    try {
      return await joinEventAction(eventId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore join evento";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const uploadImage = async (eventId: string, file: File) => {
    setIsPending(true);
    setError(null);

    try {
      const uploaded = await uploadEventImage(eventId, file);
      return await saveEventImageRecord(eventId, uploaded.imageUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore upload immagine";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    joinEvent,
    uploadImage,
    isPending,
    error,
  };
}
