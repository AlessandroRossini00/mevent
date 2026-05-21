"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/features/events/components/event-form/event-form";
import { useEventActions } from "@/features/events/hooks/use-event-actions";
import { createEventAction } from "@/features/events/services/event-actions";
import { optimizeImage } from "@/lib/utils";

export default function CreateEventForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { uploadImage } = useEventActions();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);

    // Blocchiamo subito la creazione se il device è offline,
    // così evitiamo una richiesta destinata a fallire.
    if (!navigator.onLine) {
      setError("Sei offline. Riconnettiti per creare l'evento.");
      return;
    }

    startTransition(async () => {
      try {
        const image = formData.get("event_image") as File | null;

        // L'immagine viene compressa lato client prima dell'upload
        // per ridurre peso del file e tempo di caricamento.
        const optimizedImage =
          image && image.size > 0 ? await optimizeImage(image) : null;

        // Creiamo prima l'evento per ottenere l'id necessario
        // a salvare poi la cover nello storage con il path corretto.
        const result = await createEventAction(formData);

        if (optimizedImage) {
          await uploadImage(result.eventId, optimizedImage);
        }

        router.push(`/events`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Errore creazione evento";

        // Gli errori di rete/offline vengono intercettati separatamente
        // per mostrare un messaggio più utile del semplice errore tecnico.
        if (
          message.toLowerCase().includes("failed to fetch") ||
          !navigator.onLine
        ) {
          setError(
            "Sei offline o la connessione non è disponibile. Riprova quando torni online.",
          );
          return;
        }

        setError(message);
      }
    });
  };

  return (
    <EventForm
      title="Crea evento"
      submitLabel="Crea evento"
      error={error}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  );
}
