import Link from "next/link";

const modules = [
  { label: "Dashboard", tone: "bg-[#ff6b6b]" },
  { label: "Find Clients", tone: "bg-[#ffd93d]" },
  { label: "Client Communication", tone: "bg-[#c4b5fd]" },
  { label: "Contract Generator", tone: "bg-[#ff6b6b]" },
  { label: "Settings", tone: "bg-[#ffd93d]" },
];

const productStories = [
  {
    persona: "Solo Designer",
    challenge: "Losing 3–4 hours/week switching tabs and rewriting updates.",
    outcome: "Runs leads, contracts, and client updates in one flow. Ships faster.",
    tone: "bg-[#ff6b6b]",
    tilt: "-rotate-2",
  },
  {
    persona: "Fractional Marketer",
    challenge: "Client confidence drops when updates are delayed.",
    outcome: "Sends progress reports and warning nudges on schedule, every week.",
    tone: "bg-[#ffd93d]",
    tilt: "rotate-1",
  },
  {
    persona: "Dev Consultant",
    challenge: "Project paperwork and signatures stall project starts.",
    outcome: "Generates contracts, tracks signing, starts billable work sooner.",
    tone: "bg-[#c4b5fd]",
    tilt: "-rotate-1",
  },
];

const features = [
  { num: "01", title: "Leads That Qualify Themselves", body: "Intent-aware filters cut pitching time in half." },
  { num: "02", title: "Contracts in Under 2 Minutes", body: "Legally sound drafts, three styles, zero lawyer." },
  { num: "03", title: "Client Updates, On Rails", body: "Status reports & warning pings without rewriting." },
  { num: "04", title: "One Dashboard, All Workflows", body: "See everything at a glance — leads, contracts, comms." },
];

