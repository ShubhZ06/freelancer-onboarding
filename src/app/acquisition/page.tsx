import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function AcquisitionPage() {
  return (
    <WorkspaceShell
      eyebrow="Acquisition"
      title="One place for lead discovery, qualification, and outreach review"
      description="This page should become the daily working area for prospecting. It keeps sourcing, fit scoring, and approval decisions together so the user can stay in flow."
    >
      <PageSection
        title="Why this page exists"
        description="Lead work is noisy by nature, so the UX should prioritize triage first: what is new, what is high fit, and what needs approval right now."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="New leads"
            value="18"
            detail="Freshly synced from LinkedIn, Upwork, and social monitoring."
          />
          <InsightCard
            label="Approval queue"
            value="7"
            detail="Drafted pitches waiting for freelancer review."
          />
          <InsightCard
            label="Reply rate"
            value="14%"
            detail="A useful future benchmark for prompt and portfolio tuning."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Recommended future modules"
          description="These sections give the best UX shape for this area without overloading one screen."
        >
          <div className="grid gap-4">
            <ListCard
              title="Primary modules"
              items={[
                "Lead inbox with filters for source, fit score, and timeline.",
                "Approval queue with side-by-side lead summary and drafted pitch.",
                "Lead detail panel with source payload, fit rationale, and activity timeline.",
              ]}
            />
          </div>
        </PageSection>

        <PageSection
          title="UX principle"
          description="Users should move from scanning to deciding in very few steps."
        >
          <ListCard
            title="Best experience direction"
            items={[
              "Show the highest-fit leads first instead of a flat table.",
              "Keep editing inline so approval never feels like a context switch.",
              "Separate monitoring metrics from action-heavy review surfaces.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
