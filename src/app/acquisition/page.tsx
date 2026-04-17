import { WorkspaceShell } from "@/components/navigation";
import { LeadFinderPanel } from "@/components/acquisition";
import { PageSection } from "@/components/workspace";

export default function AcquisitionPage() {
  return (
    <WorkspaceShell
      eyebrow="Client Finder"
      title="Find Client Opportunities From Public Listings"
      description="Merge Arbeitnow and Remotive (always on), plus Adzuna when configured. Intent chips bias results toward freelance and contract-style work. Results are upserted into MongoDB for your workspace."
    >
      <PageSection
        title="Lead Finder"
        description="Search aggregates multiple sources, dedupes by URL, and persists leads to the database when MONGODB_URI is set."
      >
        <LeadFinderPanel />
      </PageSection>
    </WorkspaceShell>
  );
}
