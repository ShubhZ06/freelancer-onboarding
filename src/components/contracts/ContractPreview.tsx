"use client";

import { useState } from "react";
import { ContractResult } from "@/lib/contract-engine";
import { ContractInput } from "@/lib/contract-engine";
import { TemplateType, TEMPLATES, TEMPLATE_INFO } from "./ContractTemplates";

interface Props {
  result: ContractResult;
  formData: ContractInput;
  selectedTemplate?: TemplateType;
  onSend?: () => void;
}

export function ContractPreview({ result, formData, selectedTemplate: initialTemplate = "Basic", onSend }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(initialTemplate);
  const TemplateComponent = TEMPLATES[selectedTemplate];

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

        {/* Template Selection - Hidden in Print */}
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-900 mb-4">Select Template Style:</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(TEMPLATE_INFO) as TemplateType[]).map((template) => (
              <button
                key={template}
                onClick={() => setSelectedTemplate(template)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedTemplate === template
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {TEMPLATE_INFO[template].title}
              </button>
            ))}
          </div>
        </div>

        {/* A4 Canvas Preview */}
        <div className="no-print bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-2xl flex justify-center min-h-screen">
          <div 
            className="bg-white shadow-2xl overflow-auto print-container"
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              maxHeight: '100vh'
            }}
          >
            <TemplateComponent data={formData} contractText={result.contract} />
          </div>
        </div>

        {/* CTA Section - Hidden in Print */}
        <div className="flex flex-col sm:flex-row gap-4 no-print">
          <button 
            onClick={() => window.print()}
            className="flex-1 border-2 border-slate-200 text-slate-700 rounded-2xl py-4 px-6 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span> Print / Save PDF
          </button>
          {onSend && (
            <button 
              onClick={onSend}
              className="flex-[2] bg-indigo-600 text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>✍️</span> 
              <span>Send for Digital Signature</span>
              <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
