import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function SigningPage() {
  const pipelineHints = [
    "Pending signatures are grouped by client priority and due date.",
    "Each envelope shows the last reminder time to prevent duplicate follow-ups.",
    "Signed contracts become evidence entries with timestamp and signer details.",
  ];

  return (
    <WorkspaceShell
      eyebrow="Signing"
      title="Don't Let Deals Go Cold"
      description="Track every signature, every envelope, every follow-up — in one timeline."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <InsightCard label="Awaiting Sign" value="04" detail="2 sent this morning. 1 overdue." tone="accent" tilt="left" />
        <InsightCard label="Signed" value="12" detail="This month. Above quarterly average." tone="yellow" tilt="none" />
        <InsightCard label="Reminders" value="03" detail="Auto-scheduled for tomorrow 9am." tone="violet" tilt="right" />
      </div>

      <PageSection
        title="How This Module Helps"
        description="Signing keeps revenue-moving contracts from stalling after proposal acceptance."
        tone="yellow"
        eyebrow="Why"
      >
        <div className="border-4 border-black bg-[#fffdf5] p-5 neo-shadow-sm">
          <p className="text-lg font-bold leading-relaxed text-black">
            One timeline tracks <span className="bg-black px-2 text-[#ffd93d]">draft sent</span>,{" "}
            <span className="bg-[#ff6b6b] px-2">opened</span>,{" "}
            <span className="bg-[#c4b5fd] px-2">signed</span>, and reminder points — so you can
            act before a deal goes cold.
          </p>
        </div>
      </PageSection>

      <PageSection
        title="What You Can Do"
        description="Practical actions this page supports."
        tone="cream"
        eyebrow="Actions"
      >
        <ListCard title="Signing Workflow" items={pipelineHints} tone="violet" />
      </PageSection>
    </WorkspaceShell>
  );
}
