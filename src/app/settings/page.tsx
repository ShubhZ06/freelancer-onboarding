import { WorkspaceShell } from "@/components/navigation";
import { ListCard, PageSection } from "@/components/workspace";
import { AuthBar } from "@/components/auth/AuthBar";

export default function SettingsPage() {
  const setupOutcomes = [
    "Business profile defaults prefill proposals and contracts automatically.",
    "Clause preferences keep legal language consistent across projects.",
    "Notification rules define when clients receive updates and warning nudges.",
  ];

  return (
    <WorkspaceShell
      eyebrow="Setup"
      title="Configure Once. Reuse Everywhere."
      description="Your best-practice process becomes the default for every client."
    >
      <AuthBar />

      <PageSection
        title="How This Module Helps"
        description="Setup turns your best-practice process into reusable defaults for every client."
        tone="yellow"
        eyebrow="Why"
      >
        <div className="border-4 border-black bg-[#fffdf5] p-5 neo-shadow-sm">
          <p className="text-lg font-bold leading-relaxed text-black">
            Configure <span className="bg-[#ffd93d] px-2">once</span>, then reuse across{" "}
            <span className="bg-[#ff6b6b] px-2">acquisition</span>,{" "}
            <span className="bg-[#c4b5fd] px-2">contracts</span>, and{" "}
            <span className="bg-black px-2 text-[#ffd93d]">communication</span> — without repetitive edits.
          </p>
        </div>
      </PageSection>

      <PageSection
        title="What You Can Do"
        description="Practical outcomes from this page."
        tone="cream"
        eyebrow="Actions"
      >
        <ListCard title="Setup Workflow" items={setupOutcomes} tone="yellow" />
      </PageSection>
    </WorkspaceShell>
  );
}
