import type { ReactNode } from "react";

export function PageSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-4 border-black bg-white p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-swiss-accent">
            Section
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter text-black sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
