"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  type ContractInput,
  type ContractResult,
  type FreelancerType,
  generateContract,
} from "@/lib/contract-engine";
import { ContractCanvas } from "./ContractCanvas";
import { SendSignatureModal } from "./SendSignatureModal";

type Step = "input" | "template" | "generating" | "preview";
type TemplateType = "Free" | "Premium" | "Modern Corporate";

const freelancerTypes: Array<{ id: FreelancerType; label: string; example: string; tone: string }> = [
  { id: "Software Development", label: "Web/App Dev", example: "Next.js web app", tone: "bg-[#ff6b6b]" },
  { id: "Design", label: "Designer", example: "Brand identity", tone: "bg-[#ffd93d]" },
  { id: "Digital Marketing", label: "Marketer", example: "SEO and ads", tone: "bg-[#c4b5fd]" },
  { id: "Video Editing", label: "Video Editor", example: "Reels and YouTube", tone: "bg-[#ff6b6b]" },
  { id: "Writing", label: "Writer", example: "Blog and copy", tone: "bg-[#ffd93d]" },
  { id: "Consulting", label: "Consultant", example: "Growth strategy", tone: "bg-[#c4b5fd]" },
];

const paymentModels: Array<ContractInput["payment_model"]> = ["Fixed", "Hourly"];

