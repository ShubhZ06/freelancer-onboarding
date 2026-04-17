export function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="border-2 border-black bg-white p-5">
      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-black">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <p
            key={item}
            className="border-2 border-black bg-swiss-muted px-4 py-3 text-sm leading-6 text-black"
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
