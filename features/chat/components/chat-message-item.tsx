"use client";

import { Avatar, Flex, Text } from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import type { EventMessage } from "@/features/chat/services/types";

type ChatMessageItemProps = {
  message: EventMessage;
};

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;

  const senderName =
    message.sender?.full_name ?? message.sender?.username ?? "Utente";

  return (
    <Flex justify={isOwn ? "end" : "start"} width="100%">
      <Flex
        direction="column"
        gap="2"
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn ? "bg-black text-white" : "bg-zinc-100 text-zinc-900"
        }`}
      >
        {!isOwn ? (
          <Flex align="center" gap="2">
            <Avatar
              size="1"
              radius="full"
              src={message.sender?.avatar_url ?? undefined}
              fallback={senderName.slice(0, 1).toUpperCase()}
            />
            <Text size="1" weight="medium">
              {senderName}
            </Text>
          </Flex>
        ) : null}

        <Text size="2" className={isOwn ? "text-white" : "text-zinc-900"}>
          {message.body}
        </Text>

        <Text size="1" className={isOwn ? "text-white/70" : "text-zinc-500"}>
          {new Date(message.created_at).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Flex>
    </Flex>
  );
}
