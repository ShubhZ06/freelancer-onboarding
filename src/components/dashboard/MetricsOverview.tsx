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
          className="border-4 border-black bg-white p-5 transition-colors duration-150 hover:bg-swiss-accent hover:text-black"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-black/60">{metric.label}</p>
          <p className="mt-3 text-4xl font-black tracking-tighter text-black">
            {metric.value}
          </p>
          <p className="mt-2 text-sm leading-6 text-black/70">{metric.helper}</p>
        </article>
      ))}
    </section>
  );
}
