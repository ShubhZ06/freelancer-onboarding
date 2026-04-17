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
    <aside className="border-4 border-black bg-black p-6 text-white">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
        Action center
      </p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">Simple dashboard tasks</h2>
      <p className="mt-2 text-sm leading-6 text-white/70">
        Keep the first version light: this panel shows where interactive widgets
        can later plug in without changing the page composition.
      </p>

      <div className="mt-6 space-y-3">
        {actions.map((action, index) => (
          <article
            key={action.title}
            className="group border-2 border-white bg-black p-4 transition-colors duration-150 hover:bg-swiss-accent hover:text-black"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-white bg-white text-sm font-black text-black">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white group-hover:text-black">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-white/70 group-hover:text-black/70">{action.note}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
