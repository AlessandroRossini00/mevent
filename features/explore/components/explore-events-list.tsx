"use client";

import { useEffect, useRef } from "react";
import { Button, Card, Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import ExploreEventCard from "@/features/explore/components/explore-event-card";
import ExploreFilters from "@/features/explore/components/explore-filters";
import { useExploreEvents } from "@/features/explore/hooks/use-explore-events";

export default function ExploreEventsList() {
  const { events, isLoading, isLoadingMore, error, hasMore, loadMore } =
    useExploreEvents();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;

        // Quando il sentinel entra in viewport carichiamo automaticamente
        // la pagina successiva, evitando chiamate multiple mentre è già in corso un fetch.
        if (hasMore && !isLoading && !isLoadingMore) {
          void loadMore();
        }
      },
      {
        root: null,

        // Anticipiamo il caricamento prima che l'utente arrivi davvero in fondo,
        // così lo scroll risulta più fluido e percepito come immediato.
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const showEmptyState = !isLoading && !error && events.length === 0;
  const showGrid = !isLoading && !error && events.length > 0;

  return (
    <Flex direction="column" gap="4">
      <ExploreFilters />

      {isLoading ? (
        <Flex justify="center" py="8">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {error ? <Text color="red">{error}</Text> : null}

      {showEmptyState ? (
        <Card size="3">
          <Text color="gray">
            Non ci sono eventi che corrispondono ai filtri.
          </Text>
        </Card>
      ) : null}

      {showGrid ? (
        <>
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            {events.map((event) => (
              <ExploreEventCard key={event.id} event={event} />
            ))}
          </Grid>

          {/* Sentinel osservato dall'IntersectionObserver per attivare il load more */}
          <div ref={loadMoreRef} />

          {isLoadingMore ? (
            <Flex justify="center" py="4">
              <Spinner />
            </Flex>
          ) : null}

          {hasMore ? (
            <Flex justify="center" pt="2">
              <Button onClick={() => void loadMore()} disabled={isLoadingMore}>
                {/* Manteniamo anche il bottone come fallback esplicito,
                    utile se l'observer non scatta subito o per dare più controllo all'utente */}
                Carica altri eventi
              </Button>
            </Flex>
          ) : null}
        </>
      ) : null}
    </Flex>
  );
}
