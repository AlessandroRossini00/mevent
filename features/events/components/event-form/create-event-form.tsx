"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/features/events/components/event-form/event-form";
import { useEventActions } from "@/features/events/hooks/use-event-actions";
import { createEventAction } from "@/features/events/services/event-actions";

export default function CreateEventForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { uploadImage } = useEventActions();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      try {
        const image = formData.get("event_image") as File | null;

        const result = await createEventAction(formData);

        if (image && image.size > 0) {
          await uploadImage(result.eventId, image);
        }

        router.push(`/events/${result.eventId}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore creazione evento",
        );
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
