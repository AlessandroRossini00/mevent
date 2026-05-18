"use client";

import Link from "next/link";
import {
  Button,
  Card,
  Flex,
  Inset,
  Separator,
  Text,
  Badge,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useJoinedEventActions } from "@/features/events/hooks/use-joined-event-actions";
import type { EventWithRelations } from "@/features/events/services/types";
import ClickablePreviewBlock from "@/components/ui/clickable-preview-block";
import EventCardMedia from "@/components/ui/event-card-media";
import EventMetaGrid from "@/components/ui/event-meta-grid";
import EventLocationBlock from "@/components/ui/event-location-block";

type EventCardProps = {
  event: EventWithRelations;
  isCreated?: boolean;
  isJoined?: boolean;
  unreadCount?: number;
};

function getMapsUrl(event: EventWithRelations) {
  if (event.maps_url) return event.maps_url;
  if (event.latitude !== null && event.longitude !== null) {
    return `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;
  }
  return null;
}

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined || price === 0) {
    return "Gratis";
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export default function EventCard({
  event,
  isCreated = false,
  isJoined = false,
  unreadCount = 0,
}: EventCardProps) {
  const { user } = useAuth();
  const { leaveEvent, deleteEvent, isPending, error } = useJoinedEventActions();

  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;
  const isCreator = isCreated || user?.id === event.creator_id;
  const mapsUrl = getMapsUrl(event);

  const description = event.description ?? "Nessuna descrizione disponibile.";
  const locationName = event.location_name ?? "Luogo da definire";
  const fullAddress = event.address ?? "Indirizzo non disponibile";

  const eventDate = new Date(event.event_at);
  const formattedDate = eventDate.toLocaleDateString("it-IT");
  const formattedTime = eventDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusBadge = isCreator
    ? { label: "Creato da te", color: "jade" as const }
    : isJoined
      ? { label: "Partecipi", color: "blue" as const }
      : null;

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <EventCardMedia
          cover={cover}
          title={event.title}
          category={event.category}
          statusBadge={statusBadge}
        />
      </Inset>

      <Flex direction="column" gap="4">
        <ClickablePreviewBlock
          label="Descrizione"
          preview={description}
          hint="Tocca per leggere tutto"
          dialogTitle="Descrizione"
          dialogContent={<Text>{description}</Text>}
        />

        <EventMetaGrid
          date={formattedDate}
          time={formattedTime}
          members={
            joinedMembers + (event.max_members ? ` / ${event.max_members}` : "")
          }
          price={formatPrice(event.price)}
        />

        <EventLocationBlock
          locationName={locationName}
          fullAddress={fullAddress}
          mapsUrl={mapsUrl}
        />

        <Separator size="4" />

        <Flex gap="2" wrap="wrap" justify="between">
          <Link
            href={`/events/${event.id}/chat`}
            className="relative w-fit rounded-full"
          >
            <Button>Chat</Button>

            {unreadCount > 0 ? (
              <Badge
                color="red"
                variant="solid"
                radius="full"
                className="absolute -right-3 -top-3 z-10"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            ) : null}
          </Link>

          {isCreator ? (
            <>
              <Link
                href={`/events/${event.id}/edit`}
                className="w-fit rounded-full"
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
