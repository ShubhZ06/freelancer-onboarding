import type { ContractResult } from "@/lib/contract-engine";

type TemplateType = "Free" | "Premium" | "Modern Corporate";

type Props = {
  result: ContractResult;
  templateType: TemplateType;
  onBack: () => void;
  onGenerateAnother: () => void;
  onSend: () => void;
};

const templateMeta: Record<TemplateType, { tone: string; ribbon: string; label: string; paper: string }> = {
  Free: {
    tone: "bg-[#ffd93d]",
    ribbon: "Plain Sheet",
    label: "Free",
    paper: "bg-[#fffdf5]",
  },
  Premium: {
    tone: "bg-[#ff6b6b]",
    ribbon: "Premium Draft",
    label: "Premium",
    paper: "bg-white",
  },
  "Modern Corporate": {
    tone: "bg-[#c4b5fd]",
    ribbon: "Corporate Memo",
    label: "Corporate",
    paper: "bg-white",
  },
};

function splitContractLines(contract: string) {
  return contract.split("\n").filter((line) => line.trim().length > 0);
}

export function ContractCanvas({ result, templateType, onBack, onGenerateAnother, onSend }: Props) {
  const meta = templateMeta[templateType];
  const lines = splitContractLines(result.contract);

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-4 border-black bg-black p-4 neo-shadow-sm no-print">
        <button type="button" onClick={onBack} className="neo-btn neo-btn-ghost border-[#ffd93d] text-[#ffd93d] hover:border-[#ffd93d] hover:bg-[#ffd93d] hover:text-black">
          ← Back to Styles
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onGenerateAnother} className="neo-btn neo-btn-secondary text-xs">
            Edit Details
          </button>
          <button type="button" onClick={onSend} className="neo-btn neo-btn-primary text-xs">
            Send for Signature →
          </button>
        </div>
      </div>

      <section className={`relative overflow-hidden border-4 border-black neo-shadow-lg ${meta.paper}`}>
        {/* Header strip */}
        <header className={`flex flex-wrap items-start justify-between gap-4 border-b-4 border-black ${meta.tone} px-6 py-5 sm:px-10`}>
          <div className="space-y-2">
            <span className="neo-tag neo-tag-dark">Contract Canvas</span>
            <h2 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-black sm:text-5xl">
              {meta.label}
            </h2>
            <p className="max-w-xl text-sm font-bold leading-snug text-black">
              Generated agreement rendered onto a paper-like canvas.
            </p>
          </div>
          <div className="border-4 border-black bg-white px-4 py-3 neo-shadow-sm">
            <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-black">
              Mode
            </p>
            <p className="font-heading mt-1 text-xl font-black uppercase text-black">
              {meta.ribbon}
            </p>
          </div>
        </header>

        {/* Body grid */}
        <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Agreement body */}
          <div className="border-4 border-black bg-[#fffdf5] neo-shadow-md">
            <div className="flex items-center justify-between border-b-4 border-black bg-black px-5 py-4">
              <div>
                <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-[#ffd93d]">
                  Canvas View
                </p>
                <p className="font-heading text-2xl font-black uppercase text-white">Agreement Body</p>
              </div>
              <span className="neo-pill neo-tag-yellow">
                {result.isDraft ? "Draft" : "Final"}
              </span>
            </div>
            <div className="space-y-3 p-5">
              {lines.slice(0, 18).map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className={`border-b-[3px] border-dashed border-black/20 pb-2 text-sm font-bold leading-relaxed text-black ${
                    index === 0 ? "font-heading !text-2xl uppercase tracking-tight" : ""
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border-4 border-black bg-[#ffd93d] p-5 neo-shadow-sm">
              <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-black">
                Plain English Summary
              </p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-black">
                {result.summary}
              </p>
            </div>

            <div className="border-4 border-black bg-[#c4b5fd] p-5 neo-shadow-sm">
              <p className="font-heading text-[10px] font-black uppercase tracking-[0.25em] text-black">
                Template Cues
              </p>
              <ul className="mt-3 space-y-2 text-sm font-bold text-black">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-black" />
                  Style: {templateType}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-black" />
                  Paper tone changes per template
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-black" />
                  Same legal content, different presentation
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="neo-tag">
                Client: {result.contract.includes("CLIENT:") ? "Included" : "Draft"}
              </span>
              <span className="neo-tag neo-tag-accent">
                {templateType}
              </span>
              <span className="neo-tag neo-tag-yellow">
                ID: {result.detectedType.slice(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
