"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Status badge component
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  const styles = {
    loading: "bg-amber-100 text-amber-700 border-amber-200",
    ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
    error: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    loading: "Loading…",
    ready: "Ready to Sign",
    error: "Error",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${styles[status]}`}
    >
      {status === "loading" && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {status === "ready" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {status === "error" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
      )}
      {labels[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader for the iframe area
// ---------------------------------------------------------------------------
function SigningCanvasSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Animated document icon */}
      <div className="relative">
        <div className="h-20 w-16 animate-pulse rounded-lg border-2 border-dashed border-slate-300 bg-slate-100" />
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200">
          <svg
            className="h-3.5 w-3.5 animate-spin text-slate-500"
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
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-base font-semibold text-slate-700">
          Loading Signature Canvas…
        </p>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
          Preparing your secure signing environment. This usually takes just a
          moment.
        </p>
      </div>

      {/* Shimmer bars */}
      <div className="flex w-56 flex-col gap-2.5">
        <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-slate-200 delay-75" />
        <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-slate-200 delay-150" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 via-white to-red-50 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-7 w-7 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-800">
          Unable to load contract
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          {message}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md active:scale-[0.97]"
      >
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function ContractSigningPage() {
  const params = useParams();
  const contractId = params?.id;

  const [signingUrl, setSigningUrl] = useState(null);
  const [contractMeta, setContractMeta] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [fetchState, setFetchState] = useState("loading"); // loading | ready | error

  // Fetch contract details + signing URL from our backend
  const fetchContract = useCallback(async () => {
    if (!contractId) return;

    setFetchState("loading");
    setError(null);
    setIframeLoaded(false);

    try {
      const res = await fetch(`/api/contracts/${contractId}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error || `Failed to load contract (HTTP ${res.status})`
        );
      }

      const data = await res.json();

      if (!data.signingUrl) {
        throw new Error("No signing URL was returned for this contract.");
      }

      setSigningUrl(data.signingUrl);
      setContractMeta({
        title: data.title || `Contract ${contractId}`,
        clientName: data.clientName || "Client",
        status: data.status || "PENDING",
        documentId: data.documentId || contractId,
      });
      setFetchState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setFetchState("error");
    }
  }, [contractId]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  // Listen for Documenso postMessage events from the iframe
  useEffect(() => {
    function handleMessage(event) {
      // Documenso iframes send postMessage events on signing completion
      if (event.data?.type === "DOCUMENT_SIGNED" || event.data?.action === "DOCUMENT_COMPLETED") {
        setContractMeta((prev) =>
          prev ? { ...prev, status: "SIGNED" } : prev
        );
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <Link
              href="/contracts"
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-800 hover:shadow-md active:scale-95"
              aria-label="Back to contracts"
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </Link>

            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Contract
              </p>
              <h1 className="text-sm font-semibold text-slate-900 truncate max-w-xs lg:max-w-md">
                {contractMeta?.title || `#${contractId}`}
              </h1>
            </div>
          </div>

          {/* Center (mobile title) */}
          <h1 className="text-sm font-semibold text-slate-900 sm:hidden truncate max-w-[45vw]">
            {contractMeta?.title || `Contract #${contractId}`}
          </h1>

          {/* Right: status + document ID */}
          <div className="flex items-center gap-3">
            {contractMeta?.documentId && (
              <span className="hidden text-xs font-mono text-slate-400 lg:inline">
                ID: {contractMeta.documentId}
              </span>
            )}
            <StatusBadge status={fetchState} />
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
          {/* Info strip */}
          {contractMeta && fetchState === "ready" && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg
                  className="h-4 w-4 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="font-medium">{contractMeta.clientName}</span>
              </div>

              <div className="hidden h-4 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg
                  className="h-4 w-4 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <span>
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {contractMeta.status.toLowerCase()}
                  </span>
                </span>
              </div>

              {contractMeta.status === "SIGNED" && (
                <>
                  <div className="hidden h-4 w-px bg-slate-200 sm:block" />
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    Contract signed successfully
                  </div>
                </>
              )}
            </div>
          )}

          {/* Signing canvas area */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/50">
            {/* Error state */}
            {fetchState === "error" && (
              <ErrorState
                message={error || "Something went wrong."}
                onRetry={fetchContract}
              />
            )}

            {/* Loading / Skeleton state */}
            {fetchState === "loading" && <SigningCanvasSkeleton />}

            {/* Iframe — rendered once we have a URL, but may still be loading */}
            {fetchState === "ready" && signingUrl && (
              <>
                {/* Skeleton overlay while iframe loads */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10">
                    <SigningCanvasSkeleton />
                  </div>
                )}

                <iframe
                  id="documenso-signing-iframe"
                  src={signingUrl}
                  title="Sign Contract"
                  className={`h-full w-full flex-1 transition-opacity duration-500 ${
                    iframeLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ minHeight: "calc(100vh - 180px)" }}
                  onLoad={() => setIframeLoaded(true)}
                  allow="clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-xs text-slate-400 sm:px-6 lg:px-8">
          <span>Powered by Documenso • End-to-end secure</span>
          <span className="hidden sm:inline">
            Freelancer Operating System
          </span>
        </div>
      </footer>
    </main>
  );
}
