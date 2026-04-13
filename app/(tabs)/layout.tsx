"use client";

import TabsClientLayout from "@/components/layout/tabs-client";
import { useAuthStore } from "@/features/auth/store/auth";
import { useAuth } from "@/features/auth/hook/use-auth";
import { Spinner } from "@radix-ui/themes";

// TODO rivedere questo layout
export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="3" style={{ width: 128, height: 128 }} />
      </div>
    );
  }

  return <TabsClientLayout>{children}</TabsClientLayout>;
}
