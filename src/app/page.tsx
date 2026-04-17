import Link from "next/link";

const features = [
  {
    title: "Public landing first",
    detail: "The homepage now acts as a clear entry point instead of dropping users straight into the workspace.",
  },
  {
    title: "Protected dashboard",
    detail: "Route gating sends authenticated users into the dashboard and keeps the workspace private.",
  },
  {
    title: "Operational modules",
    detail: "Leads, contracts, signing, messages, expenses, and setup stay organized under the workspace flow.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden border-4 border-black bg-white p-6 sm:p-8 lg:p-10 swiss-grid-pattern">
        <div className="absolute inset-x-0 top-0 h-2 bg-black" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-swiss-accent">
              Freelancer Operating System
            </p>
            <h1 className="max-w-4xl text-3xl font-black uppercase tracking-tighter text-black sm:text-4xl lg:text-5xl">
              A clearer way to run your freelance business.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-black/70 sm:text-base">
              Start on a public landing page, create an account, sign in, and move into a protected dashboard with acquisition, contracts, signing, and client communication pages.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/sign-up"
                className="border-4 border-black bg-black px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="border-4 border-black bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-black transition hover:bg-swiss-muted"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="border-4 border-black bg-swiss-accent px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-black transition hover:bg-white"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-3 border-4 border-black bg-black p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
              01. ENTRY
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Stat label="Landing" value="Public" />
              <Stat label="Auth" value="Sign In / Up" />
              <Stat label="Workspace" value="Protected" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <article key={feature.title} className="border-4 border-black bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-swiss-accent">
              0{index + 1}
            </p>
            <h2 className="mt-3 text-xl font-black uppercase tracking-tight text-black">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/70">
              {feature.detail}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-black uppercase tracking-tight text-white">{value}</p>
    </div>
  );
}
