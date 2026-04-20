"use client";

import { Badge, Card, Flex, Heading, Inset, Text } from "@radix-ui/themes";
import type { EventWithRelations } from "@/features/events/services/types";

type EventHeaderProps = {
  event: EventWithRelations;
};

export default function EventHeader({ event }: EventHeaderProps) {
  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;

  return (
    <Card size="4">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="aspect-[16/7] w-full overflow-hidden bg-zinc-100">
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

      <Flex direction="column" gap="4">
        <Flex gap="2" wrap="wrap">
          <Badge>{event.category ?? "Evento"}</Badge>
          <Badge color="gray" variant="soft">
            {event.visibility}
          </Badge>
          <Badge color="gray" variant="soft">
            {event.status}
          </Badge>
        </Flex>

        <div>
          <Heading size="6">{event.title}</Heading>
          <Text color="gray" mt="2">
            {event.description ?? "Nessuna descrizione disponibile."}
          </Text>
        </div>

        <Flex gap="6" wrap="wrap">
          <div>
            <Text size="2" weight="medium">
              Quando
            </Text>
            <Text size="2" color="gray">
              {new Date(event.event_at).toLocaleString("it-IT")}
            </Text>
          </div>

          <div>
            <Text size="2" weight="medium">
              Dove
            </Text>
            <Text size="2" color="gray">
              {event.location_name ?? "Da definire"}
            </Text>
          </div>

          <div>
            <Text size="2" weight="medium">
              Partecipanti
            </Text>
            <Text size="2" color="gray">
              {joinedMembers}
              {event.max_members ? ` / ${event.max_members}` : ""}
            </Text>
          </div>
        </Flex>
      </Flex>
    </Card>
  );
}
