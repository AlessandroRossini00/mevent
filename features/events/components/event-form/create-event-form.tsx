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

    if (!navigator.onLine) {
      setError("Sei offline. Riconnettiti per creare l'evento.");
      return;
    }

    startTransition(async () => {
      try {
        const image = formData.get("event_image") as File | null;
        const optimizedImage =
          image && image.size > 0 ? await optimizeImage(image) : null;

        const result = await createEventAction(formData);

        if (optimizedImage) {
          await uploadImage(result.eventId, optimizedImage);
        }

        router.push(`/events`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Errore creazione evento";

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
