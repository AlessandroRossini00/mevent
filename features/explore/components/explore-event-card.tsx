"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Flex, Inset, Separator, Text } from "@radix-ui/themes";
import ClickablePreviewBlock from "@/components/ui/clickable-preview-block";
import EventCardMedia from "@/components/ui/event-card-media";
import EventLocationBlock from "@/components/ui/event-location-block";
import EventMetaGrid from "@/components/ui/event-meta-grid";
import { useEventActions } from "@/features/events/hooks/use-event-actions";
import { useExploreFiltersStore } from "@/features/explore/store/explore-filters";
import type { ExploreEvent } from "@/features/explore/services/types";

type ExploreEventCardProps = {
  event: ExploreEvent;
};

function getMapsUrl(event: ExploreEvent) {
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

export default function ExploreEventCard({ event }: ExploreEventCardProps) {
  const router = useRouter();

  const { joinEvent, isPending, error } = useEventActions();
  const hideEvent = useExploreFiltersStore((state) => state.hideEvent);

  const cover = event.event_images?.[0]?.image_url ?? null;
  const joinedMembers = event.event_members?.length ?? 0;
  const mapsUrl = getMapsUrl(event);

  const description = event.description ?? "Nessuna descrizione disponibile.";
  const fullAddress = event.address ?? "Indirizzo non disponibile";

  const eventDate = new Date(event.event_at);
  const formattedDate = eventDate.toLocaleDateString("it-IT");
  const formattedTime = eventDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const membersLabel =
    joinedMembers + (event.max_members ? ` / ${event.max_members}` : "");

  const handleJoin = async () => {
    const result = await joinEvent(event.id);

    if (result.type === "joined") {
      hideEvent(event.id);
    }

    router.push(`/events`);
  };

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <EventCardMedia
          cover={cover}
          title={event.title}
          category={event.category}
          statusBadge={null}
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
          members={membersLabel}
          price={formatPrice(event.price)}
        />

        <EventLocationBlock fullAddress={fullAddress} mapsUrl={mapsUrl} />

        <Separator size="4" />

        <Flex justify="center">
          <Button onClick={() => void handleJoin()} loading={isPending}>
            Partecipa
          </Button>
        </Flex>

        {error ? <Text color="red">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
