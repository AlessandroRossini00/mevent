"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  DataList,
  Flex,
  Heading,
  Inset,
  Text,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useJoinedEventActions } from "@/features/events/hooks/use-joined-event-actions";
import type { EventWithRelations } from "@/features/events/services/types";

type EventCardProps = {
  event: EventWithRelations;
  isCreated?: boolean;
  isJoined?: boolean;
};

export default function EventCard({
  event,
  isCreated = false,
  isJoined = false,
}: EventCardProps) {
  const { user } = useAuth();
  const { leaveEvent, deleteEvent, isPending, error } = useJoinedEventActions();

  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;
  const isCreator = isCreated || user?.id === event.creator_id;

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          {cover ? (
            <Image
              src={cover}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
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

          {isCreator ? (
            <Badge color="jade" variant="soft">
              Creato da te
            </Badge>
          ) : isJoined ? (
            <Badge color="blue" variant="soft">
              Partecipi
            </Badge>
          ) : null}
        </Flex>

        <Text color="gray">
          {event.description ?? "Nessuna descrizione disponibile."}
        </Text>

        <DataList.Root>
          <DataList.Item>
            <DataList.Label minWidth="88px">Data</DataList.Label>
            <DataList.Value>
              {new Date(event.event_at).toLocaleString("it-IT")}
            </DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label minWidth="88px">Luogo</DataList.Label>
            <DataList.Value>
              {event.location_name ?? "Luogo da definire"}
            </DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label minWidth="88px">Membri</DataList.Label>
            <DataList.Value>
              {joinedMembers}
              {event.max_members ? ` / ${event.max_members}` : ""} membri
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>

        <Flex gap="2" wrap="wrap">
          <Link href={`/events/${event.id}`} className="flex-1 min-w-35">
            <Button className="w-full">Apri evento</Button>
          </Link>

          {isCreator ? (
            <>
              <Link
                href={`/events/${event.id}/edit`}
                className="flex-1 min-w-35"
              >
                <Button variant="soft" className="w-full">
                  Modifica
                </Button>
              </Link>

              <Button
                color="red"
                variant="soft"
                onClick={() => void deleteEvent(event.id)}
                loading={isPending}
              >
                Elimina
              </Button>
            </>
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
