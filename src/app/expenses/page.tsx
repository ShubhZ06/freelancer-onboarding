import { WorkspaceShell } from "@/components/navigation";
import { AiUsageDashboard } from "@/components/expenses";
import { InsightCard, ListCard, PageSection } from "@/components/workspace";

export default function ExpensesPage() {
  return (
    <WorkspaceShell
      eyebrow="Expenses"
      title="Spending, AI usage, and budget observation in one place"
      description="The unified AI usage panel aggregates provider data through a server proxy, normalizes limits, caches slow billing calls, and surfaces health before you hit hard caps."
    >
      <PageSection
        title="Unified AI usage dashboard"
        description="Backend proxy: third-party APIs are called only from this server. Save keys once via the form — httpOnly encrypted cookies if AI_USAGE_CREDENTIALS_SECRET is set, otherwise localStorage on this browser. Env vars still work as fallbacks. Responses are private, no-store, and TTL-cached per credential bundle."
      >
        <AiUsageDashboard />
      </PageSection>

      <PageSection
        title="AI operating cost snapshot"
        description="High-level burn metrics stay at the top for quick orientation; wire these to your accounting source when ready."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Monthly burn"
            value="$842"
            detail="Placeholder — connect ledger or usage rollup."
          />
          <InsightCard
            label="Budget usage"
            value="79%"
            detail="Aligns with observation thresholds on the panel above."
          />
          <InsightCard
            label="Waste candidates"
            value="4"
            detail="Subscriptions with low activity or weak recent value."
          />
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Environment variables"
          description="Server-only secrets and manual counters (never NEXT_PUBLIC_)."
        >
          <ListCard
            title="Keys & limits"
            items={[
              "AI_USAGE_CREDENTIALS_SECRET — 32+ random chars enables httpOnly AES-GCM cookie storage (recommended).",
              "OPENAI_MANUAL_SPEND_USD — optional server fallback when billing API is unavailable for sk keys.",
              "OPENAI_API_KEY / OPENAI_MONTHLY_BUDGET_USD — optional server fallbacks if the user has not saved keys in the UI.",
              "CURSOR_* and GEMINI_CLOUD_* — optional env fallbacks for manual quotas.",
              "ANTHROPIC_ADMIN_API_KEY — org Admin key (sk-ant-admin…) for live month-to-date cost via Anthropic Cost API (server-side).",
              "ANTHROPIC_MODELS_IN_USE — optional free-text list of Claude models (matches the form). ANTHROPIC_APPROX_SPEND_USD / ANTHROPIC_APPROX_BUDGET_USD — optional comfort bar when not using Admin API. Legacy: ANTHROPIC_CLAUDE_*.",
              "AI_USAGE_CACHE_TTL_SECONDS (default 600), AI_USAGE_WARN_PERCENT (75), AI_USAGE_CRITICAL_PERCENT (90).",
            ]}
          />
        </PageSection>

        <PageSection
          title="Next integrations"
          description="Extend the same normalized row model for more providers."
        >
          <ListCard
            title="Suggested upgrades"
            items={[
              "Google Cloud Billing API + service account for automated Gemini spend.",
              "Anthropic Console usage endpoint when you add Claude API keys.",
              "Webhooks on critical threshold to Slack or email before caps break workflows.",
            ]}
          />
        </PageSection>
      </div>
    </WorkspaceShell>
  );
}
