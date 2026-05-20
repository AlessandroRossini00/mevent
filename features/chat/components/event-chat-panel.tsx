"use client";

import Link from "next/link";
import { Button, Card, Flex, Separator, Text } from "@radix-ui/themes";
import ChatInput from "@/features/chat/components/chat-input";
import ChatMessageList from "@/features/chat/components/chat-message-list";
import { useEventChat } from "@/features/chat/hooks/use-event-chat";
import { useChatRealtime } from "@/features/chat/hooks/use-chat-realtime";

type EventChatPanelProps = {
  eventId: string;
  backHref?: string;
};

export default function EventChatPanel({ eventId }: EventChatPanelProps) {
  const { messages, isLoading, error } = useEventChat(eventId);

  useChatRealtime(eventId);

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Link href="/events">
            <Button variant="soft">Indietro</Button>
          </Link>

          <Text size="4" weight="medium">
            Chat evento
          </Text>

          <div className="w-[96px]" aria-hidden="true" />
        </Flex>

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
