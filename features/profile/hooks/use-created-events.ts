"use client";

import { useEffect } from "react";
import { getCreatedEventsQuery } from "@/features/profile/services/profile-queries";
import { useProfileStore } from "@/features/profile/store/profile";

export function useCreatedEvents() {
  const events = useProfileStore((state) => state.createdEvents);
  const isLoading = useProfileStore((state) => state.isLoadingCreatedEvents);
  const error = useProfileStore((state) => state.error);
  const setCreatedEvents = useProfileStore((state) => state.setCreatedEvents);
  const setLoadingCreatedEvents = useProfileStore(
    (state) => state.setLoadingCreatedEvents,
  );
  const setError = useProfileStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoadingCreatedEvents(true);
        setError(null);
        const data = await getCreatedEventsQuery();
        if (!active) return;
        setCreatedEvents(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Errore caricamento eventi creati",
        );
      } finally {
        if (active) setLoadingCreatedEvents(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [setCreatedEvents, setLoadingCreatedEvents, setError]);

  return { events, isLoading, error };
}
