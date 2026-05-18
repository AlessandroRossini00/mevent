"use client";

import { Button, Card, Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import ExploreEventCard from "@/features/explore/components/explore-event-card";
import ExploreFilters from "@/features/explore/components/explore-filters";
import { useExploreEvents } from "@/features/explore/hooks/use-explore-events";

export default function ExplorePage() {
  const { events, isLoading, isLoadingMore, error, hasMore, loadMore } =
    useExploreEvents();

  return (
    <Flex direction="column" gap="4">
      <ExploreFilters />

      {isLoading ? (
        <Flex justify="center" py="8">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {error ? <Text color="red">{error}</Text> : null}

      {!isLoading && !error && events.length === 0 ? (
        <Card size="3">
          <Text color="gray">
            Non ci sono eventi che corrispondono ai filtri.
          </Text>
        </Card>
      ) : null}

      {!isLoading && !error && events.length > 0 ? (
        <>
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            {events.map((event) => (
              <ExploreEventCard key={event.id} event={event} />
            ))}
          </Grid>

          {hasMore ? (
            <Flex justify="center" pt="2">
              <Button onClick={() => void loadMore()} loading={isLoadingMore}>
                Carica altri eventi
              </Button>
            </Flex>
          ) : null}
        </>
      ) : null}
    </Flex>
  );
}
