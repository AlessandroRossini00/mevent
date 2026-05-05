"use client";

import Link from "next/link";
import { Box, Button, Card, Flex, Spinner, Text } from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import EventChatPanel from "@/features/chat/components/event-chat-panel";
import EventActionsBar from "@/features/events/components/event-actions-bar";
import EventHeader from "@/features/events/components/event-header";
import EventImageUpload from "@/features/events/components/event-image-upload";
import EventMembersCarousel from "@/features/events/components/event-members-carousel";
import { useJoinedEvent } from "@/features/events/hooks/use-joined-event";

type EventDetailClientProps = {
  eventId: string;
};

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const { user } = useAuth();
  const { event, isLoading, error } = useJoinedEvent(eventId);

  if (isLoading) {
    return (
      <Flex minHeight="60vh" align="center" justify="center">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (error || !event) {
    return (
      <Box p="4">
        <Text color="red">{error ?? "Evento non trovato."}</Text>
      </Box>
    );
  }

  const isCreator = user?.id === event.creator_id;

  return (
    <Box p="4">
      <Box className="mx-auto w-full max-w-[960px]">
        <Flex direction="column" gap="4">
          <Flex>
            <Link href="/events">
              <Button variant="soft">Torna a Events</Button>
            </Link>
          </Flex>

          <Card size="3">
            <Flex direction="column" gap="4">
              <EventHeader event={event} />
              <EventActionsBar event={event} />
            </Flex>
          </Card>

          <Card size="3">
            <Flex direction="column" gap="4">
              <Text size="3" weight="medium">
                Partecipanti
              </Text>
              <EventMembersCarousel event={event} />
            </Flex>
          </Card>

          {isCreator ? (
            <Card size="3">
              <Flex direction="column" gap="4">
                <Text size="3" weight="medium">
                  Gestione immagini
                </Text>
                <EventImageUpload eventId={event.id} />
              </Flex>
            </Card>
          ) : null}

          <Card size="3">
            <Flex direction="column" gap="4">
              <Text size="3" weight="medium">
                Chat evento
              </Text>
              <EventChatPanel eventId={event.id} />
            </Flex>
          </Card>
        </Flex>
      </Box>
    </Box>
  );
}
