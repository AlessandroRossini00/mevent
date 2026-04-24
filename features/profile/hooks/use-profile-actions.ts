"use client";

import { useState } from "react";
import { updateProfileAction } from "@/features/profile/services/profile-actions";
import { useProfileStore } from "@/features/profile/store/profile";

export function useProfileActions() {
  const [isPending, setIsPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);

  const updateProfile = async (formData: FormData) => {
    setIsPending(true);
    setActionError(null);

    try {
      const result = await updateProfileAction(formData);

      if (profile) {
        setProfile({
          ...profile,
          username: String(formData.get("username") ?? "").trim() || null,
          full_name: String(formData.get("full_name") ?? "").trim(),
          birth_date: String(formData.get("birth_date") ?? "").trim() || null,
          bio: String(formData.get("bio") ?? "").trim() || null,
          city: String(formData.get("city") ?? "").trim() || null,
          avatar_url: result.avatar_url ?? profile.avatar_url,
        });
      }

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore aggiornamento profilo";
      setActionError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    updateProfile,
    isPending,
    actionError,
  };
}
