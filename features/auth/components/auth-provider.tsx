"use client";

import { useAuthSync } from "@/features/auth/hook/use-auth-sync";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  return <>{children}</>;
}
