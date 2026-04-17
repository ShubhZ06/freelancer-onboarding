const metrics = [
  {
    label: "Lead fit score",
    value: "91",
    helper: "Top incoming opportunity from Upwork",
  },
  {
    label: "Contract turnaround",
    value: "11m",
    helper: "Average from approval to send",
  },
  {
    label: "Signature completion",
    value: "68%",
    helper: "Viewed within 48 hours",
  },
  {
    label: "Unused tools flagged",
    value: "4",
    helper: "Potential savings next month",
  },
];

export function MetricsOverview() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {metric.value}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{metric.helper}</p>
        </article>
      ))}
    </section>
  );
}
