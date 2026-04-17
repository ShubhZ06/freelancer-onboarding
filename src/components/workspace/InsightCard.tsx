export function InsightCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="group border-2 border-black bg-swiss-muted p-5 transition-colors duration-150 hover:bg-black hover:text-white">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-black/60 group-hover:text-white">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tighter text-black transition-colors duration-150 group-hover:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-black/70 transition-colors duration-150 group-hover:text-white/80">{detail}</p>
    </article>
  );
}
