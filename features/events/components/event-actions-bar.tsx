"use client";

import { useMemo } from "react";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useJoinedEventActions } from "@/features/events/hooks/use-joined-event-actions";
import type { EventWithRelations } from "@/features/events/services/types";

type EventActionsBarProps = {
  event: EventWithRelations;
};

export default function EventActionsBar({ event }: EventActionsBarProps) {
  const { user } = useAuth();
  const { leaveEvent, deleteEvent, isPending, error } = useJoinedEventActions();

  const isCreator = user?.id === event.creator_id;

  const isMember = useMemo(() => {
    if (!user) return false;
    return (
      event.event_members?.some((member) => member.user_id === user.id) ?? false
    );
  }, [event.event_members, user]);

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Text size="2" color="gray">
            {isCreator
              ? "Sei il creator di questo evento. Puoi eliminarlo ma non lasciarlo come un membro normale."
              : isMember
                ? "Stai partecipando a questo evento."
                : "Non partecipi a questo evento."}
          </Text>

          <Flex gap="2">
            {isCreator ? (
              <Button
                color="red"
                variant="soft"
                onClick={() => void deleteEvent(event.id)}
                loading={isPending}
              >
                Elimina evento
              </Button>
            ) : isMember ? (
              <Button
                color="red"
                variant="soft"
                onClick={() => void leaveEvent(event.id)}
                loading={isPending}
              >
                Lascia evento
              </Button>
            ) : null}
          </Flex>
        </Flex>

        {error ? <Text color="red">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
