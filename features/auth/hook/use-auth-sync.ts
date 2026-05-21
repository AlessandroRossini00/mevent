"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store/auth";

// Mantiene allineato lo stato auth locale con la sessione Supabase
// e con i dati base del profilo utente.
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

      // Se la sessione esiste ma il profilo non è leggibile,
      // svuotiamo comunque lo store per non lasciare uno stato auth incoerente.
      if (error) {
        clearAuth();
        return;
      }

      // Nello store salviamo solo i dati minimi necessari alla UI globale:
      // identità utente e informazioni base del profilo.
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
      // Ogni cambio di sessione Supabase viene riflesso subito nello store Zustand.
      void syncAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);
}
