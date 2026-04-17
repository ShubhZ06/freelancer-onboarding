"use client";

import { ContractResult } from "@/lib/contract-engine";

interface Props {
  result: ContractResult;
  templateType: "Free" | "Premium" | "Modern Corporate";
  onSend: () => void;
}

function buildStableDocumentId(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(9, "0").slice(-9);
}

export function ContractPreview({ result, templateType, onSend }: Props) {
  const isPremium = templateType === "Premium";
  const isCorporate = templateType === "Modern Corporate";
  const stableDocumentId = buildStableDocumentId(result.contract || result.summary || "contract");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style jsx global>{`
        @media print {
          /* Aggressive Reset for Paper */
          @page {
            margin: 1cm !important;
            size: A4 portrait;
          }

          html, body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* Hide ALL dashboard chrome, headers, and UI elements */
          header, nav, aside, footer, .no-print {
            display: none !important;
          }

          /* Target WorkspaceShell and PageSection headers specifically */
          main > section:first-child, /* Shell Header */
          section > div:first-of-type, /* PageSection Titles */
          main > div:not(.contract-workspace-container) { /* Other sections on page */
            display: none !important;
          }

          /* Remove all section styling to avoid borders/shadows on paper */
          main, section, .contract-workspace-container {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            backdrop-filter: none !important;
          }

          /* Ensure only the contract wrapper is isolated */
          .contract-document-wrapper {
            visibility: visible !important;
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-before: avoid;
          }

          /* typography fixes for print */
          pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            color: black !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Summary Section - Hidden in Print */}
      <div className="bg-[#fcf9f1] border border-[#e8dfc4] p-8 rounded-4xl shadow-sm relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="relative overflow-hidden border-4 border-black bg-white p-8 no-print">
        <div className="absolute inset-0 swiss-dots opacity-30" />
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-swiss-accent text-xs font-black text-black">
            i
          </div>
          <h4 className="text-lg font-black uppercase tracking-tight text-black">Plain English Summary</h4>
        </div>
        <div className="relative z-10">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-black font-medium">
            {result.summary}
          </pre>
        </div>
      </div>

      {/* Contract Section */}
      <div
        className={`contract-document-wrapper transition-all duration-700 rounded-[2.5rem] border relative ${
          isPremium
            ? "bg-white p-10 sm:p-16 border-4 border-black"
            : isCorporate
            ? "bg-white p-10 sm:p-16 border-4 border-black"
            : "bg-white p-10 border-4 border-black"
        }`}
      >
        {(isPremium || isCorporate) && (
          <div className="mb-10 flex items-end justify-between border-b-2 border-black pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                {isCorporate ? "Professional Services Agreement" : "Freelance Services Agreement"}
              </h2>
              <div className="flex gap-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">VERIFIED DOCUMENT</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">ID: {stableDocumentId}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] leading-loose text-black/50">Status: FINAL</p>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] leading-loose text-black/50">Code: 202-A</p>
            </div>
          </div>
        )}

        <div className="relative">
          <pre
            className={`whitespace-pre-wrap transition-all duration-500 relative z-10 ${
              isPremium
                ? "font-sans text-[1.02rem] leading-[1.85] text-black"
                : isCorporate
                ? "font-sans text-[1rem] leading-[1.8] text-black font-medium"
                : "font-mono text-xs leading-[1.7] text-black/75"
            }`}
          >
            {result.contract}
          </pre>
        </div>

        {(isPremium || isCorporate) && (
          <div className="mt-10 flex justify-between border-t-2 border-black pt-8 text-[10px] font-black uppercase tracking-[0.3em] text-black/50">
            <span>© 2026 {isCorporate ? "Corporate Legal Entity" : "FreelancerOS Legal Engine"}</span>
            <span>Document Protected</span>
          </div>
        )}
      </div>

      {/* CTA Section - Hidden in Print */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 no-print">
        <button 
          onClick={() => window.print()}
          className="flex-1 border-2 border-black bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-swiss-muted flex items-center justify-center gap-2"
        >
          Print / Save PDF
        </button>
        <button 
          onClick={onSend}
          className="flex-2 bg-indigo-600 text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
        >
          Send for Digital Signature
          <span className="ml-1 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
