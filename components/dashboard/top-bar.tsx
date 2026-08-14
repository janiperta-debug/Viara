import Image from "next/image";
import { Bell } from "lucide-react";

export function TopBar({ notifications = 3 }: { notifications?: number }) {
  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-4 pb-2 md:max-w-2xl md:px-8 md:pt-6 lg:max-w-5xl lg:px-10">
      <Image
        src="/viara-logo.png"
        alt="Viara"
        width={420}
        height={135}
        priority
        className="logo-blend h-auto w-32 md:w-36"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Ilmoitukset, ${notifications} uutta`}
          className="metal-card relative flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Bell className="h-5 w-5 text-foreground" strokeWidth={1.75} />
          {notifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white">
              {notifications}
            </span>
          )}
        </button>
        <span
          className="metal-card flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-foreground"
          aria-label="Käyttäjä JP"
        >
          JP
        </span>
      </div>
    </header>
  );
}
