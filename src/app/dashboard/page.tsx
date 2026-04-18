import Link from "next/link";
import { WorkspaceShell } from "@/components/navigation";

const moduleLinks = [
  {
    href: "/acquisition",
    label: "Find Clients",
    detail: "Find and qualify leads from public listings.",
    why: "Intent chips filter listings by freelance-ready language before you pitch.",
    tone: "bg-[#ff6b6b]",
    num: "01",
    icon: "◉",
  },
  {
    href: "/communications",
    label: "Client Communication",
    detail: "Send client updates and status reports.",
    why: "Publish status reports and warning messages from one place.",
    tone: "bg-[#ffd93d]",
    num: "02",
    icon: "✉",
  },
  {
    href: "/contracts",
    label: "Contract Generator",
    detail: "Create and send agreements in minutes.",
    why: "Generate legally clear drafts with consistent structure so projects start quickly.",
    tone: "bg-[#c4b5fd]",
    num: "03",
    icon: "📄",
  },
  {
    href: "/payment/generate",
    label: "Client payment",
    detail: "Generate a Stripe checkout link for your client.",
    why: "Hosted pay page — copy the link or send payment details via WhatsApp.",
    tone: "bg-[#86efac]",
    num: "05",
    icon: "💳",
  },
  {
    href: "/settings",
    label: "Settings",
    detail: "Manage profile and defaults.",
    why: "Set defaults once so every workflow starts your way.",
    tone: "bg-[#ff6b6b]",
    num: "06",
    icon: "⚙",
  },
];

export default function DashboardPage() {
  return (
    <WorkspaceShell
      eyebrow="Dashboard"
      title="Your Workspace Command Center"
      description="Launch every workflow from here. Each module knows its job — you just pick the next move."
    >
      {/* Module launcher */}
      <section className="border-4 border-black bg-white neo-shadow-md">
        <header className="flex items-center justify-between border-b-4 border-black bg-black px-6 py-5 sm:px-8">
          <div>
            <p className="font-heading text-xs font-black uppercase tracking-[0.3em] text-[#ffd93d]">
              Launcher
            </p>
            <h2 className="font-heading mt-1 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Jump To A Module
            </h2>
          </div>
          <span className="neo-pill neo-tag-accent">06</span>
        </header>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          {moduleLinks.map((module, idx) => {
            const tilts = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "-rotate-1", "rotate-1"];
            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group relative block border-4 border-black ${module.tone} p-5 neo-shadow-sm transition-all duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[10px_10px_0_0_#000] ${tilts[idx]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                      {module.icon}
                    </span>
                    <span className="font-heading text-stroke text-5xl font-black leading-none">
                      {module.num}
                    </span>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center border-[3px] border-black bg-white font-heading text-lg font-black transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="font-heading mt-4 text-2xl font-black uppercase tracking-tight text-black">
                  {module.label}
                </p>
                <p className="mt-1 text-sm font-bold text-black">{module.detail}</p>
                <p className="mt-4 border-t-[3px] border-black pt-3 text-xs font-bold leading-snug text-black">
                  {module.why}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </WorkspaceShell>
  );
}
