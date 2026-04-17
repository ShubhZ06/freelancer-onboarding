import {
  DashboardHeader,
  FeaturePillars,
  MetricsOverview,
  PipelineTimeline,
  QuickActions,
} from "@/components/dashboard";
import { AuthBar } from "@/components/auth/AuthBar";
import { WorkspaceShell } from "@/components/navigation";

export default function DashboardPage() {
  return (
    <WorkspaceShell
      eyebrow="Dashboard"
      title="Command center for the freelancer workspace"
      description="Overview first, then the operational modules: leads, contracts, signing, messages, spending, and setup."
    >
      <AuthBar />
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
