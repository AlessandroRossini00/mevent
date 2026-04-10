// src/features/auth/store/auth.ts
import { create } from "zustand";

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthProfile = {
  full_name?: string | null;
  avatar_url?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  isHydrated: boolean;
  setAuth: (payload: {
    user: AuthUser | null;
    profile: AuthProfile | null;
  }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isHydrated: false,
  setAuth: ({ user, profile }) => set({ user, profile, isHydrated: true }),
  clearAuth: () => set({ user: null, profile: null, isHydrated: true }),
}));
