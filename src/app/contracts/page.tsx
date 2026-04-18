"use client";

import { WorkspaceShell } from "@/components/navigation";
import { PageSection } from "@/components/workspace";
import { ContractWizard } from "@/components/contracts/ContractWizard";

export default function ContractsPage() {
  return (
    <WorkspaceShell
      eyebrow="Contract Generator"
      title="Draft A Contract Like A Machine"
      description="Three styles. Legally sound. Under two minutes."
    >
      <PageSection
        title="Contract Generator"
        description="Fill the form. Pick a style. Ship a draft."
        tone="cream"
        eyebrow="Step 01 → 02 → 03"
      >
        <div className="mt-8 border-4 border-black bg-white p-6 sm:p-8">
          <ContractWizard />
        </div>
      </PageSection>
    </WorkspaceShell>
  );
}
