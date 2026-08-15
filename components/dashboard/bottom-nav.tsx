"use client";

import Link from "next/link";
import { Home, Map, AlertTriangle, User } from "lucide-react";

type NavKey = "tyo" | "kartta" | "havainnot" | "profiili";

const ITEMS: {
  key: NavKey;
  label: string;
  Icon: typeof Home;
  badge?: number;
  href?: string;
}[] = [
  { key: "tyo", label: "Työ", Icon: Home, href: "/tyo" },
  { key: "kartta", label: "Kartta", Icon: Map, href: "/kartta" },
  {
    key: "havainnot",
    label: "Havainnot",
    Icon: AlertTriangle,
    badge: 3,
    href: "/havainnot",
  },
  { key: "profiili", label: "Profiili", Icon: User },
];

export function BottomNav({ active = "tyo" }: { active?: NavKey }) {
  return (
    <nav
      aria-label="Päänavigaatio"
      className="metal-card sticky bottom-0 z-10 mx-auto flex w-full max-w-md items-stretch justify-around rounded-t-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:max-w-2xl md:px-4 lg:max-w-5xl lg:justify-center lg:gap-4 lg:px-10"
    >
      {ITEMS.map(({ key, label, Icon, badge, href }) => {
        const isActive = key === active;
        const className = `relative flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isActive
            ? "bg-white text-primary shadow-sm"
            : "text-muted active:text-foreground"
        }`;

        const sisalto = (
          <>
            <span className="relative">
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2 : 1.75} />
              {badge ? (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </span>
            {label}
          </>
        );

        // Reitit joilla on sivu -> Link; muut ovat vielä paikanvaraajia.
        if (href) {
          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {sisalto}
            </Link>
          );
        }

        return (
          <button
            key={key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            {sisalto}
          </button>
        );
      })}
    </nav>
  );
}
