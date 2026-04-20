"use client";

import { create } from "zustand";
import type { ExploreEvent } from "@/features/explore/services/types";

type ExploreState = {
  events: ExploreEvent[];
  isLoading: boolean;
  error: string | null;
  search: string;
  category: string;
  setEvents: (events: ExploreEvent[]) => void;
  removeEvent: (eventId: string) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  clearExploreStore: () => void;
};

export const useExploreStore = create<ExploreState>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  search: "",
  category: "all",
  setEvents: (events) => set({ events }),
  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  clearExploreStore: () =>
    set({
      events: [],
      isLoading: false,
      error: null,
      search: "",
      category: "all",
    }),
}));
