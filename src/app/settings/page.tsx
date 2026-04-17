import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function SettingsPage() {
  return (
    <WorkspaceShell
      eyebrow="Setup"
      title="A setup page for profile, templates, integrations, and preferences"
      description="This page gives future configuration work a home so operational pages stay focused on daily execution instead of admin tasks."
    >
      <PageSection
        title="Why setup deserves its own destination"
        description="Freelancers should be able to configure the system once and then spend most of their time in action-oriented pages."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Profile completion"
            value="72%"
            detail="Legal identity, rates, jurisdiction, and service defaults."
          />
          <InsightCard
            label="Connected sources"
            value="5"
            detail="Lead, billing, and communication integrations."
          />
          <InsightCard
            label="Templates ready"
            value="6"
            detail="Contract categories seeded for quick generation."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Recommended future modules"
          description="This page should collect admin-oriented workflows that support the rest of the product."
        >
          <ListCard
            title="Primary modules"
            items={[
              "Freelancer profile and commercial defaults editor.",
              "Contract template, clause, and signature preference management.",
              "Lead source, payments, notifications, and budget integration settings.",
            ]}
          />
        </PageSection>

        <PageSection
          title="UX principle"
          description="Configuration should feel calm, explicit, and safely separated from live workflow actions."
        >
          <ListCard
            title="Best experience direction"
            items={[
              "Group settings by business function instead of technical provider names.",
              "Use progress indicators so onboarding feels finite and achievable.",
              "Keep risky changes like jurisdiction or signature defaults clearly explained before save.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
