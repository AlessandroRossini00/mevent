"use client";

import { useState } from "react";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useEventActions } from "@/features/events/hooks/use-event-actions";

type EventImageUploadProps = {
  eventId: string;
};

export default function EventImageUpload({ eventId }: EventImageUploadProps) {
  const { uploadImage, isPending, error } = useEventActions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadImage(eventId, selectedFile);
    setSelectedFile(null);
  };

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Text size="3" weight="medium">
          Aggiungi immagine evento
        </Text>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
          }}
        />

        {selectedFile ? (
          <Text size="2" color="gray">
            File selezionato: {selectedFile.name}
          </Text>
        ) : null}

        <Flex justify="end">
          <Button
            onClick={() => void handleUpload()}
            disabled={!selectedFile}
            loading={isPending}
          >
            Carica immagine
          </Button>
        </Flex>

        {error ? <Text color="red">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
