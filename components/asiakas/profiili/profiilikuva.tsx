"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";
import { lataaProfiilikuva } from "@/app/actions/profiili-kuva";

export function Profiilikuva({ nimi, initiaalit, avatarUrl }: { nimi: string; initiaalit: string; avatarUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={lataaProfiilikuva} className="shrink-0">
      <input
        ref={inputRef}
        type="file"
        name="kuva"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.[0]) event.currentTarget.form?.requestSubmit();
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary text-xl font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={avatarUrl ? `Vaihda käyttäjän ${nimi} profiilikuva` : `Lisää käyttäjälle ${nimi} profiilikuva`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span>{initiaalit}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" aria-hidden />
        </span>
      </button>
    </form>
  );
}
