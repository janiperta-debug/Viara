"use client";

import { Home, Map, AlertTriangle, User } from "lucide-react";

type NavKey = "tyo" | "kartta" | "havainnot" | "profiili";

const ITEMS: {
  key: NavKey;
  label: string;
  Icon: typeof Home;
  badge?: number;
}[] = [
  { key: "tyo", label: "Työ", Icon: Home },
  { key: "kartta", label: "Kartta", Icon: Map },
  { key: "havainnot", label: "Havainnot", Icon: AlertTriangle, badge: 3 },
  { key: "profiili", label: "Profiili", Icon: User },
];

export function BottomNav({ active = "tyo" }: { active?: NavKey }) {
  return (
    <nav
      aria-label="Päänavigaatio"
      className="metal-card sticky bottom-0 z-10 mx-auto flex w-full max-w-md items-stretch justify-around rounded-t-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:max-w-2xl md:px-4 lg:max-w-5xl lg:justify-center lg:gap-4 lg:px-10"
    >
      {ITEMS.map(({ key, label, Icon, badge }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
              isActive
                ? "bg-white text-primary shadow-sm"
                : "text-muted"
            }`}
          >
            <span className="relative">
              <Icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2 : 1.75}
              />
              {badge ? (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
