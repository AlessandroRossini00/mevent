"use client";

import { useState } from "react";
import { Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { useChatActions } from "@/features/chat/hooks/use-chat-actions";

type ChatInputProps = {
  eventId: string;
};

export default function ChatInput({ eventId }: ChatInputProps) {
  const { sendMessage, isSending, error } = useChatActions(eventId);
  const [body, setBody] = useState("");

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    await sendMessage(trimmed);
    setBody("");
  };

  return (
    <Flex direction="column" gap="3">
      <TextArea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Scrivi un messaggio"
      />

      <Flex justify="between" align="center">
        <Text color="red">{error}</Text>
        <Button onClick={() => void handleSend()} loading={isSending}>
          Invia
        </Button>
      </Flex>
    </Flex>
  );
}
