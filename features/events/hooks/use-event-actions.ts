"use client";

import { useState } from "react";
import {
  joinEventAction,
  updateEventAction,
} from "@/features/events/services/event-actions";
import {
  saveEventImageRecord,
  uploadEventImage,
} from "@/features/events/services/event-storage";
import { useEventsStore } from "@/features/events/store/events";
import { useProfileStore } from "@/features/profile/store/profile";
import type { JoinedEvent } from "@/features/events/services/types";
import type { CreatedEvent } from "@/features/profile/services/types";

export function useEventActions() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertJoinedEvent = useEventsStore((state) => state.upsertJoinedEvent);
  const setCurrentEvent = useEventsStore((state) => state.setCurrentEvent);
  const upsertCreatedEvent = useProfileStore(
    (state) => state.upsertCreatedEvent,
  );

  const joinEvent = async (eventId: string) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await joinEventAction(eventId);

      if (result.type === "joined" && "event" in result && result.event) {
        upsertJoinedEvent(result.event as JoinedEvent);
        setCurrentEvent(result.event as JoinedEvent);
      }

      return result;
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

  const updateEvent = async (eventId: string, formData: FormData) => {
    setIsPending(true);
    setError(null);

    try {
      const updatedEvent = await updateEventAction(eventId, formData);

      if (updatedEvent) {
        setCurrentEvent(updatedEvent);
        upsertJoinedEvent(updatedEvent as JoinedEvent);
        upsertCreatedEvent(updatedEvent as CreatedEvent);
      }

      return updatedEvent;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore modifica evento";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    joinEvent,
    uploadImage,
    updateEvent,
    isPending,
    error,
  };
}
