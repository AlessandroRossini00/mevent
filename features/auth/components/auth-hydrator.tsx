// Generato con AI
"use client";

import { useEffect } from "react";
import {
  useAuthStore,
  type AuthProfile,
  type AuthUser,
} from "@/features/auth/store/auth";

type AuthHydratorProps = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  children: React.ReactNode;
};

//
/**
 * Serve a sincronizzare i dati auth server con store client (Zustand).
 * @param param0
 * @returns
 */
export default function AuthHydrator({
  user,
  profile,
  children,
}: AuthHydratorProps) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    setAuth({ user, profile });
  }, [user, profile, setAuth]);

  return <>{children}</>;
}
