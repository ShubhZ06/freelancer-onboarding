"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/navigation";

// ---------------------------------------------------------------------------
// Constants — status ordering & display config
// ---------------------------------------------------------------------------

/**
 * Priority order for the grouped list:
 *   1. Sent (awaiting action — highest priority for reminders)
 *   2. Draft / Ready to Send
 *   3. Signed (verified archives — lowest urgency)
 */
const STATUS_ORDER = ["Sent", "Ready to Send", "Draft", "Signed"];

const STATUS_CONFIG = {
  Sent: {
    label: "Sent",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    section: "Awaiting signature — send a reminder",
    sectionIcon: "🔔",
    priority: 0,
  },
  "Ready to Send": {
    label: "Ready to Send",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    section: "Ready to send",
    sectionIcon: "📄",
    priority: 1,
  },
  Draft: {
    label: "Draft",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    section: "Drafts",
    sectionIcon: "✏️",
    priority: 2,
  },
  Signed: {
    label: "Signed",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    section: "Verified archives",
    sectionIcon: "✅",
    priority: 3,
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: "Unknown",
  dot: "bg-slate-300",
  badge: "bg-slate-100 text-slate-500 border-slate-200",
  section: "Other",
  sectionIcon: "📋",
  priority: 99,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS_CONFIG;
}

/** Format ISO date string to a readable short date, e.g. "17 Apr 2026" */
function formatDate(isoString: string | null | undefined): string | null {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-5">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-3 h-8 w-12 rounded-lg bg-slate-200" />
      <div className="mt-2 h-3 w-40 rounded-full bg-slate-200" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-48 rounded-full bg-slate-200" />
        <div className="h-2.5 w-32 rounded-full bg-slate-200" />
      </div>
      <div className="h-5 w-16 rounded-full bg-slate-200" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Summary stats card
// ---------------------------------------------------------------------------

function StatCard({ label, value, detail, isLoading, accent }: {
  label: string;
  value?: number;
  detail?: string;
  isLoading?: boolean;
  accent?: string;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border p-5 ${accent ?? "border-slate-200/70 bg-slate-50"}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      {isLoading ? (
        <>
          <div className="mt-3 h-8 w-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded-full bg-slate-200" />
        </>
      ) : (
        <>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Individual contract row
// ---------------------------------------------------------------------------

interface ContractRecord {
  _id?: string;
  documentId?: string;
  title?: string;
  clientName?: string;
  clientEmail?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  completedAt?: string;
  viewedAt?: string;
}

function ContractRow({ contract }: { contract: ContractRecord }) {
  const updated = formatDate(contract.updatedAt ?? contract.createdAt);
  const completed = formatDate(contract.completedAt);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50/60">
      {/* Status dot */}
      <span
        className={`inline-block h-2 w-2 shrink-0 rounded-full ${getStatusConfig(contract.status ?? "Unknown").dot}`}
      />

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {contract.title ?? "Untitled Contract"}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {contract.clientName}
          {contract.clientEmail ? ` · ${contract.clientEmail}` : ""}
          {completed
            ? ` · Signed ${completed}`
            : updated
            ? ` · Updated ${updated}`
            : ""}
        </p>
      </div>

      {/* Badge */}
      <StatusBadge status={contract.status ?? "Unknown"} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grouped contract list
// ---------------------------------------------------------------------------

function GroupedContractList({ contracts, isLoading }: { contracts: ContractRecord[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center">
        <span className="text-3xl" aria-hidden="true">
          📭
        </span>
        <p className="text-sm font-semibold text-slate-700">
          No contracts sent yet
        </p>
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          Once you send a contract for signature from the Contracts page, it
          will appear here with its live status.
        </p>
      </div>
    );
  }

  // Group by status, sorted by priority
  const groups: Record<string, ContractRecord[]> = {};
  for (const contract of contracts) {
    const key = contract.status ?? "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(contract);
  }

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const pa = getStatusConfig(a).priority;
    const pb = getStatusConfig(b).priority;
    return pa - pb;
  });

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((status) => {
        const cfg = getStatusConfig(status);
        const items = groups[status];

        return (
          <div key={status}>
            {/* Group header */}
            <div className="mb-2 flex items-center gap-2">
              <span aria-hidden="true">{cfg.sectionIcon}</span>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {cfg.section}
              </h3>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {items.length}
              </span>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {items.map((c) => (
                <ContractRow key={c._id ?? c.documentId ?? c.title} contract={c} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SigningPage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all contracts ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchContracts() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/contracts/list", {
          // Revalidate on every navigation to the page
          cache: "no-store",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.error ?? `Server responded with HTTP ${res.status}`
          );
        }

        const data = await res.json();

        if (!cancelled) {
          setContracts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchContracts();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const sentCount = contracts.filter((c) => c.status === "Sent").length;
  const signedCount = contracts.filter((c) => c.status === "Signed").length;
  // "Viewed not signed" needs a `viewedAt` field from Documenso — we
  // approximate it here as Sent contracts that are not yet Signed.
  // Replace with `c.viewedAt && c.status === "Sent"` once that field is stored.
  const viewedNotSigned = sentCount;

  return (
    <WorkspaceShell
      eyebrow="Signing"
      title="Track signature status without mixing it into contract drafting"
      description="Signing is a separate moment in the customer journey — it should have its own clear page focused on trust, status, and proof."
    >
      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">
              Could not load contracts
            </p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── Summary cards section ──────────────────────────────────────────── */}
      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Signing operations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Who has viewed, who has signed, and what needs a reminder — all at
              a glance.
            </p>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetch("/api/contracts/list", { cache: "no-store" })
                .then((r) => r.json())
                .then((d) => setContracts(Array.isArray(d) ? d : []))
                .catch((e) => setError(e.message))
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Three stat cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                label="Sent envelopes"
                value={sentCount}
                detail="Contracts dispatched and awaiting signer action."
                accent="border-blue-200/70 bg-blue-50/60"
              />
              <StatCard
                label="Viewed not signed"
                value={viewedNotSigned}
                detail="The highest-priority group for reminders and follow-up."
                accent="border-amber-200/70 bg-amber-50/60"
              />
              <StatCard
                label="Verified archives"
                value={signedCount}
                detail="Signed files hashed, stored, and ready for audit lookup."
                accent="border-emerald-200/70 bg-emerald-50/60"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Grouped contract list ──────────────────────────────────────────── */}
      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              All contracts
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Grouped by status — contracts needing reminders appear first.
            </p>
          </div>

          {/* Total pill */}
          {!isLoading && (
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {contracts.length} total
            </span>
          )}
        </div>

        <GroupedContractList contracts={contracts} isLoading={isLoading} />
      </section>
    </WorkspaceShell>
  );
}
