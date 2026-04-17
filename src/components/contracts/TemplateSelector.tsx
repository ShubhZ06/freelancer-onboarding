"use client";

import { useState, useRef, useCallback } from "react";

type TemplateType = "Free" | "Premium" | "Modern Corporate";

interface Template {
  id: TemplateType;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  accent: string;
  accentLight: string;
  preview: React.FC<{ scrollY: number }>;
  structure: string[];
}

// --- Inline Document Preview Components ---
const FreePreview: React.FC<{ scrollY: number }> = ({ scrollY }) => (
  <div
    style={{ transform: `translateY(${-scrollY * 0.4}px)`, transition: "transform 0.15s ease-out" }}
    className="w-full font-mono text-[8px] leading-relaxed text-slate-700 p-5 space-y-3"
  >
    <div className="border-b border-slate-200 pb-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">FREELANCE SERVICES AGREEMENT</div>
      <div className="text-[6px] text-slate-400">Rev. 133EE8E — Standard Protocol</div>
    </div>
    {["1. SERVICES","2. COMPENSATION","3. TIMELINE","4. INTELLECTUAL PROPERTY","5. CONFIDENTIALITY","6. TERMINATION","7. DISPUTE RESOLUTION"].map((s, i) => (
      <div key={s} className="space-y-1">
        <div className="font-bold text-slate-800 text-[7px]">{s}</div>
        <div className="h-1 bg-slate-200 rounded w-full" />
        <div className="h-1 bg-slate-200 rounded w-4/5" />
        {i % 2 === 0 && <div className="h-1 bg-slate-200 rounded w-3/5" />}
      </div>
    ))}
    <div className="pt-4 border-t border-slate-300 space-y-4">
      <div className="text-[7px] text-slate-500">Signatures</div>
      <div className="flex justify-between">
        <div className="space-y-1 w-2/5">
          <div className="h-[0.5px] bg-slate-400 w-full" />
          <div className="text-[6px] text-slate-400">Client</div>
        </div>
        <div className="space-y-1 w-2/5">
          <div className="h-[0.5px] bg-slate-400 w-full" />
          <div className="text-[6px] text-slate-400">Contractor</div>
        </div>
      </div>
    </div>
  </div>
);

const PremiumPreview: React.FC<{ scrollY: number }> = ({ scrollY }) => (
  <div
    style={{ transform: `translateY(${-scrollY * 0.4}px)`, transition: "transform 0.15s ease-out" }}
    className="w-full text-slate-800 p-5 space-y-4"
  >
    <div className="border-b border-slate-200 pb-4">
      <div className="font-serif text-[14px] italic text-slate-900 mb-1">Freelance Services Agreement</div>
      <div className="flex gap-3 text-[6px] text-slate-400 uppercase tracking-widest">
        <span>✓ Verified</span>
        <span>ID: A9F3E2</span>
        <span>v1.0 PRO</span>
      </div>
    </div>
    <div className="space-y-4">
      {["SERVICES","COMPENSATION","INTELLECTUAL PROPERTY","CONFIDENTIALITY","TERMINATION"].map((s, i) => (
        <div key={s} className="space-y-1.5">
          <div className="font-serif text-[8px] font-semibold text-slate-700 uppercase tracking-wider">{s}</div>
          <div className="h-[2px] w-8 bg-indigo-300 rounded mb-1" />
          <div className="h-1 bg-slate-100 rounded w-full" />
          <div className="h-1 bg-slate-100 rounded w-5/6" />
          {i % 2 === 0 && <div className="h-1 bg-slate-100 rounded w-3/4" />}
        </div>
      ))}
    </div>
    <div className="pt-4 border-t border-slate-200 flex justify-between">
      <div className="text-[5px] text-slate-300 uppercase tracking-[0.3em]">© 2026 FreelancerOS</div>
      <div className="text-[5px] text-slate-300 uppercase tracking-[0.3em]">Confidential</div>
    </div>
  </div>
);

