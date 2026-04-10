// Generato con AI
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  // Aggiunto color nel style della componente Link
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 64 }}>
      <main>{children}</main>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <Link
          href="/events"
          style={{
            fontWeight: isActive("/events") ? 700 : 400,
            color: isActive("/events") ? "blue" : "grey",
          }}
        >
          Events
        </Link>
        <Link
          href="/explore"
          style={{
            fontWeight: isActive("/explore") ? 700 : 400,
            color: isActive("/explore") ? "blue" : "grey",
          }}
        >
          Explore
        </Link>
        <Link
          href="/profile"
          style={{
            fontWeight: isActive("/profile") ? 700 : 400,
            color: isActive("/profile") ? "blue" : "grey",
          }}
        >
          Profile
        </Link>
      </nav>
    </div>
  );
}
