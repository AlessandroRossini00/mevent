"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

const tabs = [
  {
    href: "/events",
    label: "Events",
    icon: CalendarIcon,
  },
  {
    href: "/explore",
    label: "Explore",
    icon: MagnifyingGlassIcon,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: PersonIcon,
  },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 72 }}>
      <main>{children}</main>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #e5e5e5",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 50,
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
                fontWeight: active ? 700 : 500,
                color: active ? "#2563eb" : "#6b7280",
                transition: "color 0.2s ease",
              }}
            >
              <Icon width={20} height={20} />
              <span style={{ fontSize: 12, lineHeight: 1 }}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
