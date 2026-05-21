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

        // Se il componente è già stato smontato evitiamo di aggiornare lo store
        // con il risultato di una richiesta ormai non più rilevante.
        if (!active) return;

        setProfile(data);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Errore caricamento profilo",
        );
      } finally {
        // Manteniamo la stessa protezione anche nel finally,
        // così non modifichiamo lo stato dopo l'unmount.
        if (active) setLoadingProfile(false);
      }
    };

    void run();

    return () => {
      // Segniamo l'effect come inattivo per ignorare eventuali risposte tardive.
      active = false;
    };
  }, [setProfile, setLoadingProfile, setError]);

  return { profile, isLoading, error };
}
