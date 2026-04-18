import { WorkspaceShell } from "@/components/navigation";
import { LeadFinderPanel } from "@/components/acquisition";
import { PageSection } from "@/components/workspace";

export default function AcquisitionPage() {
  return (
    <WorkspaceShell
      eyebrow="Find Clients"
      title="Discover New Client Opportunities Faster"
      description="Search opportunities, filter by your preferred work style, and move straight into pitching from one screen."
    >
      <PageSection
        title="Opportunity Search"
        description="Use keywords, location, and intent filters to find relevant opportunities and shortlist the best matches."
      >
        <LeadFinderPanel />
      </PageSection>
    </WorkspaceShell>
  );
}
