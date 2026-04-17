import type { ReactNode } from "react";
import { AppNav } from "./AppNav";

export function WorkspaceShell({
  children,
  eyebrow = "FOS Workspace",
  title = "Command center for the whole freelancer lifecycle",
  description = "Dedicated pages keep each workflow focused while still feeling like one connected operating system.",
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden border-4 border-black bg-white p-5 sm:p-6 lg:p-8 swiss-grid-pattern">
        <div className="absolute inset-x-0 top-0 h-2 bg-black" />
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-8">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-swiss-accent">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-black uppercase tracking-tighter text-black sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/70 sm:text-base">
              {description}
            </p>
          </div>
          <div className="lg:self-start">
            <AppNav />
          </div>
        </div>
      </section>
      {children}
    </main>
  );
}
