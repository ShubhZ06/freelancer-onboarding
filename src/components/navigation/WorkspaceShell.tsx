import type { ReactNode } from "react";

export function WorkspaceShell({
  children,
  eyebrow = "FOS / Workspace",
  title = "Freelancer Workspace",
  description = "Focused pages for daily operations.",
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="relative neo-card overflow-hidden p-6 sm:p-10">
        {/* Halftone accent — top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 pattern-halftone opacity-40"
        />
        {/* Violet shape — bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 border-4 border-black bg-[#c4b5fd]"
        />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2">
            <span className="neo-tag neo-tag-accent">{eyebrow}</span>
            <span aria-hidden className="h-[3px] w-10 bg-black" />
          </div>
          <h1 className="font-heading max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-black sm:text-xl">
              {description}
            </p>
          ) : null}
        </div>
      </section>
      {children}
    </main>
  );
}
