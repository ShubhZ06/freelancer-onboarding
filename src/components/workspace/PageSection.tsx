import type { ReactNode } from "react";

export function PageSection({
  title,
  description,
  children,
  tone = "cream",
  eyebrow = "Section",
}: {
  title: string;
  description: string;
  children: ReactNode;
  tone?: "cream" | "yellow" | "violet" | "white";
  eyebrow?: string;
}) {
  const toneBg = {
    cream: "bg-[#fffdf5]",
    yellow: "bg-[#ffd93d]",
    violet: "bg-[#c4b5fd]",
    white: "bg-white",
  }[tone];

  return (
    <section className={`relative border-4 border-black ${toneBg} neo-shadow-md`}>
      <div className="border-b-4 border-black bg-black px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 bg-[#ff6b6b]" aria-hidden />
          <span className="font-heading text-xs font-black uppercase tracking-[0.3em] text-[#ffd93d]">
            {eyebrow}
          </span>
        </div>
        <h2 className="font-heading mt-2 text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-base font-bold leading-snug text-white/90 sm:text-lg">
          {description}
        </p>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}
