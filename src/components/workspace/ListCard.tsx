export function ListCard({
  title,
  items,
  tone = "white",
}: {
  title: string;
  items: string[];
  tone?: "white" | "yellow" | "violet" | "accent";
}) {
  const toneBg = {
    white: "bg-white",
    yellow: "bg-[#ffd93d]",
    violet: "bg-[#c4b5fd]",
    accent: "bg-[#ff6b6b]",
  }[tone];

  return (
    <article className="border-4 border-black bg-white neo-shadow-md">
      <header className={`flex items-center justify-between border-b-4 border-black ${toneBg} px-5 py-4`}>
        <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-black">
          {title}
        </h3>
        <span className="neo-pill neo-tag-dark">{items.length.toString().padStart(2, "0")}</span>
      </header>
      <ol className="divide-y-[3px] divide-black">
        {items.map((item, idx) => (
          <li
            key={item}
            className="flex items-start gap-4 px-5 py-4 transition-colors duration-100 hover:bg-[#fffdf5]"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-black bg-[#ffd93d] font-heading text-sm font-black">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <p className="text-base font-bold leading-snug text-black">{item}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
