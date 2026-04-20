"use client";

import { useEffect } from "react";
import { getExploreEventsQuery } from "@/features/explore/services/explore-queries";
import { useExploreStore } from "@/features/explore/store/explore";

export function useExploreEvents() {
  const events = useExploreStore((state) => state.events);
  const isLoading = useExploreStore((state) => state.isLoading);
  const error = useExploreStore((state) => state.error);
  const search = useExploreStore((state) => state.search);
  const category = useExploreStore((state) => state.category);
  const setEvents = useExploreStore((state) => state.setEvents);
  const setLoading = useExploreStore((state) => state.setLoading);
  const setError = useExploreStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getExploreEventsQuery();
        if (!active) return;
        setEvents(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Errore caricamento eventi explore",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [setEvents, setLoading, setError]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      (event.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (event.location_name ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "all" ||
      (event.category ?? "").toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return {
    events: filteredEvents,
    isLoading,
    error,
  };
}
