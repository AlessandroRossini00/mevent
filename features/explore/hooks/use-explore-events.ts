"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getExploreEventsQuery } from "@/features/explore/services/explore-queries";
import { useExploreFiltersStore } from "@/features/explore/store/explore-filters";
import type { ExploreEvent } from "@/features/explore/services/types";

const PAGE_SIZE = 12;
const MAX_DISTANCE_CAP = 100;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

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

        const data = await getExploreEventsQuery({
          category,
          dateFrom,
          dateTo,
          minPrice,
          maxPrice,
          page: pageToLoad,
          pageSize: PAGE_SIZE,
        });

        setHasMore(data.length === PAGE_SIZE);

        setEvents((current) => {
          if (!append) return data;

          const map = new Map<string, ExploreEvent>();

          for (const item of current) map.set(item.id, item);
          for (const item of data) map.set(item.id, item);

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
    [category, dateFrom, dateTo, minPrice, maxPrice],
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
    clearHiddenEvents,
    loadPage,
  ]);

  const loadMore = async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    await loadPage(page + 1, true);
  };

  const filteredEvents = useMemo(() => {
    let nextEvents = events.filter(
      (event) => !hiddenEventIds.includes(event.id),
    );

    const hasDistanceFilter =
      userLatitude !== null &&
      userLongitude !== null &&
      (minDistanceKm > 0 || maxDistanceKm < MAX_DISTANCE_CAP);

    if (hasDistanceFilter) {
      nextEvents = nextEvents.filter((event) => {
        if (event.latitude === null || event.longitude === null) {
          return false;
        }

        const distance = getDistanceKm(
          userLatitude!,
          userLongitude!,
          event.latitude,
          event.longitude,
        );

        const matchesMin = distance >= minDistanceKm;
        const matchesMax =
          maxDistanceKm === MAX_DISTANCE_CAP ? true : distance <= maxDistanceKm;

        return matchesMin && matchesMax;
      });
    }

    return nextEvents;
  }, [
    events,
    hiddenEventIds,
    minDistanceKm,
    maxDistanceKm,
    userLatitude,
    userLongitude,
  ]);

  return {
    events: filteredEvents,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  };
}