type ContractWizardProps = {
  /** Optional callback for consumers that track sent contracts externally */
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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("Free");
  const [result, setResult] = useState<ContractResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [documentBase64, setDocumentBase64] = useState("");

  const [formData, setFormData] = useState<ContractInput>({
    payment_model: "Fixed",
    effective_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showValidationHint, setShowValidationHint] = useState(false);

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  }

  function validateInputStep() {
    const required = [
      "client_name",
      "client_location",
      "freelancer_name",
      "freelancer_location",
      "jurisdiction",
      "scope_of_work",
      formData.payment_model === "Fixed" ? "budget" : "hourly_rate",
      "timeline",
    ];

    const nextErrors: Record<string, boolean> = {};

    if (!formData.freelancer_type) {
      nextErrors.freelancer_type = true;
    }

    for (const key of required) {
      const value = formData[key as keyof ContractInput];
      if (!value || String(value).trim().length === 0) {
        nextErrors[key] = true;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToTemplateStep() {
    if (!validateInputStep()) {
      setShowValidationHint(true);
      return;
    }
    setShowValidationHint(false);
    setStep("template");
  }

  function startGeneration() {
    setStep("generating");
    setDocumentBase64("");
    setTimeout(() => {
      const generated = generateContract(formData);
      setResult({ ...generated, selectedTemplate });
      setStep("preview");
    }, 1300);
  }

  // Opens the modal with a PDF generated from the rendered React contract canvas
  const handleSendForSignature = (generatedPdfBase64: string) => {
    setDocumentBase64(generatedPdfBase64);
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
      <div className="relative overflow-hidden border-4 border-black bg-[#ffd93d] px-8 py-20 text-center neo-shadow-lg">
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-halftone opacity-30" />
        <div className="relative space-y-4">
          <div className="mx-auto inline-flex h-20 w-20 animate-spin-slow items-center justify-center border-4 border-black bg-white neo-shadow-sm">
            <span className="font-heading text-3xl font-black">★</span>
          </div>
          <p className="font-heading text-4xl font-black uppercase tracking-tighter text-black sm:text-5xl">
            Building your contract
          </p>
          <p className="text-lg font-bold text-black">Adding legal safeguards and payment clauses…</p>
        </div>
      </div>
    );
  }

  if (step === "preview" && result) {
    const documentName = `${formData.freelancer_type ?? "Freelance"} Agreement — ${formData.client_name ?? "Client"}`;
    return (
      <>
        <ContractCanvas
          result={result}
          templateType={selectedTemplate}
          onBack={() => setStep("template")}
          onGenerateAnother={() => setStep("input")}
          onSend={handleSendForSignature}
        />

        {/* Send Signature Modal */}
        {showModal && (
          <SendSignatureModal
            documentName={documentName}
            contractId=""
            pdfBase64={documentBase64}
            initialClientName={formData.client_name || ""}
            onClose={() => setShowModal(false)}
            onSendSuccess={handleModalSuccess}
          />
        )}
      </>
    );
  }

  const stepIdx = step === "input" ? 0 : step === "template" ? 1 : 2;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Step tracker */}
      <div className="flex flex-wrap items-center gap-3">
        {["Intake", "Style", "Preview"].map((label, i) => {
          const isDone = i < stepIdx;
          const isActive = i === stepIdx;
          return (
            <div key={label} className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 border-[3px] border-black px-3 py-2 text-xs font-black uppercase tracking-widest ${
                  isActive
                    ? "bg-[#ff6b6b] text-black neo-shadow-sm"
                    : isDone
                      ? "bg-black text-[#ffd93d]"
                      : "bg-white text-black/60"
                }`}
              >
                <span className="font-heading">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </span>
              {i < 2 ? <span aria-hidden className="h-[3px] w-6 bg-black" /> : null}

            </div>
          );
        })}
      </div>

      {step === "input" ? (
        <div className="space-y-8">
          {showValidationHint ? (
            <div className="flex items-start gap-3 border-4 border-black bg-[#ff6b6b] px-5 py-4 neo-shadow-sm">
              <span className="text-2xl">⚠</span>
              <p className="text-base font-bold text-black">
                Fill the required fields first, then click Continue to style selection.
              </p>
            </div>
          ) : null}

          {/* Freelancer type */}
          <section className="border-4 border-black bg-white neo-shadow-md">
            <header className="border-b-4 border-black bg-[#c4b5fd] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center border-[3px] border-black bg-white font-heading text-xs font-black">01</span>
                <h3 className="font-heading text-2xl font-black uppercase tracking-tight">Service Type</h3>
              </div>
              {errors.freelancer_type ? (
                <p className="mt-2 text-sm font-bold text-black">⚠ Select a service type to tailor clauses.</p>
              ) : null}
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {freelancerTypes.map((type, idx) => {
                const selected = formData.freelancer_type === type.id;
                const tilt = idx % 2 ? "-rotate-1" : "rotate-1";
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, freelancer_type: type.id }));
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.freelancer_type;
                        return copy;
                      });
                    }}
                    aria-pressed={selected}
                    className={`group relative border-4 border-black p-4 text-left neo-shadow-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[6px_6px_0_0_#000] ${tilt} ${
                      selected
                        ? `${type.tone} !rotate-0 !translate-x-0 !translate-y-0 shadow-[6px_6px_0_0_#000]`
                        : "bg-white"
                    }`}
                  >
                    <p className="font-heading text-xl font-black uppercase tracking-tight text-black">{type.label}</p>
                    <p className="mt-1 text-sm font-bold text-black/80">e.g. {type.example}</p>
                    {selected ? (
                      <span className="mt-3 inline-flex items-center gap-1 border-[3px] border-black bg-black px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ffd93d]">
                        ✓ Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Parties */}
          <section className="border-4 border-black bg-white neo-shadow-md">
            <header className="border-b-4 border-black bg-[#ffd93d] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center border-[3px] border-black bg-white font-heading text-xs font-black">02</span>
                <h3 className="font-heading text-2xl font-black uppercase tracking-tight">The Parties</h3>
              </div>
            </header>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              {[
                { name: "client_name", label: "Client name", placeholder: "Acme Corp" },
                { name: "client_location", label: "Client location", placeholder: "San Francisco, CA" },
                { name: "freelancer_name", label: "Your name", placeholder: "Alex Morgan" },
                { name: "freelancer_location", label: "Your location", placeholder: "Brooklyn, NY" },
              ].map((field) => (
                <label key={field.name} className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                    {field.label}
                    {errors[field.name] ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                  </span>
                  <input
                    name={field.name}
                    placeholder={field.placeholder}
                    value={(formData[field.name as keyof ContractInput] as string) || ""}
                    onChange={onChange}
                    className="neo-input"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Scope & payment */}
          <section className="border-4 border-black bg-white neo-shadow-md">
            <header className="border-b-4 border-black bg-[#ff6b6b] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center border-[3px] border-black bg-white font-heading text-xs font-black">03</span>
                <h3 className="font-heading text-2xl font-black uppercase tracking-tight">Scope & Payment</h3>
              </div>
            </header>
            <div className="space-y-5 p-5">
              <label className="block space-y-2">
                <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                  Scope of work
                  {errors.scope_of_work ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                </span>
                <textarea
                  name="scope_of_work"
                  value={formData.scope_of_work || ""}
                  onChange={onChange}
                  rows={4}
                  placeholder="Design and build a 5-page marketing site…"
                  className="neo-input resize-y"
                />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                    Jurisdiction
                    {errors.jurisdiction ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                  </span>
                  <input
                    name="jurisdiction"
                    placeholder="Delaware, USA"
                    value={formData.jurisdiction || ""}
                    onChange={onChange}
                    className="neo-input"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                    Timeline
                    {errors.timeline ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                  </span>
                  <input
                    name="timeline"
                    placeholder="6 weeks"
                    value={formData.timeline || ""}
                    onChange={onChange}
                    className="neo-input"
                  />
                </label>
              </div>
              <div className="space-y-2">
                <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                  Payment model
                </span>
                <div className="flex flex-wrap gap-3">
                  {paymentModels.map((model) => (
                    <button
                      type="button"
                      key={model}
                      onClick={() => setFormData((prev) => ({ ...prev, payment_model: model }))}
                      className={`neo-btn text-xs ${
                        formData.payment_model === model ? "neo-btn-dark" : ""
                      }`}
                    >
                      {model} Fee
                    </button>
                  ))}
                </div>
              </div>
              {formData.payment_model === "Fixed" ? (
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                    Total budget
                    {errors.budget ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                  </span>
                  <input
                    name="budget"
                    placeholder="$12,000"
                    value={formData.budget || ""}
                    onChange={onChange}
                    className="neo-input"
                  />
                </label>
              ) : (
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">
                    Hourly rate
                    {errors.hourly_rate ? <span className="ml-2 text-[#ff6b6b]">*</span> : null}
                  </span>
                  <input
                    name="hourly_rate"
                    placeholder="$120/hr"
                    value={formData.hourly_rate || ""}
                    onChange={onChange}
                    className="neo-input"
                  />
                </label>
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={goToTemplateStep}
            className="neo-btn neo-btn-primary w-full py-5 text-base"
          >
            Continue to Style Selection →

          </button>
        </div>
      ) : null}

      {step === "template" ? (
        <div className="space-y-8">
          <div className="text-center">
            <span className="neo-tag neo-tag-yellow">Step 02</span>
            <p className="font-heading mt-4 text-4xl font-black uppercase tracking-tighter text-black sm:text-5xl">
              Choose Your Style
            </p>
            <p className="mx-auto mt-3 max-w-xl text-lg font-bold text-black">
              Same legal engine. Different visual tone.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {([
              { id: "Free", title: "Free", note: "Simple. Honest. Direct.", tone: "bg-[#ffd93d]" },
              { id: "Premium", title: "Premium", note: "Polished client-facing layout.", tone: "bg-[#ff6b6b]" },
              { id: "Modern Corporate", title: "Corporate", note: "Formal enterprise structure.", tone: "bg-[#c4b5fd]" },
            ] as const).map((option, idx) => {
              const selected = selectedTemplate === option.id;
              const tilt = idx === 0 ? "-rotate-2" : idx === 1 ? "rotate-0" : "rotate-2";
              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setSelectedTemplate(option.id)}
                  aria-pressed={selected}
                  className={`relative border-4 border-black p-6 text-left neo-shadow-md transition-all duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[12px_12px_0_0_#000] ${tilt} ${
                    selected
                      ? `${option.tone} !rotate-0 !translate-y-0 shadow-[12px_12px_0_0_#000]`
                      : "bg-white"
                  }`}
                >
                  <span className="font-heading text-xs font-black uppercase tracking-[0.25em] text-black">
                    Template {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="font-heading mt-3 text-4xl font-black uppercase tracking-tighter text-black">
                    {option.title}
                  </p>
                  <p className="mt-3 border-t-[3px] border-black pt-3 text-sm font-bold text-black">
                    {option.note}
                  </p>
                  {selected ? (
                    <span className="absolute -right-3 -top-3 inline-flex h-10 w-10 rotate-12 items-center justify-center border-4 border-black bg-black font-heading text-lg font-black text-[#ffd93d]">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={startGeneration} className="neo-btn neo-btn-primary px-10 py-4 text-base">
              Create Contract →
            </button>
            <button type="button" onClick={() => setStep("input")} className="neo-btn px-10 py-4 text-base">
              ← Back to Details
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
