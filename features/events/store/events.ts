"use client";

import { create } from "zustand";
import type {
  EventWithRelations,
  JoinedEvent,
} from "@/features/events/services/types";

type EventsState = {
  joinedEvents: JoinedEvent[];
  currentEvent: EventWithRelations | null;
  isLoadingJoinedEvents: boolean;
  isLoadingCurrentEvent: boolean;
  error: string | null;
  setJoinedEvents: (events: JoinedEvent[]) => void;
  setCurrentEvent: (event: EventWithRelations | null) => void;
  upsertJoinedEvent: (event: JoinedEvent) => void;
  removeJoinedEvent: (eventId: string) => void;
  setLoadingJoinedEvents: (value: boolean) => void;
  setLoadingCurrentEvent: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearEventsStore: () => void;
};

export const useEventsStore = create<EventsState>((set) => ({
  joinedEvents: [],
  currentEvent: null,
  isLoadingJoinedEvents: false,
  isLoadingCurrentEvent: false,
  error: null,
  setJoinedEvents: (joinedEvents) => set({ joinedEvents }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  upsertJoinedEvent: (event) =>
    set((state) => ({
      joinedEvents: state.joinedEvents.some((item) => item.id === event.id)
        ? state.joinedEvents.map((item) =>
            item.id === event.id ? event : item,
          )
        : [event, ...state.joinedEvents],
      currentEvent:
        state.currentEvent?.id === event.id ? event : state.currentEvent,
    })),
  removeJoinedEvent: (eventId) =>
    set((state) => ({
      joinedEvents: state.joinedEvents.filter((item) => item.id !== eventId),
      currentEvent:
        state.currentEvent?.id === eventId ? null : state.currentEvent,
    })),
  setLoadingJoinedEvents: (isLoadingJoinedEvents) =>
    set({ isLoadingJoinedEvents }),
  setLoadingCurrentEvent: (isLoadingCurrentEvent) =>
    set({ isLoadingCurrentEvent }),
  setError: (error) => set({ error }),
  clearEventsStore: () =>
    set({
      joinedEvents: [],
      currentEvent: null,
      isLoadingJoinedEvents: false,
      isLoadingCurrentEvent: false,
      error: null,
    }),
}));
