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
import { useProfileActions } from "@/features/profile/hooks/use-profile-actions";
import type { CreatedEvent } from "@/features/profile/services/types";

type CreatedEventCardProps = {
  event: CreatedEvent;
};

export default function CreatedEventCard({ event }: CreatedEventCardProps) {
  const { deleteCreatedEvent, isPending, actionError } = useProfileActions();
  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;

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

          <Badge color="gray" variant="soft">
            {event.status}
          </Badge>
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
              {event.max_members ? ` / ${event.max_members}` : ""}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>

        <Flex gap="2" wrap="wrap">
          <Link href={`/events/${event.id}`} className="flex-1 min-w-35">
            <Button className="w-full">Apri evento</Button>
          </Link>

          <Link href={`/events/${event.id}/edit`} className="flex-1 min-w-35">
            <Button variant="soft" className="w-full">
              Modifica
            </Button>
          </Link>

          <Button
            color="red"
            variant="soft"
            onClick={() => void deleteCreatedEvent(event.id)}
            loading={isPending}
          >
            Elimina
          </Button>
        </Flex>

        {actionError ? <Text color="red">{actionError}</Text> : null}
      </Flex>
    </Card>
  );
}
