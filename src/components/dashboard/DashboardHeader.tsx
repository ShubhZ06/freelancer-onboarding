const highlights = [
  "Contracts generated in under 10 minutes",
  "Approval-first outreach workflow",
  "Native signing with verifiable audit trail",
];

export function DashboardHeader() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(248,244,236,0.92)_40%,_rgba(234,239,244,0.9)_100%)] p-6 shadow-[0_24px_80px_rgba(26,32,44,0.08)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-5">
          <span className="inline-flex w-fit items-center rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
            Freelancer Operating System
          </span>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Run acquisition, contracts, signing, and AI overhead from one
              clean operating dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This starter dashboard follows the project architecture: a
              component-first Next.js interface that can grow feature by feature
              without crowding the main page file.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-5 text-slate-50 shadow-inner">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Today&apos;s view
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Signed-revenue pipeline
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatCard label="Qualified leads" value="24" detail="+6 this week" />
            <StatCard label="Contracts pending" value="8" detail="3 ready to send" />
            <StatCard label="Monthly AI burn" value="$842" detail="79% of budget" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-emerald-300">{detail}</p>
    </div>
  );
}
