"use client";

import { create } from "zustand";
import type {
  CreatedEvent,
  EventWithRelations,
  JoinedEvent,
} from "@/features/events/services/types";

type EventsState = {
  joinedEvents: JoinedEvent[];
  createdEvents: CreatedEvent[];
  currentEvent: EventWithRelations | null;

  isLoadingJoinedEvents: boolean;
  isLoadingCreatedEvents: boolean;
  isLoadingCurrentEvent: boolean;

  error: string | null;

  setJoinedEvents: (events: JoinedEvent[]) => void;
  setCreatedEvents: (events: CreatedEvent[]) => void;
  setCurrentEvent: (event: EventWithRelations | null) => void;

  upsertJoinedEvent: (event: JoinedEvent) => void;
  upsertCreatedEvent: (event: CreatedEvent) => void;

  removeJoinedEvent: (eventId: string) => void;
  removeCreatedEvent: (eventId: string) => void;
  removeEvent: (eventId: string) => void;

  setLoadingJoinedEvents: (value: boolean) => void;
  setLoadingCreatedEvents: (value: boolean) => void;
  setLoadingCurrentEvent: (value: boolean) => void;

  setError: (value: string | null) => void;
  clearEventsStore: () => void;
};

export const useEventsStore = create<EventsState>((set) => ({
  // Manteniamo liste separate per eventi creati e joined,
  // oltre all'evento aperto nel dettaglio, così la UI può aggiornare
  // ogni contesto senza dover rifetchare tutto ogni volta.
  joinedEvents: [],
  createdEvents: [],
  currentEvent: null,

  isLoadingJoinedEvents: false,
  isLoadingCreatedEvents: false,
  isLoadingCurrentEvent: false,

  error: null,

  setJoinedEvents: (joinedEvents) => set({ joinedEvents }),
  setCreatedEvents: (createdEvents) => set({ createdEvents }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),

  upsertJoinedEvent: (event) =>
    set((state) => ({
      // Se l'evento esiste già nella lista lo aggiorniamo,
      // altrimenti lo inseriamo in testa per riflettere subito
      // il nuovo stato nella UI.
      joinedEvents: state.joinedEvents.some((item) => item.id === event.id)
        ? state.joinedEvents.map((item) =>
            item.id === event.id ? event : item,
          )
        : [event, ...state.joinedEvents],

      // Se l'evento aperto nel dettaglio è lo stesso, lo riallineiamo
      // con i dati appena aggiornati.
      currentEvent:
        state.currentEvent?.id === event.id ? event : state.currentEvent,
    })),

  upsertCreatedEvent: (event) =>
    set((state) => ({
      createdEvents: state.createdEvents.some((item) => item.id === event.id)
        ? state.createdEvents.map((item) =>
            item.id === event.id ? event : item,
          )
        : [event, ...state.createdEvents],
      currentEvent:
        state.currentEvent?.id === event.id ? event : state.currentEvent,
    })),

  removeJoinedEvent: (eventId) =>
    set((state) => ({
      joinedEvents: state.joinedEvents.filter((item) => item.id !== eventId),
      currentEvent:
        state.currentEvent?.id === eventId ? null : state.currentEvent,
    })),

  removeCreatedEvent: (eventId) =>
    set((state) => ({
      createdEvents: state.createdEvents.filter((item) => item.id !== eventId),
      currentEvent:
        state.currentEvent?.id === eventId ? null : state.currentEvent,
    })),

  removeEvent: (eventId) =>
    set((state) => ({
      // Questo helper rimuove l'evento da entrambi i contesti,
      // utile quando non ci interessa distinguere se fosse creato o joined.
      joinedEvents: state.joinedEvents.filter((item) => item.id !== eventId),
      createdEvents: state.createdEvents.filter((item) => item.id !== eventId),
      currentEvent:
        state.currentEvent?.id === eventId ? null : state.currentEvent,
    })),

  setLoadingJoinedEvents: (isLoadingJoinedEvents) =>
    set({ isLoadingJoinedEvents }),

  setLoadingCreatedEvents: (isLoadingCreatedEvents) =>
    set({ isLoadingCreatedEvents }),

  setLoadingCurrentEvent: (isLoadingCurrentEvent) =>
    set({ isLoadingCurrentEvent }),

  setError: (error) => set({ error }),

  clearEventsStore: () =>
    // Reset completo usato quando vogliamo invalidare tutti i dati evento,
    // ad esempio dopo logout o quando cambiamo completamente contesto utente.
    set({
      joinedEvents: [],
      createdEvents: [],
      currentEvent: null,
      isLoadingJoinedEvents: false,
      isLoadingCreatedEvents: false,
      isLoadingCurrentEvent: false,
      error: null,
    }),
}));
