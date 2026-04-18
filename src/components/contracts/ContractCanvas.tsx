"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { ContractResult } from "@/lib/contract-engine";

type TemplateType = "Free" | "Premium" | "Modern Corporate";

type Props = {
  result: ContractResult;
  templateType: TemplateType;
  onBack: () => void;
  onGenerateAnother: () => void;
  onSend: (pdfBase64: string) => void;
};

function isCanvasLikelyBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return false;
  }

  const cols = 12;
  const rows = 12;
  let nonWhiteSamples = 0;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const px = Math.floor((x / (cols - 1)) * (canvas.width - 1));
      const py = Math.floor((y / (rows - 1)) * (canvas.height - 1));
      const data = ctx.getImageData(px, py, 1, 1).data;
      const isWhite = data[0] > 245 && data[1] > 245 && data[2] > 245 && data[3] > 245;
      if (!isWhite) {
        nonWhiteSamples += 1;
        if (nonWhiteSamples >= 4) {
          return false;
        }
      }
    }
  }

  return true;
}

async function buildRenderedCanvasPdfBase64(articleEl: HTMLElement): Promise<string> {
  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {
      // Continue with fallback browser fonts if readiness fails.
    });
  }

  const sourceRect = articleEl.getBoundingClientRect();
  const sourceWidth = Math.max(1, Math.floor(sourceRect.width || articleEl.scrollWidth));

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-20000px";
  host.style.top = "0";
  host.style.width = `${sourceWidth}px`;
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";

  const freezeStyle = document.createElement("style");
  freezeStyle.textContent = `
    .pdf-capture-root, .pdf-capture-root * {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }
  `;

  const clone = articleEl.cloneNode(true) as HTMLElement;
  clone.classList.add("pdf-capture-root");
  clone.style.margin = "0";

  host.appendChild(freezeStyle);
  host.appendChild(clone);
  document.body.appendChild(host);

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const cloneWidth = Math.max(1, Math.ceil(clone.scrollWidth));
  const cloneHeight = Math.max(1, Math.ceil(clone.scrollHeight));
  const maxDim = Math.max(cloneWidth, cloneHeight);
  const safeScale = Math.min(2, Math.max(0.75, 8192 / maxDim));

  const attempts = [
    { foreignObjectRendering: false, useCORS: true },
    { foreignObjectRendering: true, useCORS: true },
  ];

  let snapshot: HTMLCanvasElement | null = null;
  let lastError: unknown = null;

  try {
    for (const attempt of attempts) {
      try {
        const candidate = await html2canvas(clone, {
          scale: safeScale,
          useCORS: attempt.useCORS,
          allowTaint: true,
          foreignObjectRendering: attempt.foreignObjectRendering,
          backgroundColor: "#ffffff",
          logging: false,
          width: cloneWidth,
          height: cloneHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: cloneWidth,
          windowHeight: cloneHeight,
        });

        if (candidate.width === 0 || candidate.height === 0) {
          throw new Error("Captured canvas has zero dimensions.");
        }

        if (isCanvasLikelyBlank(candidate)) {
          throw new Error("Captured canvas appears blank.");
        }

        snapshot = candidate;
        break;
      } catch (err) {
        lastError = err;
      }
    }
  } finally {
    host.remove();
  }

  if (!snapshot) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Unable to render contract canvas into PDF image.");
  }

  if (snapshot.width === 0 || snapshot.height === 0) {
    throw new Error("Rendered contract snapshot is empty.");
  }

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();

  const pageHeightPx = Math.floor((snapshot.width * pageHeightMm) / pageWidthMm);
  if (pageHeightPx <= 0) {
    throw new Error("Invalid page slice height for PDF generation.");
  }

  const pageCanvas = document.createElement("canvas");
  const ctx = pageCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not initialize canvas context for PDF generation.");
  }

  let yOffset = 0;
  let pageIndex = 0;

  while (yOffset < snapshot.height) {
    const currentSliceHeight = Math.min(pageHeightPx, snapshot.height - yOffset);
    pageCanvas.width = snapshot.width;
    pageCanvas.height = currentSliceHeight;

    ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      snapshot,
      0,
      yOffset,
      snapshot.width,
      currentSliceHeight,
      0,
      0,
      snapshot.width,
      currentSliceHeight
    );

    if (pageIndex > 0) {
      pdf.addPage();
    }

    const imageData = pageCanvas.toDataURL("image/png");
    const renderHeightMm = (currentSliceHeight * pageWidthMm) / snapshot.width;
    pdf.addImage(imageData, "PNG", 0, 0, pageWidthMm, renderHeightMm, undefined, "FAST");

    yOffset += currentSliceHeight;
    pageIndex += 1;
  }

  return pdf.output("datauristring");
}

