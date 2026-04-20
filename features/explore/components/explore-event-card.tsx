"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Inset,
  Text,
} from "@radix-ui/themes";
import { useEventActions } from "@/features/events/hooks/use-event-actions";
import { useExploreStore } from "@/features/explore/store/explore";
import type { ExploreEvent } from "@/features/explore/services/types";

type ExploreEventCardProps = {
  event: ExploreEvent;
};

export default function ExploreEventCard({ event }: ExploreEventCardProps) {
  const router = useRouter();
  const { joinEvent, isPending, error } = useEventActions();
  const removeEvent = useExploreStore((state) => state.removeEvent);

  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;

  const handleJoin = async () => {
    const result = await joinEvent(event.id);

    if (result?.type === "joined") {
      removeEvent(event.id);
      router.push(`/events/${event.id}`);
      return;
    }

    if (result?.type === "request_sent") {
      removeEvent(event.id);
      return;
    }
  };

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
            {event.visibility}
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

        <Button onClick={() => void handleJoin()} loading={isPending}>
          {event.approval_mode === "approval_required"
            ? "Richiedi accesso"
            : "Partecipa"}
        </Button>

        {error ? <Text color="red">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
