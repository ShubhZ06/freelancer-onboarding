import { WorkspaceShell } from "@/components/navigation";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function ExpensesPage() {
  const expenseSignals = [
    "Monthly spend trend by category: software, subcontractors, and ops.",
    "Renewal calendar for subscriptions so you can cancel before auto-charge.",
    "Margin alerts when tooling costs rise faster than project income.",
  ];

  return (
    <WorkspaceShell
      eyebrow="Expenses"
      title="Kill The Margin Leaks"
      description="Subscription creep is silent revenue loss. This page makes it loud."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <InsightCard label="Monthly Spend" value="$487" detail="Across 9 active subscriptions." tone="accent" tilt="left" />
        <InsightCard label="Renewing Soon" value="03" detail="Figma, Linear, Notion — all within 10 days." tone="yellow" tilt="none" />
        <InsightCard label="Margin" value="68%" detail="Healthy. Below 60% triggers alerts." tone="violet" tilt="right" />
      </div>

      <PageSection
        title="How This Module Helps"
        description="Expenses makes hidden costs visible so your freelance margin stays healthy."
        tone="yellow"
        eyebrow="Why"
      >
        <div className="border-4 border-black bg-[#fffdf5] p-5 neo-shadow-sm">
          <p className="text-lg font-bold leading-relaxed text-black">
            Review spend trends and renewal pressure in one place{" "}
            <span className="bg-[#ff6b6b] px-2">before</span> pricing your next client scope.
          </p>
        </div>
      </PageSection>

      <PageSection
        title="What You Can Do"
        description="Practical outcomes from this page."
        tone="cream"
        eyebrow="Actions"
      >
        <ListCard title="Expense Workflow" items={expenseSignals} tone="accent" />
      </PageSection>
    </WorkspaceShell>
  );
}
