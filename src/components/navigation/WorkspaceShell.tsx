import type { ReactNode } from "react";

export function WorkspaceShell({
  children,
  eyebrow = "FlowDesk / Workspace",
  title = "FlowDesk Workspace",
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
          className="pointer-events-none absolute -bottom-10 -left-10 hidden h-24 w-24 border-4 border-black bg-[#c4b5fd] md:block"
        />

        <div className="relative z-10 flex flex-col gap-4 px-2 pl-4 sm:px-4 sm:pl-6 md:px-6 md:pl-8">
          <div className="inline-flex w-fit items-center gap-2">
            <span className="neo-tag neo-tag-accent">{eyebrow}</span>
            <span aria-hidden className="h-[3px] w-10 bg-black" />
          </div>
          <h1 className="font-heading max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-base font-bold leading-relaxed text-black sm:text-lg md:text-xl">
              {description}
            </p>
          ) : null}
        </div>
      </section>
      {children}
    </main>
  );
}
