"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getExploreEventsQuery } from "@/features/explore/services/explore-queries";
import { useExploreFiltersStore } from "@/features/explore/store/explore-filters";
import type { ExploreEvent } from "@/features/explore/services/types";
import { PAGE_SIZE } from "../constants";

export function useExploreEvents() {
  const category = useExploreFiltersStore((state) => state.appliedCategory);
  const dateFrom = useExploreFiltersStore((state) => state.appliedDateFrom);
  const dateTo = useExploreFiltersStore((state) => state.appliedDateTo);
  const minPrice = useExploreFiltersStore((state) => state.appliedMinPrice);
  const maxPrice = useExploreFiltersStore((state) => state.appliedMaxPrice);
  const minDistanceKm = useExploreFiltersStore(
    (state) => state.appliedMinDistanceKm,
  );
  const maxDistanceKm = useExploreFiltersStore(
    (state) => state.appliedMaxDistanceKm,
  );
  const userLatitude = useExploreFiltersStore(
    (state) => state.appliedUserLatitude,
  );
  const userLongitude = useExploreFiltersStore(
    (state) => state.appliedUserLongitude,
  );
  const hiddenEventIds = useExploreFiltersStore(
    (state) => state.hiddenEventIds,
  );
  const clearHiddenEvents = useExploreFiltersStore(
    (state) => state.clearHiddenEvents,
  );

  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setError(null);
        }

        const result = await getExploreEventsQuery({
          category,
          dateFrom,
          dateTo,
          minPrice,
          maxPrice,
          minDistanceKm,
          maxDistanceKm,
          userLatitude,
          userLongitude,
          page: pageToLoad,
          pageSize: PAGE_SIZE,
        });

        setHasMore(result.hasMore);

        setEvents((current) => {
          if (!append) return result.events;

          const map = new Map<string, ExploreEvent>();

          for (const item of current) map.set(item.id, item);
          for (const item of result.events) map.set(item.id, item);

          return Array.from(map.values());
        });

        setPage(pageToLoad);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore caricamento eventi explore",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      category,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      minDistanceKm,
      maxDistanceKm,
      userLatitude,
      userLongitude,
    ],
  );

  useEffect(() => {
    clearHiddenEvents();
    setEvents([]);
    setPage(0);
    setHasMore(true);
    void loadPage(0, false);
  }, [
    category,
    dateFrom,
    dateTo,
    minPrice,
    maxPrice,
    minDistanceKm,
    maxDistanceKm,
    userLatitude,
    userLongitude,
    clearHiddenEvents,
    loadPage,
  ]);

  const loadMore = async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    await loadPage(page + 1, true);
  };

  const visibleEvents = useMemo(
    () => events.filter((event) => !hiddenEventIds.includes(event.id)),
    [events, hiddenEventIds],
  );

  return {
    events: visibleEvents,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  };
}
