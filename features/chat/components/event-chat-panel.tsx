"use client";

import { Card, Flex, Separator, Text } from "@radix-ui/themes";
import ChatInput from "@/features/chat/components/chat-input";
import ChatMessageList from "@/features/chat/components/chat-message-list";
import { useEventChat } from "@/features/chat/hooks/use-event-chat";
import { useChatRealtime } from "@/features/chat/hooks/use-chat-realtime";

type EventChatPanelProps = {
  eventId: string;
};

export default function EventChatPanel({ eventId }: EventChatPanelProps) {
  const { messages, isLoading, error } = useEventChat(eventId);

  useChatRealtime(eventId);

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Text size="4" weight="medium">
          Chat evento
        </Text>

        <Separator size="4" />

        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
        />

        <Separator size="4" />

        <ChatInput eventId={eventId} />
      </Flex>
    </Card>
  );
}
