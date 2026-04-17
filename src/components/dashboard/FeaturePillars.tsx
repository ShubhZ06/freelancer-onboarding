import Link from "next/link";

const pillars = [
  {
    id: "F3",
    title: "Lead Acquisition Engine",
    description:
      "Normalize inbound prospects, score fit, draft personalized outreach, and hold everything in an approval queue before anything gets sent.",
    accent: "from-amber-200 via-orange-100 to-white",
    href: "/acquisition",
  },
  {
    id: "F1",
    title: "Smart Contract Generator",
    description:
      "Assemble attorney-reviewed templates with profile defaults, project variables, optional clauses, and a plain-English summary.",
    accent: "from-emerald-200 via-teal-100 to-white",
    href: "/contracts",
  },
  {
    id: "F2",
    title: "Secure e-Signature Routing",
    description:
      "Route single-use signing links, capture evidence, countersign automatically, and archive signed files with verifiable hashes.",
    accent: "from-sky-200 via-cyan-100 to-white",
    href: "/signing",
  },
  {
    id: "F4",
    title: "AI Expense Dashboard",
    description:
      "Track recurring tools, categorize spend, alert on budget thresholds, and highlight subscriptions that are no longer delivering value.",
    accent: "from-violet-200 via-fuchsia-100 to-white",
    href: "/expenses",
  },
];

export function FeaturePillars() {
  return (
    <section className="border-4 border-black bg-white p-6 swiss-dots">
      <div className="mb-5 flex flex-col gap-3 border-b-2 border-black pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-swiss-accent">
            02. METHOD
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter text-black sm:text-3xl">
            Architecture-aligned feature cards
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-black/70">
          Each feature can become its own module while the page stays composed
          from reusable dashboard components.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => (
          <Link
            key={pillar.id}
            href={pillar.href}
            className="group block transition-transform duration-150 hover:-translate-y-1"
          >
            <article
                className="flex h-full flex-col justify-between border-2 border-black bg-white p-5 transition-colors duration-150 group-hover:bg-black group-hover:text-white"
            >
              <div className="flex items-center justify-between gap-3">
                  <span className="border-2 border-black bg-swiss-muted px-3 py-1 text-xs font-black tracking-[0.24em] text-black group-hover:border-white group-hover:bg-transparent group-hover:text-white">
                  {pillar.id}
                </span>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-black/50 group-hover:text-white/60">
                    v1 foundation
                </span>
              </div>
                <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-black group-hover:text-white">
                {pillar.title}
              </h3>
                <p className="mt-3 text-sm leading-6 text-black/70 group-hover:text-white/75">
                {pillar.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