function downloadPdfFromDataUri(pdfDataUri: string, filename: string) {
  const link = document.createElement("a");
  link.href = pdfDataUri;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function splitContractLines(contract: string) {
  return contract.split("\n").filter((line) => line.trim().length > 0);
}

function parseSections(lines: string[]) {
  const sections: Array<{ heading: string; body: string[] }> = [];
  let current: { heading: string; body: string[] } | null = null;
  const headingPattern = /^(\d+\.\s|[A-Z][A-Z\s&]{2,}$|SECTION|ARTICLE)/;

  for (const line of lines) {
    if (headingPattern.test(line.trim()) && line.length < 80) {
      if (current) sections.push(current);
      current = { heading: line.trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      current = { heading: "PREAMBLE", body: [line] };
    }
  }
  if (current) sections.push(current);
  return sections;
}

function stripTemplateDuplicateSignatureSections(
  sections: Array<{ heading: string; body: string[] }>
) {
  return sections.filter((section) => {
    const heading = section.heading.toUpperCase();
    const normalizedHeading = heading.replace(/[^A-Z\s]/g, " ").replace(/\s+/g, " ").trim();

    // Each template already renders a dedicated signature block at the bottom,
    // so we remove signature/acknowledgment sections from the generated body.
    if (normalizedHeading.includes("SIGNATURE")) {
      return false;
    }

    if (
      normalizedHeading.includes("ACKNOWLEDGMENT") ||
      normalizedHeading.includes("ACKNOWLEDGEMENT") ||
      normalizedHeading.includes("EXECUTION")
    ) {
      return false;
    }

    return true;
  });
}

function ActionBar({
  onBack,
  onGenerateAnother,
  onSend,
  onDownload,
  isPreparingPdf,
}: Pick<Props, "onBack" | "onGenerateAnother"> & {
  onSend: () => void;
  onDownload: () => void;
  isPreparingPdf: boolean;
}) {
  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <span aria-hidden>←</span> Back to Styles
      </button>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerateAnother}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={isPreparingPdf}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPreparingPdf ? "Preparing PDF..." : <>Send for Signature <span aria-hidden>→</span></>}
        </button>
      </div>
    </div>
  );
}