const CorporatePreview: React.FC<{ scrollY: number }> = ({ scrollY }) => (
  <div
    style={{ transform: `translateY(${-scrollY * 0.4}px)`, transition: "transform 0.15s ease-out" }}
    className="w-full text-slate-900 p-5 space-y-4"
  >
    <div className="bg-slate-900 text-white px-4 py-3 -mx-5 -mt-5 mb-4">
      <div className="font-sans text-[10px] font-black uppercase tracking-widest">PROFESSIONAL SERVICES AGREEMENT</div>
      <div className="text-[5px] text-slate-400 mt-1">VERIFIED DOCUMENT · ID: PQ7C4X · CODE: 202-A</div>
    </div>
    <div className="space-y-4">
      {["1. SCOPE OF SERVICES","2. COMPENSATION","3. DELIVERABLES","4. IP RIGHTS","5. TERMINATION"].map((s, i) => (
        <div key={s} className="space-y-1.5">
          <div className="font-sans text-[7px] font-black text-slate-900 border-l-2 border-slate-900 pl-2">{s}</div>
          <div className="h-1 bg-slate-200 rounded w-full" />
          <div className="h-1 bg-slate-200 rounded w-4/5" />
          {i % 2 === 0 && <div className="h-1 bg-slate-200 rounded w-3/5" />}
        </div>
      ))}
    </div>
    <div className="pt-3 border-t-2 border-slate-900 flex justify-between">
      <div className="text-[5px] font-bold uppercase tracking-widest text-slate-900">Document Protected</div>
      <div className="text-[5px] font-bold uppercase tracking-widest text-slate-400">© 2026</div>
    </div>
  </div>
);

const templates: Template[] = [
  {
    id: "Free",
    title: "Free Version",
    description: "Clean monospace layout. Ideal for quick agreements and straightforward projects.",
    accent: "#64748b",
    accentLight: "#f1f5f9",
    preview: FreePreview,
    structure: ["Parties", "Services", "Compensation", "Timeline", "IP Rights", "Signatures"],
  },
  {
    id: "Premium",
    title: "Premium AI Style",
    description: "Serif typography with immutable document IDs. Polished and verifiable.",
    badge: "RECOMMENDED",
    badgeColor: "bg-indigo-600",
    accent: "#4f46e5",
    accentLight: "#eef2ff",
    preview: PremiumPreview,
    structure: ["Parties", "Services", "Compensation", "IP Rights", "Confidentiality", "Termination", "Signatures"],
  },
  {
    id: "Modern Corporate",
    title: "Modern Corporate",
    description: "Executive sans-serif. Strong headers, structured sections for B2B deals.",
    badge: "NEW",
    badgeColor: "bg-slate-900",
    accent: "#0f172a",
    accentLight: "#f8fafc",
    preview: CorporatePreview,
    structure: ["Cover Block", "Scope of Services", "Compensation", "Deliverables", "IP Rights", "Termination", "Legal Footer"],
  },
];

