"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Inset,
  Text,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useJoinedEventActions } from "@/features/events/hooks/use-joined-event-actions";
import type { JoinedEvent } from "@/features/events/services/types";

type JoinedEventCardProps = {
  event: JoinedEvent;
};

export default function JoinedEventCard({ event }: JoinedEventCardProps) {
  const { user } = useAuth();
  const { leaveEvent, deleteEvent, isPending, error } = useJoinedEventActions();

  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;
  const isCreator = user?.id === event.creator_id;

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100">
          {cover ? (
            <img
              src={cover}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Flex align="center" justify="center" className="h-full w-full">
              <Text color="gray">Nessuna immagine</Text>
            </Flex>
          )}
        </div>
      </Inset>

      <Flex direction="column" gap="3">
        <Flex justify="between" align="start" gap="3">
          <div>
            <Text size="1" color="gray">
              {event.category ?? "Evento"}
            </Text>
            <Heading size="4">{event.title}</Heading>
          </div>

          <Badge color="gray" variant="soft">
            {event.status}
          </Badge>
        </Flex>

        <Text color="gray">
          {event.description ?? "Nessuna descrizione disponibile."}
        </Text>

        <Flex direction="column" gap="1">
          <Text size="2">
            {new Date(event.event_at).toLocaleString("it-IT")}
          </Text>
          <Text size="2">{event.location_name ?? "Luogo da definire"}</Text>
          <Text size="2">
            {joinedMembers}
            {event.max_members ? ` / ${event.max_members}` : ""} membri
          </Text>
        </Flex>

        <Flex gap="2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button className="w-full">Apri evento</Button>
          </Link>

          {isCreator ? (
            <Button
              color="red"
              variant="soft"
              onClick={() => void deleteEvent(event.id)}
              loading={isPending}
            >
              Elimina
            </Button>
          ) : (
            <Button
              color="red"
              variant="soft"
              onClick={() => void leaveEvent(event.id)}
              loading={isPending}
            >
              Esci
            </Button>
          )}
        </Flex>

        {error ? <Text color="red">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
