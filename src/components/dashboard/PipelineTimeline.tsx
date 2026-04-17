const timeline = [
  {
    step: "Acquire",
    detail: "Sources sync leads into a normalized pipeline.",
  },
  {
    step: "Qualify",
    detail: "AI summarizes needs, scores fit, and drafts outreach.",
  },
  {
    step: "Contract",
    detail: "Approved opportunities become contract-ready workspaces.",
  },
  {
    step: "Sign",
    detail: "Single-use links capture signatures and archive proof.",
  },
  {
    step: "Optimize",
    detail: "Expense tracking keeps the operating stack healthy.",
  },
];

export function PipelineTimeline() {
  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Operating flow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            From lead capture to signed delivery
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          This timeline mirrors the architecture so each stage can later map to
          its own domain service, queue, and data model.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {timeline.map((item, index) => (
          <article
            key={item.step}
            className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-5"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Step 0{index + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {item.step}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
