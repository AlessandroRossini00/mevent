"use client";

// AI
import { useEffect, useMemo, useState } from "react";

export function useEventUnreadCounts(eventIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const normalizedEventIds = useMemo(
    () => Array.from(new Set(eventIds)).filter(Boolean).sort(),
    [eventIds],
  );

  useEffect(() => {
    if (normalizedEventIds.length === 0) {
      setCounts({});
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat/unread-counts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventIds: normalizedEventIds }),
        });

        if (!res.ok) {
          throw new Error("Errore caricamento unread counts");
        }

        const data = (await res.json()) as Record<string, number>;

        if (!cancelled) {
          setCounts(data);
        }
      } catch {
        if (!cancelled) {
          setCounts({});
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [normalizedEventIds]);

  return { counts, isLoading };
}
