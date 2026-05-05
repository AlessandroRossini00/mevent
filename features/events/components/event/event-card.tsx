"use client";

// AI
import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Inset,
  Separator,
  Text,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useJoinedEventActions } from "@/features/events/hooks/use-joined-event-actions";
import type { EventWithRelations } from "@/features/events/services/types";
import InfoBlock from "@/components/ui/info-block";
import ImagePreviewDialog from "@/components/ui/image-preview-dialog";

type EventCardProps = {
  event: EventWithRelations;
  isCreated?: boolean;
  isJoined?: boolean;
  unreadCount?: number;
};

type ClickablePreviewBlockProps = {
  label: string;
  preview: string;
  hint?: string;
  dialogTitle: string;
  dialogContent: React.ReactNode;
};

function ClickablePreviewBlock({
  label,
  preview,
  hint,
  dialogTitle,
  dialogContent,
}: ClickablePreviewBlockProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button type="button" className="w-full text-left">
          <Box className="rounded-xl border border-black/8 bg-black/[0.02] p-3 transition hover:bg-black/[0.04]">
            <Flex direction="column" gap="1">
              <Text size="1" weight="medium" color="gray">
                {label}
              </Text>

              <Text color="gray" className="truncate">
                {preview}
              </Text>

              {hint ? (
                <Text size="1" color="blue">
                  {hint}
                </Text>
              ) : null}
            </Flex>
          </Box>
        </button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="560px">
        <Dialog.Title>{dialogTitle}</Dialog.Title>

        <Box mt="4">{dialogContent}</Box>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Chiudi</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

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

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          <ImagePreviewDialog
            src={cover}
            alt={event.title}
            dialogTitle={event.title}
            emptyText="Nessuna immagine"
            sizes="(max-width: 768px) 100vw, 50vw"
            aspectClassName="aspect-video"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <Badge size="2" variant="solid" color="gray">
              {event.category ?? "Evento"}
            </Badge>

            {isCreator ? (
              <Badge color="jade" variant="solid" size="2">
                Creato da te
              </Badge>
            ) : isJoined ? (
              <Badge color="blue" variant="solid" size="2">
                Partecipi
              </Badge>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
            <Heading size="4" className="text-white">
              {event.title}
            </Heading>
          </div>
        </div>
      </Inset>

      <Flex direction="column" gap="4">
        <ClickablePreviewBlock
          label="Descrizione"
          preview={description}
          hint="Tocca per leggere tutto"
          dialogTitle="Descrizione"
          dialogContent={<Text>{description}</Text>}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoBlock label="Data" value={formattedDate} />
          <InfoBlock label="Ora" value={formattedTime} />

          <InfoBlock
            label="Membri"
            value={
              joinedMembers +
              (event.max_members ? ` / ${event.max_members}` : "")
            }
          />
          <InfoBlock label="Prezzo" value={formatPrice(event.price)} />
        </div>

        <Box className="rounded-2xl border border-black/8 bg-black/[0.02] p-4">
          <Flex direction="column" gap="3">
            <ClickablePreviewBlock
              label="Luogo"
              preview={locationName}
              hint="Tocca per vedere tutto"
              dialogTitle="Luogo"
              dialogContent={
                <Flex direction="column" gap="2">
                  <Text weight="medium">{locationName}</Text>
                  <Text color="gray">{fullAddress}</Text>
                </Flex>
              }
            />

            {mapsUrl ? (
              <Button asChild variant="soft" className="w-full">
                <Link href={mapsUrl} target="_blank" rel="noreferrer">
                  Apri su Google Maps
                </Link>
              </Button>
            ) : null}
          </Flex>
        </Box>

        <Separator size="4" />

        {/* Modificato lo stile */}
        <Flex gap="2" wrap="wrap" justify="between">
          <Link
            href={`/events/${event.id}/chat`}
            className="relative bg-red-400 w-fit rounded-full cursor-default"
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
                className=" w-fit rounded-full "
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
