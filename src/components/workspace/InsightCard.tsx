const TONES = {
  accent: "bg-[#ff6b6b]",
  yellow: "bg-[#ffd93d]",
  violet: "bg-[#c4b5fd]",
  white: "bg-white",
} as const;

type Tone = keyof typeof TONES;

export function InsightCard({
  label,
  value,
  detail,
  tone = "yellow",
  tilt = "right",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
  tilt?: "left" | "right" | "none";
}) {
  const tilted = tilt === "left" ? "-rotate-1" : tilt === "right" ? "rotate-1" : "";
  return (
    <article
      className={`group relative border-4 border-black ${TONES[tone]} p-6 neo-shadow-md transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#000] ${tilted} hover:rotate-0`}
    >
      <span className="neo-tag neo-tag-dark mb-4">{label}</span>
      <p className="font-heading text-5xl font-black uppercase leading-none tracking-tighter text-black sm:text-6xl">
        {value}
      </p>
      <p className="mt-4 border-t-[3px] border-black pt-3 text-base font-bold leading-snug text-black">
        {detail}
      </p>
    </article>
  );
}
