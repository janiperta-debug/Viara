"use client";

import { useState } from "react";

// Visuaalinen fi/en-liukukytkin. Ei vielä kytketty sanakirjoihin/i18n:iin —
// vaihtaa vain paikallista näyttötilaa. Kytketään oikeaan kielenvaihtoon,
// kun sanakirjat tuodaan projektiin.
export function LanguageToggle() {
  const [kieli, setKieli] = useState<"fi" | "en">("fi");

  return (
    <div
      role="group"
      aria-label="Kielivalinta"
      className="metal-card relative inline-flex h-9 items-center rounded-full p-1"
    >
      <span
        className={`absolute top-1 h-7 w-12 rounded-full btn-primary transition-all ${
          kieli === "fi" ? "left-1" : "left-[calc(100%-3.25rem)]"
        }`}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => setKieli("fi")}
        aria-pressed={kieli === "fi"}
        className={`relative z-10 flex h-7 w-12 items-center justify-center text-xs font-semibold transition-colors ${
          kieli === "fi" ? "text-primary-foreground" : "text-muted"
        }`}
      >
        FI
      </button>
      <button
        type="button"
        onClick={() => setKieli("en")}
        aria-pressed={kieli === "en"}
        className={`relative z-10 flex h-7 w-12 items-center justify-center text-xs font-semibold transition-colors ${
          kieli === "en" ? "text-primary-foreground" : "text-muted"
        }`}
      >
        EN
      </button>
    </div>
  );
}
