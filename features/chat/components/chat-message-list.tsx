"use client";

import { Flex, ScrollArea, Text } from "@radix-ui/themes";
import ChatMessageItem from "@/features/chat/components/chat-message-item";
import type { EventMessage } from "@/features/chat/services/types";

type ChatMessageListProps = {
  messages: EventMessage[];
  isLoading: boolean;
  error: string | null;
};

export default function ChatMessageList({
  messages,
  isLoading,
  error,
}: ChatMessageListProps) {
  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: 380 }}>
      <Flex direction="column" gap="3" pr="3">
        {isLoading ? <Text color="gray">Caricamento messaggi...</Text> : null}
        {!isLoading && !messages.length ? (
          <Text color="gray">Nessun messaggio. Inizia la conversazione.</Text>
        ) : null}
        {error ? <Text color="red">{error}</Text> : null}

        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
      </Flex>
    </ScrollArea>
  );
}
