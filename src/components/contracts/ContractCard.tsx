"use client";

import { useState } from "react";
import type { ContractData } from "./SendContractModal";
import { SendSignatureModal } from "./SendSignatureModal";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const statusConfig: Record<
  string,
  { label: string; bg: string; dot: string }
> = {
  Draft: {
    label: "Draft",
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  "Ready to Send": {
    label: "Ready to Send",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  Sent: {
    label: "Sent",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  Signed: {
    label: "Signed",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig["Draft"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Contract card
// ---------------------------------------------------------------------------

type Props = {
  contract: ContractData;
  /** Current status label — will be managed by the parent or lifted to context */
  initialStatus?: string;
  initialSigningUrl?: string;
};

export function ContractCard({
  contract,
  initialStatus = "Ready to Send",
  initialSigningUrl,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [showModal, setShowModal] = useState(false);
  const [signingUrl, setSigningUrl] = useState<string | null>(initialSigningUrl ?? null);

  const handleSent = (result: { signingUrl: string; documentId: string }) => {
    setStatus("Sent");
    setSigningUrl(result.signingUrl);
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:border-slate-300/80 hover:shadow-md">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {contract.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {contract.clientName} · {contract.clientEmail}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Actions row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(status === "Ready to Send" || status === "Draft") && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.97]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
              Send to Client
            </button>
          )}

          {status === "Sent" && signingUrl && (
            <a
              href={signingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              Open Signing Link
            </a>
          )}

          {status === "Signed" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Fully executed
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SendSignatureModal
          documentName={contract.title}
          contractId={contract.id}
          pdfBase64={contract.pdfBase64}
          initialClientName={contract.clientName}
          initialClientEmail={contract.clientEmail}
          onClose={() => setShowModal(false)}
          onSendSuccess={handleSent}
        />
      )}
    </>
  );
}
