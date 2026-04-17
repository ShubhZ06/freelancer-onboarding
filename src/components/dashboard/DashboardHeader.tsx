const highlights = [
  "Contracts generated in under 10 minutes",
  "Approval-first outreach workflow",
  "Native signing with verifiable audit trail",
];

export function DashboardHeader() {
  return (
    <section className="overflow-hidden border-4 border-black bg-white p-5 sm:p-6 lg:p-8 swiss-grid-pattern">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
        <div className="space-y-6">
          <span className="inline-flex w-fit items-center border-2 border-black bg-swiss-accent px-3 py-1 text-xs font-black uppercase tracking-[0.32em] text-black">
            01. SYSTEM
          </span>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-3xl font-black uppercase tracking-tighter text-black sm:text-4xl lg:text-5xl lg:leading-tight">
              Run acquisition, contracts, signing, and AI overhead from one
              clean operating dashboard.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-black/70 sm:text-base">
              This starter dashboard follows the project architecture: a
              component-first Next.js interface that can grow feature by feature
              without crowding the main page file.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-4 border-black bg-black p-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Today&apos;s view
            </p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">
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
    <div className="border-2 border-white bg-black p-4">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tighter text-white">{value}</p>
      <p className="mt-1 text-sm text-white/70">{detail}</p>
    </div>
  );
}
