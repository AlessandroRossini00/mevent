"use client";

import { Grid, Spinner, Flex, Text } from "@radix-ui/themes";
import ExploreEventCard from "@/features/explore/components/explore-event-card";
import ExploreFilters from "@/features/explore/components/explore-filters";
import { useExploreEvents } from "@/features/explore/hooks/use-explore-events";

export default function ExploreEventsList() {
  const { events, isLoading, error } = useExploreEvents();

  return (
    <Flex direction="column" gap="4">
      <ExploreFilters />

      {isLoading ? (
        <Flex justify="center" py="8">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {error ? <Text color="red">{error}</Text> : null}

      {!isLoading && !error && !events.length ? (
        <Text color="gray">Nessun evento disponibile.</Text>
      ) : null}

      {!isLoading && !error && !!events.length ? (
        <Grid columns={{ initial: "1", md: "2", xl: "3" }} gap="4">
          {events.map((event) => (
            <ExploreEventCard key={event.id} event={event} />
          ))}
        </Grid>
      ) : null}
    </Flex>
  );
}
