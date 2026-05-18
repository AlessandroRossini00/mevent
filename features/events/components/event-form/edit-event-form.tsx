"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/features/events/components/event-form/event-form";
import { useEventActions } from "@/features/events/hooks/use-event-actions";
import type { EventWithRelations } from "@/features/events/services/types";
import { optimizeImage } from "@/lib/utils";

type EditEventFormProps = {
  event: EventWithRelations;
};

export default function EditEventForm({ event }: EditEventFormProps) {
  const { updateEvent, uploadImage, isPending, error } = useEventActions();
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLocalError(null);

    if (!navigator.onLine) {
      setLocalError("Sei offline. Riconnettiti per salvare le modifiche.");
      return;
    }

    try {
      const image = formData.get("event_image") as File | null;
      const optimizedImage =
        image && image.size > 0 ? await optimizeImage(image) : null;

      if (optimizedImage) {
        await uploadImage(event.id, optimizedImage);
      }

      await updateEvent(event.id, formData);

      router.push(`/events`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore modifica evento";

      if (
        message.toLowerCase().includes("failed to fetch") ||
        !navigator.onLine
      ) {
        setLocalError(
          "Sei offline o la connessione non è disponibile. Riprova quando torni online.",
        );
        return;
      }

      setLocalError(message);
    }
  };

  return (
    <EventForm
      title="Modifica evento"
      submitLabel="Salva modifiche"
      error={localError ?? error}
      isPending={isPending}
      defaultValues={{
        title: event.title,
        description: event.description,
        category: event.category,
        event_at: toDateTimeLocalValue(event.event_at),
        location_name: event.location_name,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
        price: event.price,
        max_members: event.max_members,
        maps_url: event.maps_url,
        image_url: event.event_images?.[0]?.image_url ?? null,
      }}
      onSubmit={handleSubmit}
    />
  );
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}
