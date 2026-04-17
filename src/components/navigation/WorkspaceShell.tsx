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
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {description}
            </p>
          </div>
          <AppNav />
        </div>
      </section>
      {children}
    </main>
  );
}
