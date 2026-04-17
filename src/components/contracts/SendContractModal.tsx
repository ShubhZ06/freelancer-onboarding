"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContractData = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  /** Base64-encoded PDF string (with or without data-URI prefix) */
  pdfBase64: string;
  /** Internal user / freelancer ID */
  userId: string;
};

type SendState = "idle" | "sending" | "success" | "error";

type Props = {
  contract: ContractData;
  onClose: () => void;
  /** Called after the contract is successfully sent. Receives the signing URL and Documenso document ID. */
  onSent: (result: { signingUrl: string; documentId: string }) => void;
};

// ---------------------------------------------------------------------------
// Toast notification
// ---------------------------------------------------------------------------

function Toast({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl backdrop-blur transition-all animate-in slide-in-from-bottom-3 ${
        type === "success"
          ? "border border-emerald-200 bg-emerald-50/95 text-emerald-800"
          : "border border-red-200 bg-red-50/95 text-red-800"
      }`}
    >
      {type === "success" ? (
        <svg
          className="h-5 w-5 shrink-0 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-1 rounded-md p-0.5 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
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
  );
}

// ---------------------------------------------------------------------------
// Send Contract Modal
// ---------------------------------------------------------------------------

export function SendContractModal({ contract, onClose, onSent }: Props) {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sendState !== "sending") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, sendState]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && sendState !== "sending") onClose();
  };

  // Send to client via our backend API
  const handleSend = async () => {
    setSendState("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contracts/create-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: contract.userId,
          clientEmail: contract.clientEmail,
          clientName: contract.clientName,
          pdfBase64: contract.pdfBase64,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error ||
            body?.details ||
            `Server responded with ${res.status}`
        );
      }

      const data = await res.json();

      setSendState("success");
      setToast({
        type: "success",
        message: `Contract sent to ${contract.clientName} successfully!`,
      });

      // Notify parent with the result and close after a short delay
      setTimeout(() => {
        onSent({
          signingUrl: data.signingUrl,
          documentId: data.documentId,
        });
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      setSendState("error");
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
    }
  };

  return (
    <>
      {/* Toast notification — renders outside the modal */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      >
        <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Send Contract for Signature
              </p>
              <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                {contract.title}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={sendState === "sending"}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Close"
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

          {/* Body */}
          <div className="flex flex-col gap-5 p-6">
            {/* Contract summary card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contract details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Recipient</p>
                  <p className="font-medium text-slate-800">
                    {contract.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-800">
                    {contract.clientEmail}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Document</p>
                  <p className="font-medium text-slate-800">
                    {contract.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p className="text-xs leading-relaxed text-blue-700">
                The contract PDF will be uploaded to Documenso and{" "}
                <strong>{contract.clientName}</strong> will receive a secure
                signing link. No email will be sent — you control sharing.
              </p>
            </div>

            {/* Error message (inline) */}
            {sendState === "error" && errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-xs leading-relaxed text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={sendState === "sending"}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sendState === "sending" || sendState === "success"}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-all active:scale-[0.97] disabled:pointer-events-none ${
                sendState === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {sendState === "sending" && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
              )}
              {sendState === "success" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
              {sendState === "idle" && "Send to Client"}
              {sendState === "sending" && "Sending…"}
              {sendState === "success" && "Sent!"}
              {sendState === "error" && "Retry Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
