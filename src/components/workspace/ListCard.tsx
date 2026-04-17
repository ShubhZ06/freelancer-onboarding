export function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <p
            key={item}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
