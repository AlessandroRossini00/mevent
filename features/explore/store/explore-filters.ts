"use client";

import { create } from "zustand";

type ExploreFiltersState = {
  category: string;
  dateFrom: string;
  dateTo: string;
  minPrice: string;
  maxPrice: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  userLatitude: number | null;
  userLongitude: number | null;

  appliedCategory: string;
  appliedDateFrom: string;
  appliedDateTo: string;
  appliedMinPrice: string;
  appliedMaxPrice: string;
  appliedMinDistanceKm: number;
  appliedMaxDistanceKm: number;
  appliedUserLatitude: number | null;
  appliedUserLongitude: number | null;

  isLocating: boolean;
  locationError: string | null;
  hiddenEventIds: string[];

  setCategory: (value: string) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setDistanceRange: (value: [number, number]) => void;
  setUserLocation: (latitude: number, longitude: number) => void;
  setIsLocating: (value: boolean) => void;
  setLocationError: (value: string | null) => void;
  requestUserLocation: () => void;
  applyFilters: () => void;
  hideEvent: (eventId: string) => void;
  resetFilters: () => void;
  clearHiddenEvents: () => void;
};

const DEFAULT_MIN_DISTANCE = 0;
const DEFAULT_MAX_DISTANCE = 100;

export const useExploreFiltersStore = create<ExploreFiltersState>(
  (set, get) => ({
    category: "all",
    dateFrom: "",
    dateTo: "",
    minPrice: "",
    maxPrice: "",
    minDistanceKm: DEFAULT_MIN_DISTANCE,
    maxDistanceKm: DEFAULT_MAX_DISTANCE,
    userLatitude: null,
    userLongitude: null,

    appliedCategory: "all",
    appliedDateFrom: "",
    appliedDateTo: "",
    appliedMinPrice: "",
    appliedMaxPrice: "",
    appliedMinDistanceKm: DEFAULT_MIN_DISTANCE,
    appliedMaxDistanceKm: DEFAULT_MAX_DISTANCE,
    appliedUserLatitude: null,
    appliedUserLongitude: null,

    isLocating: false,
    locationError: null,
    hiddenEventIds: [],

    setCategory: (category) => set({ category }),
    setDateFrom: (dateFrom) => set({ dateFrom }),
    setDateTo: (dateTo) => set({ dateTo }),
    setMinPrice: (minPrice) => set({ minPrice }),
    setMaxPrice: (maxPrice) => set({ maxPrice }),
    setDistanceRange: ([minDistanceKm, maxDistanceKm]) =>
      set({ minDistanceKm, maxDistanceKm }),

    setUserLocation: (userLatitude, userLongitude) =>
      set({
        userLatitude,
        userLongitude,
        locationError: null,
      }),

    setIsLocating: (isLocating) => set({ isLocating }),
    setLocationError: (locationError) => set({ locationError }),

    requestUserLocation: () => {
      if (typeof window === "undefined") {
        set({ locationError: "Geolocalizzazione non disponibile." });
        return;
      }

      if (!window.isSecureContext) {
        set({
          locationError: "La geolocalizzazione richiede localhost o HTTPS.",
        });
        return;
      }

      if (!("geolocation" in navigator)) {
        set({ locationError: "Geolocalizzazione non supportata." });
        return;
      }

      set({ isLocating: true, locationError: null });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            userLatitude: position.coords.latitude,
            userLongitude: position.coords.longitude,
            isLocating: false,
            locationError: null,
          });
        },
        () => {
          set({
            isLocating: false,
            locationError: "Impossibile ottenere la tua posizione.",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    },

    applyFilters: () => {
      const state = get();

      set({
        appliedCategory: state.category,
        appliedDateFrom: state.dateFrom,
        appliedDateTo: state.dateTo,
        appliedMinPrice: state.minPrice,
        appliedMaxPrice: state.maxPrice,
        appliedMinDistanceKm: state.minDistanceKm,
        appliedMaxDistanceKm: state.maxDistanceKm,
        appliedUserLatitude: state.userLatitude,
        appliedUserLongitude: state.userLongitude,
      });
    },

    hideEvent: (eventId) =>
      set((state) => ({
        hiddenEventIds: state.hiddenEventIds.includes(eventId)
          ? state.hiddenEventIds
          : [...state.hiddenEventIds, eventId],
      })),

    resetFilters: () =>
      set({
        category: "all",
        dateFrom: "",
        dateTo: "",
        minPrice: "",
        maxPrice: "",
        minDistanceKm: DEFAULT_MIN_DISTANCE,
        maxDistanceKm: DEFAULT_MAX_DISTANCE,
        userLatitude: null,
        userLongitude: null,

        appliedCategory: "all",
        appliedDateFrom: "",
        appliedDateTo: "",
        appliedMinPrice: "",
        appliedMaxPrice: "",
        appliedMinDistanceKm: DEFAULT_MIN_DISTANCE,
        appliedMaxDistanceKm: DEFAULT_MAX_DISTANCE,
        appliedUserLatitude: null,
        appliedUserLongitude: null,

        isLocating: false,
        locationError: null,
      }),

    clearHiddenEvents: () => set({ hiddenEventIds: [] }),
  }),
);
