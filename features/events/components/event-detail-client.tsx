"use client";

import { Box, Flex, Spinner, Text, Button } from "@radix-ui/themes";
import EventActionsBar from "@/features/events/components/event-actions-bar";
import EventHeader from "@/features/events/components/event-header";
import EventImageUpload from "@/features/events/components/event-image-upload";
import { useAuth } from "@/features/auth/hook/use-auth";
import EventChatPanel from "@/features/chat/components/event-chat-panel";
import { useJoinedEvent } from "@/features/events/hooks/use-joined-event";
import Link from "next/link";
import EventMembersCarousel from "@/features/events/components/event-members-carousel";

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
      <Flex direction="column" gap="4">
        <Flex>
          <Link href="/events">
            <Button variant="soft">Torna a Events</Button>
          </Link>
        </Flex>
        <EventMembersCarousel event={event} />
        <EventHeader event={event} />
        <EventActionsBar event={event} />
        {isCreator ? <EventImageUpload eventId={event.id} /> : null}
        <EventChatPanel eventId={event.id} />
      </Flex>
    </Box>
  );
}
