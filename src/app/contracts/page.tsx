import { WorkspaceShell } from "@/components/navigation";
import { PageSection } from "@/components/workspace";
import { ContractWizard } from "@/components/contracts/ContractWizard";

export default function ContractsPage() {
  return (
    <WorkspaceShell
      eyebrow="Contracts"
      title="A dedicated contract workspace built for speed and clarity"
      description="Contracts deserve their own page because they carry legal weight. Generate, review, and send without ambiguity."
    >
      <PageSection
        title="Smart Contract Generator"
        description="Fill in what you know. Our engine will suggest the best structure and include necessary protection clauses automatically."
      >
        <div className="mt-8 border-4 border-black bg-white p-6 sm:p-8">
          <ContractWizard />
        </div>
      </PageSection>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <PageSection
          title="UX Principles Applied"
          description="How we ensure legal clarity and freelancer protection."
        >
          <div className="space-y-4">
            <div className="flex gap-4 border-2 border-black bg-swiss-muted p-4">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-xs font-black text-black">01</div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-black">Plain Language First</p>
                <p className="text-sm text-black/70">Every contract is paired with a summary to reduce legal anxiety.</p>
              </div>
            </div>
            <div className="flex gap-4 border-2 border-black bg-swiss-muted p-4">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-swiss-accent text-xs font-black text-black">02</div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-black">Response Guard</p>
                <p className="text-sm text-black/70">48-hour auto-approval clauses are injected into every agreement.</p>
              </div>
            </div>
          </div>
        </PageSection>

        <PageSection
          title="Draft Mode System"
          description="Don't let missing data stop your momentum."
        >
          <div className="border-2 border-dashed border-black bg-white p-6">
            <p className="text-sm leading-relaxed text-black/70 italic">
              "Missing fields are automatically replaced with 'To be confirmed'. Agreements become binding once final variables are settled in a follow-up version."
            </p>
          </div>
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
