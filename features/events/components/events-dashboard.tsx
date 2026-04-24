"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import EventCard from "@/features/events/components/event-card";
import { useCreatedEvents } from "@/features/events/hooks/use-created-events";
import { useJoinedEvents } from "@/features/events/hooks/use-joined-events";
import type { EventWithRelations } from "@/features/events/services/types";

const MAX_USER_EVENTS = 20;

type EventsFilter = "all" | "joined" | "created";

type DashboardEvent = {
  event: EventWithRelations;
  isJoined: boolean;
  isCreated: boolean;
};

export default function EventsDashboard() {
  const [filter, setFilter] = useState<EventsFilter>("all");
  const { user } = useAuth();

  const {
    events: joinedEvents,
    isLoading: isLoadingJoined,
    error: joinedError,
  } = useJoinedEvents();

  const {
    events: createdEvents,
    isLoading: isLoadingCreated,
    error: createdError,
  } = useCreatedEvents();

  const isLoading = isLoadingJoined || isLoadingCreated;
  const error = joinedError || createdError;

  const usedSlots = useMemo(() => {
    const ids = new Set<string>();

    for (const event of joinedEvents) {
      ids.add(event.id);
    }

    for (const event of createdEvents) {
      ids.add(event.id);
    }

    return ids.size;
  }, [joinedEvents, createdEvents]);

  const hasReachedLimit = usedSlots >= MAX_USER_EVENTS;

  const events = useMemo<DashboardEvent[]>(() => {
    const userId = user?.id;

    const joinedFromOthers = joinedEvents.filter(
      (event) => event.creator_id !== userId,
    );

    if (filter === "joined") {
      return joinedFromOthers.map((event) => ({
        event,
        isJoined: true,
        isCreated: false,
      }));
    }

    if (filter === "created") {
      return createdEvents.map((event) => ({
        event,
        isJoined: true,
        isCreated: true,
      }));
    }

    const map = new Map<string, DashboardEvent>();

    for (const event of joinedFromOthers) {
      map.set(event.id, {
        event,
        isJoined: true,
        isCreated: false,
      });
    }

    for (const event of createdEvents) {
      map.set(event.id, {
        event,
        isJoined: true,
        isCreated: true,
      });
    }

    return Array.from(map.values());
  }, [filter, joinedEvents, createdEvents, user?.id]);

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center" gap="4" wrap="wrap">
        <Box>
          <Heading size="6">Eventi</Heading>
          <Text color="gray">
            Vedi gli eventi a cui partecipi, quelli che hai creato o creane uno
            nuovo.
          </Text>
        </Box>

        <Flex align="center" gap="3" wrap="wrap">
          <Text size="2" color={hasReachedLimit ? "red" : "gray"}>
            {usedSlots} / {MAX_USER_EVENTS} eventi
          </Text>

          <SegmentedControl.Root
            value={filter}
            onValueChange={(value) => setFilter(value as EventsFilter)}
          >
            <SegmentedControl.Item value="all">Tutti</SegmentedControl.Item>
            <SegmentedControl.Item value="joined">
              Partecipi
            </SegmentedControl.Item>
            <SegmentedControl.Item value="created">
              Creati
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          <Link
            href={hasReachedLimit ? "#" : "/events/new"}
            onClick={(event) => {
              if (hasReachedLimit) {
                event.preventDefault();
              }
            }}
          >
            <Button disabled={hasReachedLimit}>Crea evento</Button>
          </Link>
        </Flex>
      </Flex>

      {hasReachedLimit ? (
        <Text size="2" color="red">
          Hai raggiunto il limite massimo di {MAX_USER_EVENTS} eventi. Esci da
          un evento o elimina un evento creato per liberare spazio.
        </Text>
      ) : null}

      {isLoading ? (
        <Flex justify="center" py="8">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {error ? <Text color="red">{error}</Text> : null}

      {!isLoading && !error && events.length === 0 ? (
        <Text color="gray">Non ci sono ancora eventi da mostrare.</Text>
      ) : null}

      {!isLoading && !error && events.length > 0 ? (
        <Grid columns={{ initial: "1", md: "2", xl: "3" }} gap="4">
          {events.map((item) => (
            <EventCard
              key={item.event.id}
              event={item.event}
              isJoined={item.isJoined}
              isCreated={item.isCreated}
            />
          ))}
        </Grid>
      ) : null}
    </Flex>
  );
}
