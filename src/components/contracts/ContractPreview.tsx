"use client";

import { useState } from "react";
import { ContractResult } from "@/lib/contract-engine";

interface Props {
  result: ContractResult;
  templateType: "Free" | "Premium" | "Modern Corporate";
  onSend: () => void;
}

export function ContractPreview({ result, templateType, onSend }: Props) {
  const isPremium = templateType === "Premium";
  const isCorporate = templateType === "Modern Corporate";
  const [documentId] = useState(() => Math.random().toString(36).slice(2, 11).toUpperCase());

  return (
    <div className="space-y-8">
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm !important;
            size: A4 portrait;
          }

          html, body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-image: none !important;
          }

          header, nav, aside, footer, .no-print {
            display: none !important;
          }

          main > section:first-child,
          section > div:first-of-type,
          main > div:not(.contract-workspace-container) {
            display: none !important;
          }

          main, section, .contract-workspace-container {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          .contract-document-wrapper {
            visibility: visible !important;
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }

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

      {/* Plain English summary — hidden in print */}
      <div className="relative overflow-hidden border-4 border-black bg-[#ffd93d] p-6 neo-shadow-md no-print sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-halftone opacity-20" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white font-heading text-lg font-black">
              i
            </span>
            <h4 className="font-heading text-3xl font-black uppercase tracking-tight text-black">
              Plain English Summary
            </h4>
          </div>
          <pre className="whitespace-pre-wrap font-body text-base font-bold leading-relaxed text-black">
            {result.summary}
          </pre>
        </div>
      </div>

      {/* Contract document */}
      <div
        className={`contract-document-wrapper border-4 border-black bg-white neo-shadow-lg ${
          isPremium || isCorporate ? "p-8 sm:p-14" : "p-8 sm:p-10"
        }`}
      >
        {(isPremium || isCorporate) && (
          <div className="mb-10 flex items-end justify-between border-b-4 border-black pb-6">
            <div className="space-y-2">
              <h2 className="font-heading text-3xl font-black uppercase tracking-tighter text-black sm:text-4xl">
                {isCorporate ? "Professional Services Agreement" : "Freelance Services Agreement"}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="neo-tag">Verified</span>
                <span className="neo-tag neo-tag-yellow">ID: {documentId}</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-black">Status: Final</p>
              <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-black">Code: 202-A</p>
            </div>
          </div>
        )}

        <pre
          className={`whitespace-pre-wrap text-black ${
            isPremium
              ? "font-body text-[1.02rem] leading-[1.85]"
              : isCorporate
              ? "font-body text-base leading-[1.8]"
              : "font-body text-sm leading-[1.7]"
          }`}
        >
          {result.contract}
        </pre>

        {(isPremium || isCorporate) && (
          <div className="mt-10 flex justify-between border-t-4 border-black pt-6 font-heading text-[10px] font-black uppercase tracking-[0.3em] text-black">
            <span>© 2026 {isCorporate ? "Corporate Legal Entity" : "FreelancerOS Legal Engine"}</span>
            <span>Document Protected</span>
          </div>
        )}
      </div>

      {/* CTA buttons — hidden in print */}
      <div className="flex flex-col gap-4 sm:flex-row no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="neo-btn neo-btn-secondary flex-1 py-4"
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={onSend}
          className="neo-btn neo-btn-primary flex-[2] py-4"
        >
          Send for Digital Signature →
        </button>
      </div>
    </div>
  );
}
