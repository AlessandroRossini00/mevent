"use client";

import { create } from "zustand";
import type { CreatedEvent, Profile } from "@/features/profile/services/types";

type ProfileState = {
  profile: Profile | null;
  createdEvents: CreatedEvent[];
  isLoadingProfile: boolean;
  isLoadingCreatedEvents: boolean;
  error: string | null;
  setProfile: (profile: Profile | null) => void;
  setCreatedEvents: (events: CreatedEvent[]) => void;
  upsertCreatedEvent: (event: CreatedEvent) => void;
  removeCreatedEvent: (eventId: string) => void;
  setLoadingProfile: (value: boolean) => void;
  setLoadingCreatedEvents: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearProfileStore: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  createdEvents: [],
  isLoadingProfile: false,
  isLoadingCreatedEvents: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  setCreatedEvents: (createdEvents) => set({ createdEvents }),
  upsertCreatedEvent: (event) =>
    set((state) => ({
      createdEvents: state.createdEvents.some((item) => item.id === event.id)
        ? state.createdEvents.map((item) =>
            item.id === event.id ? event : item,
          )
        : [event, ...state.createdEvents],
    })),
  removeCreatedEvent: (eventId) =>
    set((state) => ({
      createdEvents: state.createdEvents.filter((item) => item.id !== eventId),
    })),
  setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
  setLoadingCreatedEvents: (isLoadingCreatedEvents) =>
    set({ isLoadingCreatedEvents }),
  setError: (error) => set({ error }),
  clearProfileStore: () =>
    set({
      profile: null,
      createdEvents: [],
      isLoadingProfile: false,
      isLoadingCreatedEvents: false,
      error: null,
    }),
}));
