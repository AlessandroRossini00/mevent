"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { createEventAction } from "@/features/events/services/event-actions";

export default function CreateEventForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      try {
        await createEventAction(formData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore creazione evento",
        );
      }
    });
  };

  return (
    <Card size="4">
      <form action={handleSubmit}>
        <Flex direction="column" gap="4">
          <div>
            <Text as="label" size="2" weight="medium">
              Titolo
            </Text>
            <TextField.Root name="title" required />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Descrizione
            </Text>
            <TextArea name="description" />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Categoria
            </Text>
            <TextField.Root name="category" />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Data e ora
            </Text>
            <TextField.Root name="event_at" type="datetime-local" required />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Luogo
            </Text>
            <TextField.Root name="location_name" />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Indirizzo
            </Text>
            <TextField.Root name="address" />
          </div>

          <Flex gap="3">
            <div className="flex-1">
              <Text as="label" size="2" weight="medium">
                Latitudine
              </Text>
              <TextField.Root
                name="latitude"
                type="number"
                step="0.0000001"
                placeholder="45.4642"
              />
            </div>

            <div className="flex-1">
              <Text as="label" size="2" weight="medium">
                Longitudine
              </Text>
              <TextField.Root
                name="longitude"
                type="number"
                step="0.0000001"
                placeholder="9.1900"
              />
            </div>
          </Flex>

          <Flex gap="3">
            <div className="flex-1">
              <Text as="label" size="2" weight="medium">
                Prezzo
              </Text>
              <TextField.Root name="price" type="number" min="0" step="0.01" />
            </div>

            <div className="flex-1">
              <Text as="label" size="2" weight="medium">
                Max membri
              </Text>
              <TextField.Root name="max_members" type="number" min="1" />
            </div>
          </Flex>

          <div>
            <Text as="label" size="2" weight="medium">
              Sito web
            </Text>
            <TextField.Root name="website_url" placeholder="https://..." />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Link Maps
            </Text>
            <TextField.Root name="maps_url" placeholder="https://maps..." />
          </div>

          {error ? <Text color="red">{error}</Text> : null}

          <Button type="submit" loading={isPending}>
            Crea evento
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
