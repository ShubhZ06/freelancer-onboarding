"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/components/navigation";
import { PageSection } from "@/components/workspace";
import { ContractWizard } from "@/components/contracts/ContractWizard";
import { ContractCard, type ContractData } from "@/components/contracts";

// Demo contracts -- replace with real data from MongoDB / API in production
type ContractListItem = ContractData & { initialStatus: string; signingUrl?: string };

const DEMO_CONTRACTS: ContractListItem[] = [
  {
    id: "contract-001",
    title: "Website Redesign SOW -- Acme Corp",
    clientName: "Sarah Chen",
    clientEmail: "sarah@acmecorp.com",
    userId: "user_demo_001",
    pdfBase64: "",
    initialStatus: "Ready to Send",
  },
  {
    id: "contract-002",
    title: "Monthly Retainer Agreement -- Nova Labs",
    clientName: "Marcus Rivera",
    clientEmail: "marcus@novalabs.io",
    userId: "user_demo_001",
    pdfBase64: "",
    initialStatus: "Ready to Send",
  },
  {
    id: "contract-003",
    title: "Brand Identity Package -- Bloom Studio",
    clientName: "Emily Tanaka",
    clientEmail: "emily@bloomstudio.co",
    userId: "user_demo_001",
    pdfBase64: "",
    initialStatus: "Draft",
  },
  {
    id: "contract-004",
    title: "API Integration Scope -- FinEdge",
    clientName: "David Park",
    clientEmail: "david@finedge.com",
    userId: "user_demo_001",
    pdfBase64: "",
    initialStatus: "Signed",
  },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractListItem[]>(DEMO_CONTRACTS);

  const handleContractSent = (contract: {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    signingUrl: string;
    status: string;
  }) => {
    setContracts((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== contract.id);
      return [
        {
          id: contract.id,
          title: contract.title,
          clientName: contract.clientName,
          clientEmail: contract.clientEmail,
          userId: "user_demo_001",
          pdfBase64: "",
          initialStatus: contract.status,
          signingUrl: contract.signingUrl,
        },
        ...withoutCurrent,
      ];
    });
  };

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
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20">
          <ContractWizard onContractSent={handleContractSent} />
        </div>
      </PageSection>

      <PageSection
        title="Your contracts"
        description="Click 'Send to Client' to create a Documenso signing envelope."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              initialStatus={c.initialStatus}
              initialSigningUrl={c.signingUrl}
            />
          ))}
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
