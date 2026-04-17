"use client";

import { useState } from "react";
import { ContractInput, generateContract, ContractResult, FreelancerType } from "@/lib/contract-engine";
import { ContractPreview } from "./ContractPreview";
import { SendSignatureModal } from "./SendSignatureModal";

type Step = "input" | "template" | "generating" | "preview";

type SentData = { signingUrl: string; contractId: string | null; clientName: string; documentName: string };

function sanitizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\xFF]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildGeneratedContractPdfBase64(documentName: string, summary: string, contract: string) {
  const rows: string[] = [];

  rows.push(`Document: ${documentName}`);
  rows.push("");
  rows.push("Plain English Summary");
  rows.push(...summary.split("\n"));
  rows.push("");
  rows.push("Freelance Services Agreement");
  rows.push(...contract.split("\n"));

  const maxCharsPerLine = 92;
  const wrapped: string[] = [];
  for (const row of rows) {
    const line = row.trimEnd();
    if (!line) {
      wrapped.push("");
      continue;
    }
    let rest = line;
    while (rest.length > maxCharsPerLine) {
      wrapped.push(rest.slice(0, maxCharsPerLine));
      rest = rest.slice(maxCharsPerLine);
    }
    wrapped.push(rest);
  }

  const linesPerPage = 50;
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];

  // 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // 2: Pages
  const pageObjectIds: number[] = [];
  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(3 + i * 2);
  }
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>\nendobj\n`
  );

  // Pages + content streams
  for (let i = 0; i < pages.length; i += 1) {
    const pageObjId = 3 + i * 2;
    const contentObjId = pageObjId + 1;

    const lineOps: string[] = ["BT", "/F1 10 Tf", "72 780 Td"];
    for (let j = 0; j < pages[i].length; j += 1) {
      const safe = sanitizePdfText(pages[i][j]);
      lineOps.push(`(${safe}) Tj`);
      if (j < pages[i].length - 1) {
        lineOps.push("0 -14 Td");
      }
    }
    lineOps.push("ET");
    const contentStream = lineOps.join("\n");

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
    );
  }

  // Font object
  const fontObjId = 3 + pages.length * 2;
  objects.push(`${fontObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

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

const freelancerTypes: { id: FreelancerType; label: string; icon: string; example: string }[] = [
  { id: "Software Development", label: "Web/App Developer", icon: "💻", example: "Next.js Mobile App" },
  { id: "Design", label: "Designer", icon: "🎨", example: "Brand Identity & Logo" },
  { id: "Digital Marketing", label: "Marketer", icon: "📈", example: "SEO & Google Ads" },
  { id: "Video Editing", label: "Video Editor", icon: "🎬", example: "YouTube Social Reels" },
  { id: "Writing", label: "Writer", icon: "✍️", example: "Blog Series & Copy" },
  { id: "Consulting", label: "Consultant", icon: "🤝", example: "Business Strategy" },
];

type ContractWizardProps = {
  /** Called after a contract is successfully sent so the parent can add it to the list */
  onContractSent?: (contract: {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    signingUrl: string;
    status: string;
  }) => void;
};

export function ContractWizard({ onContractSent }: ContractWizardProps = {}) {
  const [step, setStep] = useState<Step>("input");
  const [formData, setFormData] = useState<ContractInput>({
    payment_model: "Fixed",
    effective_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<"Free" | "Premium" | "Modern Corporate">("Free");
  const [result, setResult] = useState<ContractResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sentData, setSentData] = useState<SentData | null>(null);
  const [documentBase64, setDocumentBase64] = useState("");
  const [isPreparingDocument, setIsPreparingDocument] = useState(false);
  const [documentPrepError, setDocumentPrepError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const requiredFields = [
      "client_name", "client_location", 
      "freelancer_name", "freelancer_location", 
      "jurisdiction", "scope_of_work", 
      formData.payment_model === "Fixed" ? "budget" : "hourly_rate",
      "timeline"
    ];
    
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (!formData.freelancer_type) {
      newErrors["freelancer_type"] = true;
      isValid = false;
    }

    requiredFields.forEach(field => {
      if (!formData[field as keyof ContractInput]) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const goToTemplateStep = () => {
    if (validateStep1()) {
      setStep("template");
    }
  };

  const startGeneration = () => {
    setStep("generating");
    setDocumentBase64("");
    setDocumentPrepError("");
    setTimeout(() => {
      const res = generateContract(formData);
      // We manually override the template type in the result if needed or pass it to preview
      setResult({ ...res, selectedTemplate }); 
      setStep("preview");
    }, 2000); // Simulate AI crafting
  };

  // Opens the modal — the modal handles the API call
  const handleSendForSignature = () => {
    const documentName = `${formData.freelancer_type ?? "Freelance"} Agreement -- ${formData.client_name ?? "Client"}`;
    if (result && !documentBase64) {
      setIsPreparingDocument(true);
      setDocumentPrepError("");
      try {
        const base64 = buildGeneratedContractPdfBase64(
          documentName,
          result.summary || "",
          result.contract || ""
        );
        setDocumentBase64(base64);
      } catch {
        setDocumentPrepError("Could not prepare the generated contract PDF.");
      } finally {
        setIsPreparingDocument(false);
      }
    }
    setShowModal(true);
  };

  // Called by SendSignatureModal on a successful API response
  const handleModalSuccess = (data: {
    signingUrl: string;
    documentId: string;
    contractId: string | null;
    clientName: string;
    clientEmail: string;
  }) => {
    const documentName = result ? `${formData.freelancer_type ?? "Freelance"} Agreement — ${formData.client_name ?? "Client"}` : "Contract";
    setSentData({
      signingUrl: data.signingUrl,
      contractId: data.contractId,
      clientName: data.clientName,
      documentName,
    });
    setShowModal(false);

    // Notify parent so it can prepend this contract to the 'Your contracts' list
    onContractSent?.({
      id: data.contractId ?? data.documentId,
      title: documentName,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      signingUrl: data.signingUrl,
      status: "Sent",
    });
  };

  if (step === "generating") {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">AI is crafting your agreement...</h3>
          <p className="text-slate-500 animate-pulse">Analyzing project type and injecting protective clauses</p>
        </div>
      </div>
    );
  }

  if (step === "preview" && result) {
    const documentName = `${formData.freelancer_type ?? "Freelance"} Agreement — ${formData.client_name ?? "Client"}`;
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 mb-6 print:hidden">
            <button
              onClick={() => setStep("template")}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2"
            >
              ← Back to Templates
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep("input")}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Edit Fields
              </button>
              <button 
                onClick={startGeneration}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Regenerate
              </button>
            </div>
          </div>
          <ContractPreview 
            result={result} 
            templateType={selectedTemplate}
            onSend={handleSendForSignature}
          />

          {sentData && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Sent <span className="font-semibold">{sentData.documentName}</span> to <span className="font-semibold">{sentData.clientName}</span>. Status is now <span className="font-semibold">Sent</span> in Your contracts.
            </div>
          )}
        </div>

        {/* Send Signature Modal */}
        {showModal && (
          <SendSignatureModal
            documentName={documentName}
            contractId=""
            pdfBase64={documentBase64}
            isPreparingDocument={isPreparingDocument}
            documentPrepError={documentPrepError}
            initialClientName={formData.client_name || ""}
            onClose={() => setShowModal(false)}
            onSendSuccess={handleModalSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className="contract-workspace-container mx-auto max-w-4xl">
      {/* Progress Pills */}
      <div className="mb-10 flex gap-2 overflow-x-auto pb-2 print:hidden">
        {["Intake Details", "Select Style", "Final Review"].map((t, i) => {
          const active = (step === "input" && i === 0) || (step === "template" && i === 1) || (step === "preview" && i === 2);
          const completed = (step === "template" && i === 0) || (step === "preview" && i <= 1);
          return (
            <div key={t} className="flex-1 min-w-30 flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-indigo-600 text-white" : completed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                {completed ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? "text-slate-950" : "text-slate-400"}`}>{t}</span>
            </div>
          );
        })}
      </div>

      {step === "input" ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Section: Freelancer Type Selection */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">01. Select Freelancer Type</h3>
            {errors.freelancer_type && <p className="text-xs text-red-500 font-bold">Please select a freelancer type</p>}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {freelancerTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, freelancer_type: type.id }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.freelancer_type;
                      return newErrors;
                    });
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${formData.freelancer_type === type.id ? "bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600" : errors.freelancer_type ? "border-red-300 bg-red-50/30" : "bg-white border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="text-2xl mb-2">{type.icon}</span>
                  <span className="text-sm font-bold text-slate-950">{type.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1">Example: {type.example}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Section: The Parties */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">02. The Parties</h3>
            <div className="grid md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-4xl border border-slate-100">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client (Paying Party)</p>
                <input name="client_name" value={formData.client_name || ""} placeholder="Full Name or Company" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.client_name ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
                <input name="client_location" value={formData.client_location || ""} placeholder="Address/City/State" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.client_location ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contractor (Freelancer)</p>
                <input name="freelancer_name" value={formData.freelancer_name || ""} placeholder="Full Legal Name" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.freelancer_name ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
                <input name="freelancer_location" value={formData.freelancer_location || ""} placeholder="Address/City/State" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.freelancer_location ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* Section: Project & Legal */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">03. Project & Legal</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Jurisdiction (Governing Law State)</label>
                <input name="jurisdiction" value={formData.jurisdiction || ""} placeholder="e.g. California" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.jurisdiction ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Effective Date</label>
                <input type="date" name="effective_date" value={formData.effective_date} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20" onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Scope of Work</label>
                <textarea name="scope_of_work" value={formData.scope_of_work || ""} rows={3} placeholder="Provide specific service details..." className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 ${errors.scope_of_work ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* Section: Compensation */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">04. Compensation</h3>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit">
                {(["Fixed", "Hourly"] as const).map((m) => (
                  <button key={m} onClick={() => setFormData((p) => ({ ...p, payment_model: m }))} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.payment_model === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>{m} Fee</button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {formData.payment_model === "Fixed" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Total Budget</label>
                    <input name="budget" value={formData.budget || ""} placeholder="e.g. $2,500 USD" className={`w-full border rounded-xl p-3 text-sm bg-slate-50/30 focus:ring-2 focus:ring-indigo-500/20 ${errors.budget ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Hourly Rate</label>
                    <input name="hourly_rate" value={formData.hourly_rate || ""} placeholder="e.g. $75/hr" className={`w-full border rounded-xl p-3 text-sm bg-slate-50/30 focus:ring-2 focus:ring-indigo-500/20 ${errors.hourly_rate ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Invoicing & Timeline</label>
                  <input name="timeline" value={formData.timeline || ""} placeholder="e.g. 1 month duration" className={`w-full border rounded-xl p-3 text-sm bg-slate-50/30 focus:ring-2 focus:ring-indigo-500/20 ${errors.timeline ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"}`} onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Specific Payment Milestones (Optional)</label>
                  <input name="payment_terms" value={formData.payment_terms || ""} placeholder="e.g. 50% upfront, 50% on final delivery" className="w-full border-slate-200 rounded-xl p-3 text-sm bg-slate-50/30" onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </section>

          <button onClick={goToTemplateStep} className="flex w-full items-center justify-center gap-2 border-4 border-black bg-black p-5 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black active:scale-[0.99]">
            Continue to Template Selection →
          </button>
        </div>
      ) : step === "template" ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-2 px-4 pb-4 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">Select Contract Interface</h2>
            <p className="text-black/70">How would you like the legal document to be formatted visually?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div 
              onClick={() => setSelectedTemplate("Free")}
              className={`flex cursor-pointer flex-col items-center space-y-4 border-4 p-6 text-center transition-all ${selectedTemplate === "Free" ? "border-black bg-swiss-muted" : "border-black bg-white hover:bg-swiss-muted"}`}
            >
              <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black">1</div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-black">Free Version</h4>
                <p className="mt-2 text-xs leading-relaxed text-black/70">Simple monospace formatting. Standard legal layout.</p>
              </div>
            </div>
            
            <div 
              onClick={() => setSelectedTemplate("Premium")}
              className={`relative flex cursor-pointer flex-col items-center space-y-4 overflow-hidden border-4 p-6 text-center transition-all ${selectedTemplate === "Premium" ? "border-black bg-swiss-muted" : "border-black bg-white hover:bg-swiss-muted"}`}
            >
              <div className="absolute right-4 top-4 border-2 border-black bg-swiss-accent px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.24em] text-black">Recommended</div>
              <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black text-white">2</div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-black">Premium AI Style</h4>
                <p className="mt-2 text-xs leading-relaxed text-black/70">High-fidelity typography, professional structure, and immutable ID.</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedTemplate("Modern Corporate")}
              className={`flex cursor-pointer flex-col items-center space-y-4 border-4 p-6 text-center transition-all ${selectedTemplate === "Modern Corporate" ? "border-black bg-swiss-muted" : "border-black bg-white hover:bg-swiss-muted"}`}
            >
              <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black">3</div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-black">Modern Corporate</h4>
                <p className="mt-2 text-xs leading-relaxed text-black/70">Executive sans-serif design. Strong headers and structured sections.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <button onClick={startGeneration} className="w-full max-w-sm border-4 border-black bg-black px-10 py-5 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black">
              Use Template
            </button>
            <button onClick={() => setStep("input")} className="text-sm font-black uppercase tracking-[0.24em] text-black/60 hover:text-black">
              ← Back to Details
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
