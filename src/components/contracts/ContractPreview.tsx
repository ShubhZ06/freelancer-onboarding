"use client";

import { ContractResult } from "@/lib/contract-engine";

interface Props {
  result: ContractResult;
  templateType: "Free" | "Premium" | "Modern Corporate";
  onSend: () => void;
}

export function ContractPreview({ result, templateType, onSend }: Props) {
  const isPremium = templateType === "Premium";
  const isCorporate = templateType === "Modern Corporate";

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
      <div className="bg-[#fcf9f1] border border-[#e8dfc4] p-8 rounded-[2rem] shadow-sm relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold">
            i
          </div>
          <h4 className="font-bold text-slate-900 tracking-tight text-lg">Plain English Summary</h4>
        </div>
        <div className="relative z-10">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 font-medium">
            {result.summary}
          </pre>
        </div>
      </div>

      {/* Contract Section */}
      <div
        className={`contract-document-wrapper transition-all duration-700 rounded-[2.5rem] border relative ${
          isPremium
            ? "bg-white p-16 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border-slate-100 ring-1 ring-slate-950/5"
            : isCorporate
            ? "bg-white p-16 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border-slate-900 ring-2 ring-slate-950"
            : "bg-white p-10 shadow-sm border-slate-200"
        }`}
      >
        {(isPremium || isCorporate) && (
          <div className={`mb-16 border-b pb-10 flex justify-between items-end ${isCorporate ? "border-slate-900" : "border-slate-100"}`}>
            <div className="space-y-2">
              <h2 className={`text-3xl tracking-tight ${isPremium ? "font-serif italic text-slate-950" : "font-sans font-black uppercase text-slate-900 tracking-tighter"}`}>
                {isCorporate ? "Professional Services Agreement" : "Freelance Services Agreement"}
              </h2>
              <div className="flex gap-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">VERIFIED DOCUMENT</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Status: FINAL</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Code: 202-A</p>
            </div>
          </div>
        )}

        <div className="relative">
          <pre
            className={`whitespace-pre-wrap transition-all duration-500 relative z-10 ${
              isPremium
                ? "font-serif text-[1.1rem] leading-[1.85] text-slate-800"
                : isCorporate
                ? "font-sans text-[1rem] leading-[1.8] text-slate-900 font-medium"
                : "font-mono text-xs leading-[1.7] text-slate-600"
            }`}
          >
            {result.contract}
          </pre>
        </div>

        {(isPremium || isCorporate) && (
          <div className={`mt-16 pt-10 border-t flex justify-between text-[10px] tracking-[0.3em] font-black ${isCorporate ? "border-slate-900 text-slate-900" : "border-slate-100 text-slate-300 uppercase"}`}>
            <span>© 2026 {isCorporate ? "Corporate Legal Entity" : "FreelancerOS Legal Engine"}</span>
            <span>Document Protected</span>
          </div>
        )}
      </div>

      {/* CTA Section - Hidden in Print */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 no-print">
        <button 
          onClick={() => window.print()}
          className="flex-1 border-2 border-slate-200 text-slate-700 rounded-2xl py-4 px-6 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <span>📥</span> Print / Save PDF
        </button>
        <button 
          onClick={onSend}
          className="flex-[2] bg-indigo-600 text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
        >
          <span>✍️</span> 
          <span>Send for Digital Signature</span>
          <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
        </button>
      </div>
    </div>
  );
}
