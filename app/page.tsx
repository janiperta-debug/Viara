import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-white px-6 py-20">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <Image
          src="/viara-logo.png"
          alt="Viara logo"
          width={280}
          height={90}
          priority
          className="h-auto w-56 sm:w-64"
        />

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 text-balance sm:text-5xl">
            Viara
          </h1>
          <p className="text-lg font-medium text-slate-600 sm:text-xl">
            Operational Maintenance Platform
          </p>
        </div>

        <p className="max-w-md text-base leading-relaxed text-slate-500 text-pretty">
          Viara helps organizations transform complex maintenance workflows into
          clear digital operations.
        </p>

        <div className="flex w-full flex-col items-center gap-4 pt-2 sm:w-auto sm:flex-row">
          <a
            href="#"
            className="flex h-12 w-full min-w-[160px] items-center justify-center rounded-full bg-emerald-600 px-8 text-base font-medium text-white transition-colors hover:bg-emerald-700 sm:w-auto"
          >
            Open Demo
          </a>
          <a
            href="#"
            className="flex h-12 w-full min-w-[160px] items-center justify-center rounded-full border border-slate-300 px-8 text-base font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}
