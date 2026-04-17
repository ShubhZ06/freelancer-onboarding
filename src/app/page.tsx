import {
  DashboardHeader,
  FeaturePillars,
  MetricsOverview,
  PipelineTimeline,
  QuickActions,
} from "@/components/dashboard";
import { WorkspaceShell } from "@/components/navigation";

export default function Home() {
  return (
    <WorkspaceShell
      eyebrow="FOS Overview"
      title="A focused workspace that can grow one page at a time"
      description="The home page gives a high-level view, while dedicated feature pages keep future workflows cleaner, faster to scan, and easier to expand."
    >
      <DashboardHeader />
      <MetricsOverview />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <FeaturePillars />
        <QuickActions />
      </div>
      <PipelineTimeline />
    </WorkspaceShell>
  );
}
