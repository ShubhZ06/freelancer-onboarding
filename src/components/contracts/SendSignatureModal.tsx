"use client";

import { useEffect, useRef, useState } from "react";

function escapePdfText(value: string): string {
  const latinSafe = value.normalize("NFKD").replace(/[^\x00-\xFF]/g, "-");
  return latinSafe.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildFallbackPdfBase64(documentName: string, recipientName: string): string {
  const lineA = escapePdfText(`Contract: ${documentName || "Freelance Agreement"}`);
  const lineB = escapePdfText(`Recipient: ${recipientName || "Client"}`);
  const lineC = escapePdfText(`Generated: ${new Date().toISOString()}`);

  const contentStream = [
    "BT",
    "/F1 14 Tf",
    "72 740 Td",
    `(${lineA}) Tj`,
    "0 -24 Td",
    `(${lineB}) Tj`,
    "0 -24 Td",
    `(${lineC}) Tj`,
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return btoa(pdf);
}

// ---------------------------------------------------------------------------
// SendSignatureModal
// ---------------------------------------------------------------------------
// Props:
//   documentName  — display name of the contract being sent
//   contractId    — internal contract ID passed to /api/contracts/create-signature
//   onClose       — called when the modal should be dismissed
//   onSendSuccess — called after a successful API response
// ---------------------------------------------------------------------------

interface SendSignatureModalProps {
  documentName: string;
  contractId: string;
  pdfBase64?: string;
  isPreparingDocument?: boolean;
  documentPrepError?: string;
  initialClientName?: string;
  initialClientEmail?: string;
  onClose: () => void;
  onSendSuccess?: (result: {
    signingUrl: string;
    documentId: string;
    contractId: string | null;
    clientName: string;
    clientEmail: string;
  }) => void;
}


export function SendSignatureModal({
  documentName,
  contractId,
  pdfBase64 = "",
  isPreparingDocument = false,
  documentPrepError = "",
  initialClientName = "",
  initialClientEmail = "",
  onClose,
  onSendSuccess,
}: SendSignatureModalProps) {
  const [clientName, setClientName] = useState(initialClientName);
  const [clientEmail, setClientEmail] = useState(initialClientEmail);
  const [isSending, setIsSending] = useState(false);

  const backdropRef = useRef(null);

  // ── Keyboard: close on Escape ──────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSending) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isSending, onClose]);

  // ── Backdrop click ─────────────────────────────────────────────────────────
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !isSending) onClose();
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPreparingDocument || documentPrepError) {
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/contracts/create-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // contractId is forwarded when available (e.g. from ContractCard flow)
          ...(contractId ? { contractId } : {}),
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          userId: "user_demo_001",
          pdfBase64:
            typeof pdfBase64 === "string" && pdfBase64.trim().length > 0
              ? pdfBase64
              : `data:application/pdf;base64,${buildFallbackPdfBase64(documentName, clientName.trim())}`,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          body?.details || body?.error || `Server responded with ${res.status}`;
        throw new Error(detail);
      }

      const data = await res.json();

      onSendSuccess?.({
        signingUrl: data.signingUrl ?? "",
        documentId: String(data.documentId ?? ""),
        contractId: data.contractId ?? null,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      alert(`❌ Failed to send contract:\n\n${msg}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="ssm-title"
    >
      <div className="relative flex w-full max-w-xl flex-col border-4 border-black bg-white neo-shadow-lg">

        <div className="flex items-start justify-between border-b-4 border-black bg-[#ffd93d] px-6 py-5">
          <div className="min-w-0 pr-4">
            <span className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-black">
              E-Signature
            </span>
            <h2
              id="ssm-title"
              className="font-heading mt-1 text-2xl font-black uppercase leading-tight tracking-tight text-black"
            >
              Send For Signature
            </h2>
            <p className="mt-1 truncate text-sm font-bold text-black/80">
              {documentName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close modal"
            className="shrink-0 border-[3px] border-black bg-white p-2 font-heading text-black transition-all hover:bg-[#ff6b6b] disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form id="send-signature-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 p-6">

            <div className="border-4 border-black bg-[#fffdf5] p-5">
              <p className="font-heading mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-black">
                Contract Details
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="ssm-recipient"
                    className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black"
                  >
                    Recipient <span className="text-[#ff6b6b]">*</span>
                  </label>
                  <input
                    id="ssm-recipient"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={isSending}
                    className="neo-input disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="ssm-email"
                    className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black"
                  >
                    Email <span className="text-[#ff6b6b]">*</span>
                  </label>
                  <input
                    id="ssm-email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="jane@example.com"
                    disabled={isSending}
                    className="neo-input disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mt-4 border-t-[3px] border-black pt-3">
                <p className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-black/60">Document</p>
                <p className="mt-1 text-sm font-bold text-black">
                  {documentName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-4 border-black bg-[#c4b5fd] px-4 py-3 neo-shadow-sm">
              <span className="font-heading text-xl font-black" aria-hidden="true">ℹ</span>
              <p className="text-sm font-bold leading-snug text-black">
                The contract PDF will be uploaded to Documenso. The recipient gets a secure signing link.{" "}
                <span className="font-heading uppercase tracking-wider">You control sharing.</span>
              </p>
            </div>

            {isPreparingDocument && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Preparing generated contract PDF...
              </div>
            )}

            {!isPreparingDocument && documentPrepError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {documentPrepError}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t-4 border-black bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending || isPreparingDocument}
              className="neo-btn text-xs disabled:pointer-events-none disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="send-signature-form"
              disabled={isSending || isPreparingDocument || !!documentPrepError}
              className="neo-btn neo-btn-primary text-xs disabled:pointer-events-none disabled:opacity-60"
            >
              {isPreparingDocument ? (
                <>Preparing...</>
              ) : isSending ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending…
                </>
              ) : (
                <>Send to Client →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
