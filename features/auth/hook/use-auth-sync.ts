"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store/auth";

// Serve per sincronizzare db supabase con zustand
export function useAuthSync() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const supabase = createClient();

    const syncAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;

      if (!currentUser) {
        clearAuth();
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        clearAuth();
        return;
      }

      setAuth({
        user: {
          id: currentUser.id,
          email: currentUser.email,
        },
        profile: profile ?? null,
      });
    };

    void syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);
}
