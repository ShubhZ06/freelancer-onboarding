import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function ContractsPage() {
  return (
    <WorkspaceShell
      eyebrow="Contracts"
      title="A dedicated contract workspace built for speed and clarity"
      description="Contracts deserve their own page because they carry legal weight. The UX should help users move from template selection to review and send without ambiguity."
    >
      <PageSection
        title="Core contract view"
        description="This page should center around contract creation and review rather than dashboard-style analytics."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Draft contracts"
            value="12"
            detail="Contracts assembled from templates and project variables."
          />
          <InsightCard
            label="Ready to send"
            value="3"
            detail="PDFs rendered and waiting for final freelancer review."
          />
          <InsightCard
            label="Versioned safely"
            value="100%"
            detail="Every sent document should map back to an immutable version."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Recommended future modules"
          description="The contract area should stay structured and document-first."
        >
          <ListCard
            title="Primary modules"
            items={[
              "Contract generator wizard driven by profile defaults and client variables.",
              "Template and clause selector with category-specific defaults.",
              "Version history panel with PDF status and send readiness indicators.",
            ]}
          />
        </PageSection>

        <PageSection
          title="UX principle"
          description="Reduce legal anxiety by making state and wording easy to trust."
        >
          <ListCard
            title="Best experience direction"
            items={[
              "Always show contract status clearly: draft, rendered, sent, signed.",
              "Pair the legal document with a plain-language summary preview.",
              "Use step-by-step creation instead of exposing all fields at once.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
