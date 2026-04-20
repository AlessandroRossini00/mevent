"use client";

import { useState } from "react";
import {
  deleteCreatedEventAction,
  updateProfileAction,
} from "@/features/profile/services/profile-actions";
import { useProfileStore } from "@/features/profile/store/profile";

export function useProfileActions() {
  const [isPending, setIsPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const removeCreatedEvent = useProfileStore(
    (state) => state.removeCreatedEvent,
  );

  const updateProfile = async (formData: FormData) => {
    setIsPending(true);
    setActionError(null);

    try {
      return await updateProfileAction(formData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore aggiornamento profilo";
      setActionError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const deleteCreatedEvent = async (eventId: string) => {
    setIsPending(true);
    setActionError(null);

    try {
      await deleteCreatedEventAction(eventId);
      removeCreatedEvent(eventId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore eliminazione evento";
      setActionError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    updateProfile,
    deleteCreatedEvent,
    isPending,
    actionError,
  };
}
