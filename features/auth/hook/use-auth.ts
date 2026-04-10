"use client";

import { useAuthStore } from "@/features/auth/store/auth";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  return {
    user,
    profile,
    isHydrated,
    isAuthenticated: !!user,
  };
}
