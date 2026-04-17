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
          <ContractWizard onContractSent={handleContractSent} />
        </div>
      </PageSection>

      <PageSection
        title="Your Contracts"
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
        </div>
      </PageSection>
    </WorkspaceShell>
  );
}
