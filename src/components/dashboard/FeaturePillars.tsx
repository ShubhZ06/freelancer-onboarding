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
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Product pillars
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Architecture-aligned feature cards
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Each feature can become its own module while the page stays composed
          from reusable dashboard components.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => (
          <Link
            key={pillar.id}
            href={pillar.href}
            className={`group block transition-transform duration-300 hover:-translate-y-1`}
          >
            <article
              className={`h-full rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-br ${pillar.accent} p-5 shadow-sm transition-shadow duration-300 group-hover:shadow-md`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white">
                  {pillar.id}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  v1 foundation
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {pillar.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
