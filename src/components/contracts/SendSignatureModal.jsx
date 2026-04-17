"use client";

import { useEffect, useRef, useState } from "react";

function escapePdfText(value) {
  const latinSafe = value.normalize("NFKD").replace(/[^\x00-\xFF]/g, "-");
  return latinSafe.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildFallbackPdfBase64(documentName, recipientName) {
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

/**
 * @param {{
 *   documentName: string;
 *   contractId: string;
 *   pdfBase64?: string;
 *   initialClientName?: string;
 *   initialClientEmail?: string;
 *   onClose: () => void;
 *   onSendSuccess?: (result: {
 *     signingUrl: string;
 *     documentId: string;
 *     contractId: string | null;
 *     clientName: string;
 *     clientEmail: string;
 *   }) => void;
 * }} props
 */
export function SendSignatureModal({
  documentName,
  contractId,
  pdfBase64 = "",
  initialClientName = "",
  initialClientEmail = "",
  onClose,
  onSendSuccess,
}) {
  const [clientName, setClientName] = useState(initialClientName);
  const [clientEmail, setClientEmail] = useState(initialClientEmail);
  const [isSending, setIsSending] = useState(false);

  const backdropRef = useRef(null);

  // ── Keyboard: close on Escape ──────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSending) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isSending, onClose]);

  // ── Backdrop click ─────────────────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current && !isSending) onClose();
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    /* ── Backdrop ──────────────────────────────────────────────────────────── */
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="ssm-title"
    >
      {/* ── Modal card ─────────────────────────────────────────────────────── */}
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2
              id="ssm-title"
              className="text-sm font-semibold text-slate-900"
            >
              Send Contract for Signature
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {documentName}
            </p>
          </div>

          {/* X close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close modal"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <form id="send-signature-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 p-6">

            {/* Contract details card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Contract details
              </p>

              {/* Two inputs side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Recipient */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="ssm-recipient"
                    className="text-xs font-medium text-slate-500"
                  >
                    Recipient <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ssm-recipient"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={isSending}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="ssm-email"
                    className="text-xs font-medium text-slate-500"
                  >
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ssm-email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="jane@example.com"
                    disabled={isSending}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Document name row */}
              <div className="mt-3">
                <p className="text-xs text-slate-400">Document</p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {documentName}
                </p>
              </div>
            </div>

            {/* Blue info alert */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              {/* Info icon */}
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p className="text-xs leading-relaxed text-blue-700">
                The contract PDF will be uploaded to Documenso and the recipient
                will receive a secure signing link.{" "}
                <span className="font-semibold">You control sharing.</span>
              </p>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Cancel
            </button>

            {/* Send to Client */}
            <button
              type="submit"
              form="send-signature-form"
              disabled={isSending}
              className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
            >
              {isSending ? (
                <>
                  {/* Spinner */}
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
                <>
                  {/* Send icon */}
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                  Send to Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
