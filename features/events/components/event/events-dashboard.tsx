"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useAuth } from "@/features/auth/hook/use-auth";
import { useEventUnreadCounts } from "@/features/chat/hooks/use-event-unread-counts";
import EventCard from "@/features/events/components/event/event-card";
import { useCreatedEvents } from "@/features/events/hooks/use-created-events";
import { useJoinedEvents } from "@/features/events/hooks/use-joined-events";
import type { EventWithRelations } from "@/features/events/services/types";
import { MAX_USER_EVENTS } from "../../constants";

type EventsFilter = "all" | "joined" | "created";

type DashboardEvent = {
  event: EventWithRelations;
  isJoined: boolean;
  isCreated: boolean;
};

function getEventSortTimestamp(item: DashboardEvent) {
  return new Date(item.event.created_at ?? 0).getTime();
}

function sortDashboardEvents(a: DashboardEvent, b: DashboardEvent) {
  if (a.isCreated !== b.isCreated) {
    return a.isCreated ? 1 : -1;
  }

  return getEventSortTimestamp(b) - getEventSortTimestamp(a);
}

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

    for (const event of joinedEvents) ids.add(event.id);
    for (const event of createdEvents) ids.add(event.id);

    return ids.size;
  }, [joinedEvents, createdEvents]);

  const hasReachedLimit = usedSlots >= MAX_USER_EVENTS;

  const allEvents = useMemo<DashboardEvent[]>(() => {
    const userId = user?.id;
    const map = new Map<string, DashboardEvent>();

    for (const event of joinedEvents) {
      if (event.creator_id === userId) continue;

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

    return Array.from(map.values()).sort(sortDashboardEvents);
  }, [joinedEvents, createdEvents, user?.id]);

  const visibleEventIds = useMemo(() => {
    if (filter === "joined") {
      return new Set(
        allEvents
          .filter((item) => item.isJoined && !item.isCreated)
          .map((item) => item.event.id),
      );
    }

    if (filter === "created") {
      return new Set(
        allEvents.filter((item) => item.isCreated).map((item) => item.event.id),
      );
    }

    return new Set(allEvents.map((item) => item.event.id));
  }, [allEvents, filter]);

  const visibleCount = visibleEventIds.size;

  const eventIds = useMemo(
    () => allEvents.map((item) => item.event.id),
    [allEvents],
  );

  const { counts: unreadCounts } = useEventUnreadCounts(eventIds);

  return (
    <Flex direction="column" gap="4">
      <div className="sticky top-0 z-30 pb-3">
        <Card
          size="3"
          className="border border-black/5 bg-white/95 shadow-sm backdrop-blur"
        >
          <Flex
            direction={{ initial: "column", md: "row" }}
            align={{ initial: "center", md: "center" }}
            justify="between"
            gap="3"
          >
            <Text
              size="2"
              weight="medium"
              color={hasReachedLimit ? "red" : "gray"}
            >
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
                if (hasReachedLimit) event.preventDefault();
              }}
            >
              <Button disabled={hasReachedLimit}>Crea evento</Button>
            </Link>
          </Flex>
        </Card>
      </div>

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

      {!isLoading && !error && visibleCount === 0 ? (
        <Card size="3">
          <Text color="gray">Non ci sono ancora eventi da mostrare.</Text>
        </Card>
      ) : null}

      {!isLoading && !error && allEvents.length > 0 ? (
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {allEvents.map((item) => {
            const isVisible = visibleEventIds.has(item.event.id);

            return (
              <Box
                key={item.event.id}
                style={{ display: isVisible ? "block" : "none" }}
              >
                <EventCard
                  event={item.event}
                  isJoined={item.isJoined}
                  isCreated={item.isCreated}
                  unreadCount={unreadCounts[item.event.id] ?? 0}
                />
              </Box>
            );
          })}
        </Grid>
      ) : null}
    </Flex>
  );
}