interface Props {
  selected: TemplateType;
  onSelect: (t: TemplateType) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function TemplateSelector({ selected, onSelect, onConfirm, onBack }: Props) {
  const [hoveredId, setHoveredId] = useState<TemplateType | null>(null);
  const [scrollY, setScrollY] = useState<Record<TemplateType, number>>({ Free: 0, Premium: 0, "Modern Corporate": 0 });
  const [viewMode, setViewMode] = useState<"preview" | "structure">("preview");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMouseMove = useCallback((id: TemplateType, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const pct = relY / rect.height;
    setScrollY(prev => ({ ...prev, [id]: pct * 80 }));
  }, []);

  const selectedTemplate = templates.find(t => t.id === selected)!;

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-950 tracking-tight">Choose Your Contract Style</h2>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
          Each template is pre-loaded with professional clauses and protection terms. Hover to scroll through the full document.
        </p>
      </div>

      {/* Template Cards + Live Preview */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Cards Grid */}
        <div className="grid sm:grid-cols-3 gap-5">
          {templates.map((tpl) => {
            const isSelected = selected === tpl.id;
            const isHovered = hoveredId === tpl.id;
            const Preview = tpl.preview;

            return (
              <div
                key={tpl.id}
                ref={el => { cardRefs.current[tpl.id] = el; }}
                onMouseMove={(e) => handleMouseMove(tpl.id, e)}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(tpl.id)}
                className={`
                  relative flex flex-col rounded-[2rem] border-2 cursor-pointer
                  transition-all duration-300 overflow-hidden
                  ${isSelected
                    ? "border-indigo-500 shadow-[0_8px_40px_rgba(99,102,241,0.25)] scale-[1.02]"
                    : isHovered
                    ? "border-slate-300 shadow-[0_12px_40px_rgba(15,23,42,0.12)] scale-[1.02]"
                    : "border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
                  }
                  bg-white
                `}
              >
                {/* Badge */}
                {tpl.badge && (
                  <div className={`absolute top-3 right-3 z-10 ${tpl.badgeColor} text-white font-bold text-[8px] px-2 py-0.5 rounded-full tracking-widest uppercase`}>
                    {tpl.badge}
                  </div>
                )}

                {/* Document Preview Viewport */}
                <div
                  className={`
                    relative w-full overflow-hidden bg-white
                    transition-all duration-300
                  `}
                  style={{ height: isHovered ? "220px" : "180px" }}
                >
                  {/* Paper texture background */}
                  <div
                    className="absolute inset-0 transition-transform duration-300"
                    style={{
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                      transformOrigin: "top center",
                    }}
                  >
                    <Preview scrollY={isHovered ? scrollY[tpl.id] : 0} />
                  </div>

                  {/* Bottom fade */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                    style={{
                      background: "linear-gradient(to bottom, transparent, white)"
                    }}
                  />

                  {/* Hover instruction */}
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full">
                        Move cursor to scroll
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div
                  className={`p-4 border-t-2 transition-colors duration-300 flex-1`}
                  style={{ borderColor: isSelected ? tpl.accent : "#f1f5f9", background: isSelected ? tpl.accentLight : "white" }}
                >
                  <h4 className="font-bold text-slate-950 text-sm">{tpl.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div
                    className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: tpl.accent }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Preview Panel */}
        <div className="hidden lg:block sticky top-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Preview</div>
            <div className="flex ml-auto bg-slate-100 p-0.5 rounded-lg">
              {(["preview", "structure"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                >
                  {m === "preview" ? "Preview" : "Structure"}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-[1.5rem] border-2 overflow-hidden transition-all duration-300"
            style={{ borderColor: selectedTemplate.accent + "40" }}
          >
            {viewMode === "preview" ? (
              <div className="bg-white h-[400px] overflow-y-auto">
                <selectedTemplate.preview scrollY={0} />
              </div>
            ) : (
              <div className="bg-white p-5 space-y-2 h-[400px]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Document Sections</div>
                {selectedTemplate.structure.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ background: selectedTemplate.accent }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 text-center leading-relaxed">
            AI will inject protective clauses automatically
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">How It Works</div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", icon: "📋", title: "Enter Details", desc: "Fill in parties, scope, and compensation" },
            { step: "02", icon: "🎨", title: "Select Template", desc: "Choose a layout that fits your project type" },
            { step: "03", icon: "⚡", title: "Generate Document", desc: "AI crafts a full legal agreement in seconds" },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                {icon}
              </div>
              <div className="text-[9px] font-bold text-slate-300 tracking-widest">{step}</div>
              <div className="font-bold text-slate-900 text-sm">{title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
        <button
          onClick={onBack}
          className="text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          ← Back to Details
        </button>
        <button
          onClick={onConfirm}
          style={{ background: selectedTemplate.accent }}
          className="px-10 py-4 rounded-2xl font-bold text-sm text-white shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
        >
          <span>Use Template</span>
          <span className="opacity-70">→</span>
        </button>
        <button className="px-6 py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">
          Customize
        </button>
      </div>
    </div>
  );
}
