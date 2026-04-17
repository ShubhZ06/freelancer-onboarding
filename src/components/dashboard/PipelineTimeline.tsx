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
    <section className="border-4 border-black bg-white p-6 swiss-diagonal">
      <div className="flex flex-col gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-swiss-accent">
            03. FLOW
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter text-black sm:text-3xl">
            From lead capture to signed delivery
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-black/70">
          This timeline mirrors the architecture so each stage can later map to
          its own domain service, queue, and data model.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {timeline.map((item, index) => (
          <article
            key={item.step}
            className="border-2 border-black bg-white p-5"
          >
            <span className="text-xs font-black uppercase tracking-[0.24em] text-swiss-accent">
              Step 0{index + 1}
            </span>
            <h3 className="mt-3 text-lg font-black uppercase tracking-tight text-black">
              {item.step}
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/70">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
