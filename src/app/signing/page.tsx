import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function SigningPage() {
  return (
    <WorkspaceShell
      eyebrow="Signing"
      title="Track signature status without mixing it into contract drafting"
      description="Signing is a separate moment in the customer journey, so it should have its own clear page focused on trust, status, and proof."
    >
      <PageSection
        title="Signing operations"
        description="This page should help the freelancer answer three things quickly: who has viewed, who has signed, and what needs a reminder."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Sent envelopes"
            value="9"
            detail="Awaiting view or signature activity."
          />
          <InsightCard
            label="Viewed not signed"
            value="4"
            detail="The highest-priority group for reminders and follow-up."
          />
          <InsightCard
            label="Verified archives"
            value="27"
            detail="Signed files hashed, stored, and ready for audit lookup."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Recommended future modules"
          description="The page should emphasize status confidence and clear evidence trails."
        >
          <ListCard
            title="Primary modules"
            items={[
              "Envelope list grouped by status instead of a dense chronological table.",
              "Signature detail page with signer evidence, timestamps, and reminder history.",
              "Verification panel for hash checks and archive state.",
            ]}
          />
        </PageSection>

        <PageSection
          title="UX principle"
          description="Trust is the main design priority here."
        >
          <ListCard
            title="Best experience direction"
            items={[
              "Use a calm, high-clarity layout with explicit state transitions.",
              "Highlight tamper-evident proof and signed archive availability.",
              "Keep reminder actions near the envelope status rather than hidden in menus.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
