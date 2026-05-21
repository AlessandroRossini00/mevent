"use client";

import { useEffect } from "react";
import { getJoinedEventsQuery } from "@/features/events/services/event-queries";
import { useEventsStore } from "@/features/events/store/events";

export function useJoinedEvents() {
  const joinedEvents = useEventsStore((state) => state.joinedEvents);
  const isLoading = useEventsStore((state) => state.isLoadingJoinedEvents);
  const error = useEventsStore((state) => state.error);
  const setJoinedEvents = useEventsStore((state) => state.setJoinedEvents);
  const setLoadingJoinedEvents = useEventsStore(
    (state) => state.setLoadingJoinedEvents,
  );
  const setError = useEventsStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoadingJoinedEvents(true);
        setError(null);

        const data = await getJoinedEventsQuery();

        // Se il componente non è più attivo ignoriamo la risposta
        // per evitare aggiornamenti tardivi dello store.
        if (!active) return;

        setJoinedEvents(data);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Errore caricamento joined events",
        );
      } finally {
        // Aggiorniamo il loading solo se questo effect è ancora valido
        // al termine della richiesta asincrona.
        if (active) setLoadingJoinedEvents(false);
      }
    };

    void run();

    return () => {
      // Segniamo l'effect come inattivo per ignorare eventuali risposte
      // arrivate dopo l'unmount del componente.
      active = false;
    };
  }, [setJoinedEvents, setLoadingJoinedEvents, setError]);

  return {
    events: joinedEvents,
    isLoading,
    error,
  };
}
