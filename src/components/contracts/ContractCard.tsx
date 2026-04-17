"use client";

import { useState } from "react";
import type { ContractData } from "./SendContractModal";
import { SendSignatureModal } from "./SendSignatureModal";

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  Draft: {
    label: "Draft",
    bg: "bg-white",
    text: "text-black",
  },
  "Ready to Send": {
    label: "Ready to Send",
    bg: "bg-[#ffd93d]",
    text: "text-black",
  },
  Sent: {
    label: "Sent",
    bg: "bg-[#c4b5fd]",
    text: "text-black",
  },
  Signed: {
    label: "Signed",
    bg: "bg-black",
    text: "text-[#ffd93d]",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig["Draft"];
  return (
    <span
      className={`inline-flex items-center border-[3px] border-black px-2.5 py-1 font-heading text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

type Props = {
  contract: ContractData;
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
      <div className="relative flex flex-col justify-between border-4 border-black bg-white p-5 neo-shadow-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#000]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-black uppercase leading-tight tracking-tight text-black">
              {contract.title}
            </h3>
            <p className="mt-2 truncate text-sm font-bold text-black/70">
              {contract.clientName} · {contract.clientEmail}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t-[3px] border-black pt-4">
          {(status === "Ready to Send" || status === "Draft") && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="neo-btn neo-btn-dark text-xs"
            >
              Send to Client →
            </button>
          )}

          {status === "Sent" && signingUrl && (
            <a
              href={signingUrl}
              target="_blank"
              rel="noreferrer"
              className="neo-btn neo-btn-violet text-xs"
            >
              Open Signing Link ↗
            </a>
          )}

          {status === "Signed" && (
            <span className="inline-flex items-center gap-2 border-[3px] border-black bg-black px-3 py-2 font-heading text-xs font-black uppercase tracking-widest text-[#ffd93d]">
              ✓ Fully Executed
            </span>
          )}
        </div>
      </div>

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