const marqueePhrases = [
  "Run Client Work Without The Chaos",
  "Anti-Corporate",
  "Built For Freelancers",
  "No More Tab Hell",
  "Stop Switching Tools",
  "Ship The Work",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ===== LANDING NAV ===== */}
      <header className="sticky top-0 z-40 border-b-4 border-black bg-[#fffdf5]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 border-4 border-black bg-[#ff6b6b] px-3 py-2 neo-shadow-sm">
            <span className="font-heading text-lg uppercase tracking-tight text-black sm:text-xl">
              Freelancer/OS
            </span>
            <span aria-hidden className="inline-block h-2 w-2 bg-black" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex neo-pill neo-tag-yellow animate-wiggle">
              Beta · v0.1
            </span>
            <Link href="/sign-in" className="neo-btn neo-btn-dark text-xs">
              Sign In
            </Link>
            <Link href="/sign-up" className="neo-btn neo-btn-primary text-xs">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b-4 border-black bg-[#fffdf5]">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-grid opacity-50" />

        {/* Floating shapes */}
        <div aria-hidden className="pointer-events-none absolute right-8 top-24 hidden h-20 w-20 rotate-12 border-4 border-black bg-[#ffd93d] neo-shadow-sm md:block" />
        <div aria-hidden className="pointer-events-none absolute bottom-28 left-12 hidden h-14 w-14 -rotate-12 rounded-full border-4 border-black bg-[#c4b5fd] md:block" />
        <div aria-hidden className="pointer-events-none absolute right-[15%] bottom-16 hidden h-10 w-10 rotate-45 border-4 border-black bg-[#ff6b6b] lg:block" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:py-32">
          {/* Left column — headline */}
          <div className="flex flex-col justify-center gap-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="neo-tag neo-tag-accent animate-wiggle">
                ★ v0.1 · Now Live
              </span>
              <span className="neo-tag">For Freelancers</span>
            </div>

            <h1 className="font-heading text-5xl font-black uppercase leading-[0.9] tracking-tighter text-black sm:text-7xl lg:text-8xl xl:text-9xl">
              <span className="inline-block -rotate-1">Run</span>{" "}
              <span className="inline-block bg-[#ff6b6b] px-3 py-1 text-shadow-hard text-white">
                client
              </span>
              <br />
              <span className="inline-block">work</span>{" "}
              <span className="text-stroke">without</span>
              <br />
              <span className="inline-block rotate-1 bg-[#ffd93d] px-3 py-1">
                the chaos.
              </span>
            </h1>

            <p className="max-w-xl text-xl font-bold leading-snug text-black sm:text-2xl">
              Leads → Contracts → Updates → Done.
              <br />
              One loud operating system. Zero corporate nonsense.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="neo-btn neo-btn-primary px-8 py-5 text-base">
                Start Free →
              </Link>
              <Link href="/sign-in" className="neo-btn neo-btn-ghost border-[3px] px-8 py-5 text-base">
                Sign In
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-4 border-t-4 border-black pt-6">
              <div className="flex -space-x-2">
                {["#ff6b6b", "#ffd93d", "#c4b5fd", "#000"].map((c, i) => (
                  <span
                    key={c}
                    className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-black font-heading text-xs font-black"
                    style={{ background: c, color: c === "#000" ? "#ffd93d" : "#000", zIndex: 4 - i }}
                  >
                    {["A", "M", "K", "S"][i]}
                  </span>
                ))}
              </div>
              <div>
                <p className="font-heading text-xl font-black uppercase tracking-tight text-black">
                  1,200+ freelancers
                </p>
                <p className="text-sm font-bold text-black">shipping client work without the tab hell.</p>
              </div>
            </div>
          </div>

          {/* Right column — chaos zone */}
          <div className="relative hidden min-h-[560px] lg:block">
            {/* Massive outlined number */}
            <span
              aria-hidden
              className="text-stroke-thin font-heading pointer-events-none absolute -right-6 top-0 select-none text-[18rem] font-black leading-none"
            >
              01
            </span>

            {/* Fake dashboard card */}
            <div className="absolute left-6 top-12 w-[360px] rotate-[-4deg] border-4 border-black bg-white neo-shadow-lg">
              <div className="flex items-center gap-2 border-b-4 border-black bg-black px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
                <span className="h-3 w-3 rounded-full bg-[#ffd93d]" />
                <span className="h-3 w-3 rounded-full bg-[#c4b5fd]" />
                <span className="ml-auto font-heading text-[10px] font-black uppercase tracking-[0.25em] text-[#ffd93d]">
                  Dashboard
                </span>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-black uppercase tracking-widest">This Week</span>
                  <span className="neo-pill neo-tag-accent">▲ 24%</span>
                </div>
                <p className="font-heading text-5xl font-black leading-none tracking-tighter text-black">
                  $12,480
                </p>
                <div className="h-[3px] bg-black" />
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Leads", v: "12" }, { l: "Sent", v: "04" }, { l: "Signed", v: "03" }].map((s) => (
                    <div key={s.l} className="border-[3px] border-black bg-[#fffdf5] px-2 py-2 text-center">
                      <p className="font-heading text-2xl font-black">{s.v}</p>
                      <p className="font-heading text-[9px] font-black uppercase tracking-widest">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticker note */}
            <div className="absolute right-8 top-40 w-[240px] rotate-[6deg] border-4 border-black bg-[#ffd93d] p-4 neo-shadow-md">
              <p className="font-heading text-xs font-black uppercase tracking-[0.25em]">Contract #A-221</p>
              <p className="font-heading mt-2 text-2xl font-black leading-tight">
                Signed by Acme Co.
              </p>
              <p className="mt-2 text-xs font-bold">2 min ago</p>
            </div>

            {/* Star badge */}
            <div className="absolute bottom-16 right-20 h-24 w-24 animate-spin-slow">
              <div className="flex h-full w-full items-center justify-center border-4 border-black bg-[#ff6b6b] font-heading text-xs font-black uppercase leading-tight text-black">
                <span>★ new ★</span>
              </div>
            </div>

            {/* Low note */}
            <div className="absolute bottom-4 left-8 w-[260px] -rotate-2 border-4 border-black bg-[#c4b5fd] p-4 neo-shadow-md">
              <p className="font-heading text-xs font-black uppercase tracking-[0.25em]">⚠ Renewal</p>
              <p className="mt-1 text-sm font-bold">Figma · $45/mo · 6 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <section className="overflow-hidden border-b-4 border-black bg-black py-5">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
            {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
              <span key={`${phrase}-${i}`} className="flex items-center gap-8">
                <span className="font-heading text-3xl font-black uppercase tracking-tight text-[#ffd93d]">
                  {phrase}
                </span>
                <span className="text-3xl text-[#ff6b6b]">★</span>
              </span>
            ))}
          </div>
          <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8" aria-hidden>
            {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
              <span key={`dup-${phrase}-${i}`} className="flex items-center gap-8">
                <span className="font-heading text-3xl font-black uppercase tracking-tight text-[#ffd93d]">
                  {phrase}
                </span>
                <span className="text-3xl text-[#ff6b6b]">★</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section className="relative border-b-4 border-black bg-[#c4b5fd] py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-halftone opacity-20" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="neo-tag neo-tag-dark">What&apos;s Inside</span>
              <h2 className="font-heading mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-6xl lg:text-7xl">
                Five modules. <br />
                <span className="bg-black px-3 text-[#ffd93d]">One mission.</span>
              </h2>
            </div>
            <p className="max-w-sm text-lg font-bold text-black">
              Everything you need to run a freelance business. Nothing you don&apos;t.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            {modules.map((m, i) => (
              <span
                key={m.label}
                className={`inline-flex items-center gap-2 border-4 border-black ${m.tone} px-5 py-3 font-heading text-lg font-black uppercase tracking-tight text-black neo-shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] ${
                  i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-0" : "rotate-1"
                }`}
              >
                <span className="font-heading text-xs font-black opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative border-b-4 border-black bg-[#fffdf5] py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="neo-tag neo-tag-yellow">How It Works</span>
            <h2 className="font-heading mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-6xl lg:text-7xl">
              Four fewer <br />
              <span className="bg-[#ff6b6b] px-3 text-white text-shadow-hard">tabs open.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg font-bold text-black sm:text-xl">
              Stop Frankenstein-ing a workflow out of Notion, Google Docs,
              Stripe, DocuSign, and whatever else. This does the whole thing.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const tones = ["bg-white", "bg-[#ffd93d]", "bg-[#c4b5fd]", "bg-[#ff6b6b]"];
              const tilts = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-0"];
              return (
                <article
                  key={f.num}
                  className={`group relative border-4 border-black ${tones[i]} p-6 neo-shadow-md transition-all duration-200 hover:-translate-y-2 hover:rotate-0 hover:shadow-[14px_14px_0_0_#000] ${tilts[i]}`}
                >
                  <p className="font-heading text-stroke text-7xl font-black leading-none">
                    {f.num}
                  </p>
                  <h3 className="font-heading mt-4 text-2xl font-black uppercase tracking-tight text-black">
                    {f.title}
                  </h3>
                  <p className="mt-3 border-t-[3px] border-black pt-3 text-base font-bold leading-snug text-black">
                    {f.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PERSONAS ===== */}
      <section className="relative border-b-4 border-black bg-black py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-dots-lg opacity-30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="neo-tag neo-tag-yellow">Built For You</span>
              <h2 className="font-heading mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                Who <br />
                <span className="text-[#ff6b6b]">actually</span> uses this?
              </h2>
            </div>
            <p className="max-w-sm text-lg font-bold text-white">
              If you bill by the project and chase your own invoices, this is you.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {productStories.map((story) => (
              <article
                key={story.persona}
                className={`group border-4 border-black ${story.tone} p-6 transition-all duration-200 hover:-translate-y-2 hover:rotate-0 neo-shadow-white hover:shadow-[16px_16px_0_0_#fff] ${story.tilt}`}
              >
                <span className="neo-tag neo-tag-dark mb-4">{story.persona}</span>
                <div className="border-4 border-black bg-white p-4">
                  <p className="font-heading text-xs font-black uppercase tracking-[0.25em] text-black">
                    Before
                  </p>
                  <p className="mt-2 text-base font-bold leading-snug text-black">
                    {story.challenge}
                  </p>
                </div>
                <div className="my-4 flex items-center justify-center">
                  <span className="font-heading text-3xl font-black text-black">↓</span>
                </div>
                <div className="border-4 border-black bg-black p-4">
                  <p className="font-heading text-xs font-black uppercase tracking-[0.25em] text-[#ffd93d]">
                    After
                  </p>
                  <p className="mt-2 text-base font-bold leading-snug text-white">
                    {story.outcome}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative border-b-4 border-black bg-[#ff6b6b] py-24 sm:py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-diagonal opacity-[0.08]" />
        <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-12 bg-black" />
            <span className="neo-tag neo-tag-dark">Ready?</span>
            <span aria-hidden className="h-[3px] w-12 bg-black" />
          </div>
          <h2 className="font-heading mt-6 text-6xl font-black uppercase leading-[0.9] tracking-tighter text-black sm:text-7xl lg:text-8xl xl:text-9xl">
            Stop <br />
            <span className="text-stroke">switching</span>
            <br />
            <span className="bg-black px-3 text-[#ffd93d]">tabs.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-xl font-bold text-black sm:text-2xl">
            30-second setup. No credit card. Cancel in one click. <br />
            Your client work, unchained.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="neo-btn neo-btn-dark px-10 py-5 text-base">
              Start Free →
            </Link>
            <Link href="/sign-in" className="neo-btn px-10 py-5 text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#ffd93d] py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 border-4 border-black bg-white px-3 py-2 neo-shadow-sm">
              <span className="font-heading text-lg font-black uppercase tracking-tight text-black">
                Freelancer/OS
              </span>
              <span aria-hidden className="inline-block h-2 w-2 bg-black" />
            </span>
            <span className="neo-tag">v0.1</span>
          </div>
          <p className="font-heading text-sm font-black uppercase tracking-[0.25em] text-black">
            © 2026 · Built loud. Built raw.
          </p>
        </div>
      </footer>
    </main>
  );
}
