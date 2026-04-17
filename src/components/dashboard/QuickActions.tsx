const actions = [
  {
    title: "Review high-fit leads",
    note: "5 leads waiting in approval",
  },
  {
    title: "Send 3 pending contracts",
    note: "All PDFs already rendered",
  },
  {
    title: "Verify 2 signed envelopes",
    note: "Ready for archive confirmation",
  },
  {
    title: "Audit unused AI subscriptions",
    note: "Estimated savings: $126/month",
  },
];

export function QuickActions() {
  return (
    <aside className="rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-6 text-slate-50 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
        Action center
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Simple dashboard tasks</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Keep the first version light: this panel shows where interactive widgets
        can later plug in without changing the page composition.
      </p>

      <div className="mt-6 space-y-3">
        {actions.map((action, index) => (
          <article
            key={action.title}
            className="rounded-2xl border border-white/10 bg-white/6 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{action.note}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
