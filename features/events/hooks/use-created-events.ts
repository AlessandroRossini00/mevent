"use client";

import { useEffect } from "react";
import { getCreatedEventsQuery } from "@/features/events/services/event-queries";
import { useEventsStore } from "@/features/events/store/events";

export function useCreatedEvents() {
  const events = useEventsStore((state) => state.createdEvents);
  const isLoading = useEventsStore((state) => state.isLoadingCreatedEvents);
  const error = useEventsStore((state) => state.error);

  const setCreatedEvents = useEventsStore((state) => state.setCreatedEvents);
  const setLoadingCreatedEvents = useEventsStore(
    (state) => state.setLoadingCreatedEvents,
  );
  const setError = useEventsStore((state) => state.setError);

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

  return {
    events,
    isLoading,
    error,
  };
}
