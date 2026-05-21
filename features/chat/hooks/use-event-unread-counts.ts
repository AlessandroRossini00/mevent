"use client";

import { useEffect, useMemo, useState } from "react";

export function useEventUnreadCounts(eventIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const normalizedEventIds = useMemo(
    () =>
      // Normalizziamo gli id per evitare fetch inutili dovuti a duplicati
      // o a ordini diversi della stessa lista logica.
      Array.from(new Set(eventIds)).filter(Boolean).sort(),
    [eventIds],
  );

  useEffect(() => {
    if (normalizedEventIds.length === 0) {
      // Se non ci sono eventi da controllare, svuotiamo subito i badge unread.
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

        // Aggiorniamo lo stato solo se l'effect è ancora valido,
        // evitando update tardivi dopo unmount o cambio lista eventi.
        if (!cancelled) {
          setCounts(data);
        }
      } catch {
        if (!cancelled) {
          // In caso di errore usiamo un fallback vuoto
          // per non lasciare badge inconsistenti in UI.
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
      // Segniamo la richiesta come non più rilevante per ignorarne il risultato
      // se arriva dopo un cambio di dipendenze o dopo l'unmount.
      cancelled = true;
    };
  }, [normalizedEventIds]);

  return { counts, isLoading };
}
