"use client";

import { create } from "zustand";
import type { Profile } from "@/features/profile/services/types";

type ProfileState = {
  profile: Profile | null;
  isLoadingProfile: boolean;
  error: string | null;
  setProfile: (profile: Profile | null) => void;
  setLoadingProfile: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearProfileStore: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoadingProfile: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
  setError: (error) => set({ error }),

  clearProfileStore: () =>
    set({
      profile: null,
      isLoadingProfile: false,
      error: null,
    }),
}));
