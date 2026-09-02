"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  TriangleAlert,
  BarChart3,
  Building2,
  Settings,
  Users,
} from "lucide-react";

const ITEMS = [
  { href: "/tyonjohto", label: "Yleiskuva", Icon: LayoutGrid, badge: 0 },
  {
    href: "/tyonjohto/havainnot",
    label: "Havainnot",
    Icon: TriangleAlert,
    badge: 3,
  },
  { href: "/tyonjohto/raportit", label: "Raportit", Icon: BarChart3, badge: 0 },
  {
    href: "/tyonjohto/hoitoalueet",
    label: "Hoitoalueet",
    Icon: Building2,
    badge: 0,
  },
  { href: "/tyonjohto/kayttajat", label: "Käyttäjät", Icon: Users, badge: 0 },
  { href: "/tyonjohto/asetukset", label: "Asetukset", Icon: Settings, badge: 0 },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Työnjohdon päänavigaatio"
      className="sticky bottom-0 z-40 border-t border-border/70 bg-card/85 backdrop-blur-md"
    >
      <ul className="mx-auto flex w-full max-w-[1920px] items-stretch justify-center gap-1 px-4 py-2 sm:gap-2">
        {ITEMS.map(({ href, label, Icon, badge }) => {
          // Yleiskuva on tarkka; muut aktivoituvat myös alisivuilla.
          const isActive =
            href === "/tyonjohto"
              ? pathname === "/tyonjohto"
              : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
