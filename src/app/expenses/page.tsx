import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function ExpensesPage() {
  return (
    <WorkspaceShell
      eyebrow="Expenses"
      title="A dedicated spending page for cost visibility and budget control"
      description="Expenses should live on their own page because the user needs a slower, more analytical view here than they do in acquisition or contracts."
    >
      <PageSection
        title="AI operating cost snapshot"
        description="This page should become the user’s financial control room for subscriptions, usage, and waste detection."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Monthly burn"
            value="$842"
            detail="Live subscription view across imported and connected sources."
          />
          <InsightCard
            label="Budget usage"
            value="79%"
            detail="Close enough to justify proactive alerting and review."
          />
          <InsightCard
            label="Waste candidates"
            value="4"
            detail="Subscriptions with low activity or weak recent value."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Recommended future modules"
          description="The spending experience should balance overview metrics with decision support."
        >
          <ListCard
            title="Primary modules"
            items={[
              "Monthly burn dashboard with category chart and month-over-month context.",
              "Subscription registry table with usage, renewal timing, and inactivity warnings.",
              "Tax export and budget alert center for practical operations work.",
            ]}
          />
        </PageSection>

        <PageSection
          title="UX principle"
          description="Users should quickly see where money is going and what action matters."
        >
          <ListCard
            title="Best experience direction"
            items={[
              "Keep the top of the page summary-heavy and the lower section detail-heavy.",
              "Surface alert thresholds and inactive tools before raw transaction lists.",
              "Let category and vendor filters persist so repeated financial reviews feel efficient.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
