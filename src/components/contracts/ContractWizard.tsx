"use client";

import { useState } from "react";
import { ContractInput, generateContract, ContractResult, FreelancerType } from "@/lib/contract-engine";
import { ContractPreview } from "./ContractPreview";
import { TemplateType, TEMPLATE_INFO } from "./ContractTemplates";

type Step = "input" | "template" | "generating" | "preview" | "signed";

const freelancerTypes: { id: FreelancerType; label: string; icon: string; example: string }[] = [
  { id: "Software Development", label: "Web/App Developer", icon: "💻", example: "Next.js Mobile App" },
  { id: "Design", label: "Designer", icon: "🎨", example: "Brand Identity & Logo" },
  { id: "Digital Marketing", label: "Marketer", icon: "📈", example: "SEO & Google Ads" },
  { id: "Video Editing", label: "Video Editor", icon: "🎬", example: "YouTube Social Reels" },
  { id: "Writing", label: "Writer", icon: "✍️", example: "Blog Series & Copy" },
  { id: "Consulting", label: "Consultant", icon: "🤝", example: "Business Strategy" },
];

export function ContractWizard() {
  const [step, setStep] = useState<Step>("input");
  const [formData, setFormData] = useState<ContractInput>({
    payment_model: "Fixed",
    effective_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("Basic");
  const [result, setResult] = useState<ContractResult | null>(null);

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
    setTimeout(() => {
      const res = generateContract(formData);
      setResult(res);
      setStep("preview");
    }, 2000);
  };

  const handleSendForSignature = () => {
    setTimeout(() => {
      setStep("signed");
    }, 800);
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
    return (
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
          formData={formData}
          selectedTemplate={selectedTemplate}
          onSend={handleSendForSignature}
        />
      </div>
    );
  }

  if (step === "signed") {
    return (
      <div className="py-16 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
          ✓
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-slate-950">Contract Sent Successfully</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            The agreement has been sent for digital signature. Status updated to <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs bg-slate-100 px-2 py-1 rounded">Pending Signature</span>.
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto flex items-center gap-3">
          <input 
            readOnly 
            value="https://f-os.app/sign/[SIGNING_LINK]" 
            className="bg-transparent text-xs text-slate-500 flex-1 outline-none"
          />
          <button className="text-xs font-bold text-indigo-600">Copy Link</button>
        </div>
        <button 
          onClick={() => setStep("input")}
          className="text-sm font-medium text-slate-500 underline underline-offset-4"
        >
          Create another contract
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto contract-workspace-container">
      {/* Progress Pills */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 print:hidden">
        {["Intake Details", "Select Style", "Final Review"].map((t, i) => {
          const active = (step === "input" && i === 0) || (step === "template" && i === 1) || (step === "preview" && i === 2);
          const completed = (step === "template" && i === 0) || (step === "preview" && i <= 1);
          return (
            <div key={t} className="flex-1 min-w-[120px] flex items-center gap-3">
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
            <div className="grid md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
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
                {["Fixed", "Hourly"].map(m => (
                  <button key={m} onClick={() => setFormData(p => ({ ...p, payment_model: m as "Fixed" | "Hourly" }))} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.payment_model === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>{m} Fee</button>
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

          <button onClick={goToTemplateStep} className="w-full bg-slate-950 text-white p-5 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-2">
            Continue to Template Selection →
          </button>
        </div>
      ) : step === "template" ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-2 px-4 shadow-sm pb-6">
            <h2 className="text-3xl font-bold text-slate-950">Select Contract Interface</h2>
            <p className="text-slate-600 text-sm">How would you like the legal document to be formatted visually? All templates contain the same data with different visual styles.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto px-4">
            {(Object.keys(TEMPLATE_INFO) as TemplateType[]).map((template) => {
              const info = TEMPLATE_INFO[template];
              const templates: Record<TemplateType, { icon: string; bgColor: string; accentColor: string }> = {
                Basic: { icon: "📄", bgColor: "bg-slate-50", accentColor: "bg-slate-100" },
                Influencer: { icon: "✨", bgColor: "bg-pink-50", accentColor: "bg-pink-200" },
                Corporate: { icon: "🏢", bgColor: "bg-slate-900", accentColor: "bg-slate-800" },
                Professional: { icon: "💼", bgColor: "bg-blue-50", accentColor: "bg-blue-200" },
                Legal: { icon: "⚖️", bgColor: "bg-amber-50", accentColor: "bg-amber-200" },
              };
              const style = templates[template];
              const isSelected = selectedTemplate === template;
              return (
                <button key={template} onClick={() => setSelectedTemplate(template)} className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-3 h-full ${isSelected ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-400 shadow-lg" : `${style.bgColor} border-slate-200 hover:border-slate-400 hover:shadow-md`}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${style.accentColor} ${isSelected ? "ring-2 ring-indigo-400" : ""}`}>{style.icon}</div>
                  <div>
                    <h4 className={`font-bold text-sm ${template === "Corporate" ? "text-white" : "text-slate-950"}`}>{info.title}</h4>
                    <p className={`text-xs mt-1 leading-snug ${template === "Corporate" ? "text-slate-300" : "text-slate-600"}`}>{info.description}</p>
                  </div>
                  {isSelected && <div className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">✓ Selected</div>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button onClick={startGeneration} className="w-full max-w-md bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
              <span>→</span> Generate {selectedTemplate} Contract
            </button>
            <button onClick={() => setStep("input")} className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
              ← Back to Details
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