function FreeDocument({ result }: { result: ContractResult }) {
  const sections = stripTemplateDuplicateSignatureSections(
    parseSections(splitContractLines(result.contract))
  );
  const title = sections[0]?.heading ?? "Freelance Services Agreement";
  const rest = sections.slice(1);

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-10 pb-8 pt-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Freelance Agreement
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            <span className={`h-1.5 w-1.5 rounded-full ${result.isDraft ? "bg-amber-500" : "bg-emerald-500"}`} />
            {result.isDraft ? "Draft" : "Final"}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      </div>

      <div className="space-y-8 px-10 py-10">
        {rest.map((section, i) => (
          <section key={`${section.heading}-${i}`} className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {section.heading}
            </h2>
            <div className="space-y-2 text-[15px] leading-relaxed text-slate-700">
              {section.body.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-slate-100 px-10 py-10">
        {[
          { role: "Client", name: result.contract.match(/CLIENT:\s*([^\n]+)/)?.[1]?.trim() },
          { role: "Contractor", name: result.contract.match(/CONTRACTOR:\s*([^\n]+)/)?.[1]?.trim() },
        ].map((party) => (
          <div key={party.role} className="space-y-3">
            <div className="h-12 border-b border-slate-300" />
            <div>
              <p className="text-sm font-medium text-slate-900">{party.name || "—"}</p>
              <p className="text-xs text-slate-400">{party.role} · Signature</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function PremiumDocument({ result }: { result: ContractResult }) {
  const sections = stripTemplateDuplicateSignatureSections(
    parseSections(splitContractLines(result.contract))
  );
  const title = sections[0]?.heading ?? "Freelance Services Agreement";
  const rest = sections.slice(1);
  const docId = result.detectedType.slice(0, 3).toUpperCase() + "-" + Math.abs(hashString(result.contract)).toString(16).slice(0, 6).toUpperCase();

  return (
    <article
      className="relative mx-auto max-w-3xl overflow-hidden bg-[#fdfcf7] shadow-[0_20px_60px_-20px_rgba(40,30,10,0.25)]"
      style={{ borderTop: "6px solid #1a1a2e" }}
    >
      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "140px",
          fontWeight: 700,
          color: "rgba(26, 26, 46, 0.025)",
          letterSpacing: "0.1em",
          transform: "rotate(-18deg)",
        }}
      >
        PREMIUM
      </div>

      {/* Letterhead */}
      <header className="relative border-b border-[#1a1a2e]/15 px-12 pb-8 pt-12 text-center">
        <div className="mx-auto flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-[#1a1a2e]/30" />
          <svg width="28" height="28" viewBox="0 0 28 28" className="text-[#1a1a2e]">
            <circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M14 4 L17 11 L24 12 L19 17 L20 24 L14 20.5 L8 24 L9 17 L4 12 L11 11 Z" fill="currentColor" opacity="0.85" />
          </svg>
          <span className="h-px w-12 bg-[#1a1a2e]/30" />
        </div>
        <h1
          className="mt-5 text-[2.4rem] font-normal leading-tight tracking-tight text-[#1a1a2e]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.28em] text-[#6b5c3f]">
          <span>✦ Verified</span>
          <span className="h-3 w-px bg-[#6b5c3f]/30" />
          <span>Doc ID · {docId}</span>
          <span className="h-3 w-px bg-[#6b5c3f]/30" />
          <span>{result.isDraft ? "Draft v1.0" : "Executed v1.0"}</span>
        </div>
      </header>

      {/* Body */}
      <div
        className="relative space-y-7 px-12 py-12"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {rest.map((section, i) => (
          <section key={`${section.heading}-${i}`} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b5c3f]">
                Article {String(i + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-[#1a1a2e]/10" />
            </div>
            <h2 className="text-lg font-semibold tracking-wide text-[#1a1a2e]">
              {section.heading}
            </h2>
            <div className="space-y-3 text-[15px] leading-[1.8] text-[#2a2a3e]">
              {section.body.map((line, j) => (
                <p key={j} className="first-letter:font-semibold">{line}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Signature block with seal */}
      <div className="relative border-t border-[#1a1a2e]/15 px-12 py-12">
        <p
          className="mb-8 text-center text-[11px] uppercase tracking-[0.3em] text-[#6b5c3f]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          — In Witness Whereof —
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-8">
          {[
            { role: "Client", name: result.contract.match(/CLIENT:\s*([^\n]+)/)?.[1]?.trim() },
            null,
            { role: "Contractor", name: result.contract.match(/CONTRACTOR:\s*([^\n]+)/)?.[1]?.trim() },
          ].map((party, idx) => {
            if (!party) {
              return (
                <div key={idx} className="flex flex-col items-center pb-2">
                  {/* Wax seal */}
                  <div className="relative">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #c4302b 0%, #8b1e1a 70%, #5a0f0c 100%)",
                        boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className="text-center"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        <div className="text-[8px] font-bold uppercase tracking-widest text-amber-100/80">Sealed</div>
                        <div className="text-xs font-bold text-amber-100">✦</div>
                        <div className="text-[7px] uppercase tracking-wider text-amber-100/70">Agreement</div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-[#6b5c3f]">Official Seal</p>
                </div>
              );
            }
            return (
              <div key={idx} className="space-y-2">
                <div className="h-14 border-b-2 border-[#1a1a2e]/40" />
                <div>
                  <p
                    className="text-base font-semibold italic text-[#1a1a2e]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {party.name || "_________________"}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b5c3f]">
                    {party.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#6b5c3f]">
          <span>© {new Date().getFullYear()} · Confidential</span>
          <span>Premium Agreement</span>
        </div>
      </div>
    </article>
  );
}

function CorporateDocument({ result }: { result: ContractResult }) {
  const sections = stripTemplateDuplicateSignatureSections(
    parseSections(splitContractLines(result.contract))
  );
  const title = sections[0]?.heading ?? "Professional Services Agreement";
  const rest = sections.slice(1);
  const docId = "PSA-" + Math.abs(hashString(result.contract)).toString(16).slice(0, 8).toUpperCase();

  return (
    <article className="mx-auto max-w-3xl overflow-hidden bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.15)]">
      {/* Dark executive header */}
      <header className="bg-slate-950 px-12 py-10 text-white">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">
              Professional Services Agreement
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
              {title}
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
              <span className={`h-1.5 w-1.5 ${result.isDraft ? "bg-amber-400" : "bg-emerald-400"}`} />
              {result.isDraft ? "Draft" : "Executed"}
            </div>
            <p className="mt-2 font-mono text-[10px] tracking-wider text-slate-500">
              {docId}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
          {[
            { label: "Jurisdiction", value: "—" },
            { label: "Effective", value: new Date().toISOString().split("T")[0] },
            { label: "Version", value: "1.0" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="divide-y divide-slate-100 px-12">
        {rest.map((section, i) => (
          <section key={`${section.heading}-${i}`} className="grid grid-cols-[80px_1fr] gap-8 py-7">
            <div>
              <span className="inline-block border-l-2 border-slate-950 pl-2 font-mono text-xs font-bold text-slate-950">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-950">
                {section.heading}
              </h2>
              <div className="space-y-2 text-[14px] leading-relaxed text-slate-700">
                {section.body.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Signature block */}
      <div className="border-t-2 border-slate-950 bg-slate-50 px-12 py-10">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
          Acknowledgment & Execution
        </p>
        <div className="grid grid-cols-2 gap-10">
          {[
            { role: "Client", name: result.contract.match(/CLIENT:\s*([^\n]+)/)?.[1]?.trim() },
            { role: "Contractor", name: result.contract.match(/CONTRACTOR:\s*([^\n]+)/)?.[1]?.trim() },
          ].map((party) => (
            <div key={party.role} className="space-y-3">
              <div className="h-14 border-b-2 border-slate-900" />
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">{party.name || "—"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {party.role}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-slate-400">DATE: ___ / ___ / ___</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>Document Protected · Confidential</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </article>
  );
}

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function ContractCanvas({ result, templateType, onBack, onGenerateAnother, onSend }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  const getCurrentContractPdf = async () => {
    const articleEl = canvasRef.current?.querySelector("article") as HTMLElement | null;
    if (!articleEl) {
      throw new Error("Unable to find the contract canvas to generate PDF.");
    }
    return buildRenderedCanvasPdfBase64(articleEl);
  };

  const handleDownload = async () => {
    setIsPreparingPdf(true);
    try {
      const pdfBase64 = await getCurrentContractPdf();
      const title = `${templateType}-Agreement-${result.detectedType.replace(/\s+/g, "-")}`;
      downloadPdfFromDataUri(pdfBase64, title);
    } catch (err) {
      console.error("[ContractCanvas] Could not generate PDF for download", err);
      alert("Could not generate the contract PDF for download. Please try again.");
    } finally {
      setIsPreparingPdf(false);
    }
  };

  const handleSend = async () => {
    setIsPreparingPdf(true);
    try {
      const pdfBase64 = await getCurrentContractPdf();
      onSend(pdfBase64);
    } catch (err) {
      console.error("[ContractCanvas] Could not convert contract canvas to PDF", err);
      alert("Could not convert the contract canvas to PDF. Please try again.");
    } finally {
      setIsPreparingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <ActionBar
        onBack={onBack}
        onGenerateAnother={onGenerateAnother}
        onSend={handleSend}
        onDownload={handleDownload}
        isPreparingPdf={isPreparingPdf}
      />
      <div ref={canvasRef} className="rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 p-6 sm:p-10">
        {templateType === "Free" && <FreeDocument result={result} />}
        {templateType === "Premium" && <PremiumDocument result={result} />}
        {templateType === "Modern Corporate" && <CorporateDocument result={result} />}
      </div>
    </div>
  );
}
