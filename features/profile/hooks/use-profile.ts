"use client";

import { useEffect } from "react";
import { getMyProfileQuery } from "@/features/profile/services/profile-queries";
import { useProfileStore } from "@/features/profile/store/profile";

export function useProfile() {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoadingProfile);
  const error = useProfileStore((state) => state.error);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLoadingProfile = useProfileStore((state) => state.setLoadingProfile);
  const setError = useProfileStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoadingProfile(true);
        setError(null);
        const data = await getMyProfileQuery();
        if (!active) return;
        setProfile(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Errore caricamento profilo",
        );
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [setProfile, setLoadingProfile, setError]);

  return { profile, isLoading, error };
}
