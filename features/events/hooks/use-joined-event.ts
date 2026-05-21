"use client";

import { useEffect } from "react";
import { getEventByIdQuery } from "@/features/events/services/event-queries";
import { useEventsStore } from "@/features/events/store/events";

export function useJoinedEvent(eventId: string) {
  const event = useEventsStore((state) => state.currentEvent);
  const isLoading = useEventsStore((state) => state.isLoadingCurrentEvent);
  const error = useEventsStore((state) => state.error);
  const setCurrentEvent = useEventsStore((state) => state.setCurrentEvent);
  const setLoadingCurrentEvent = useEventsStore(
    (state) => state.setLoadingCurrentEvent,
  );
  const setError = useEventsStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoadingCurrentEvent(true);
        setError(null);

        const data = await getEventByIdQuery(eventId);

        // Se il componente non è più attivo ignoriamo la risposta,
        // così evitiamo aggiornamenti tardivi dello store.
        if (!active) return;

        setCurrentEvent(data);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Errore caricamento evento",
        );
      } finally {
        // Anche il loading viene aggiornato solo se questo effect
        // è ancora valido al termine della richiesta.
        if (active) setLoadingCurrentEvent(false);
      }
    };

    void run();

    return () => {
      // Segniamo l'effect come inattivo per ignorare eventuali risposte
      // che arrivano dopo l'unmount o dopo un cambio di eventId.
      active = false;
    };
  }, [eventId, setCurrentEvent, setLoadingCurrentEvent, setError]);

  return {
    event,
    isLoading,
    error,
  };
}
