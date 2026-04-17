"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AiUsageCredentials,
  AiUsageDashboardPayload,
  NormalizedUsageRow,
  UsageHealth,
} from "@/lib/ai-usage/types";

const LS_KEY = "fos_ai_usage_local_v1";

const healthStyles: Record<UsageHealth, { bar: string; label: string; badge: string }> = {
  ok: {
    bar: "bg-emerald-500",
    label: "text-emerald-800",
    badge: "border-black bg-emerald-100 text-emerald-900",
  },
  warn: {
    bar: "bg-amber-500",
    label: "text-amber-900",
    badge: "border-black bg-amber-100 text-amber-900",
  },
  critical: {
    bar: "bg-rose-600",
    label: "text-rose-800",
    badge: "border-black bg-rose-100 text-rose-900",
  },
  unknown: {
    bar: "bg-black/30",
    label: "text-black/60",
    badge: "border-black bg-swiss-muted text-black",
  },
};

function barWidth(row: NormalizedUsageRow): number {
  if (row.percentOfLimit != null) return row.percentOfLimit;
  if (row.syntheticPercent != null) return row.syntheticPercent;
  return 0;
}

function statusLabel(status: NormalizedUsageRow["sourceStatus"]): string {
  switch (status) {
    case "live":
      return "Live";
    case "manual_env":
      return "Manual";
    case "demo":
      return "Demo";
    case "error":
      return "Error";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}

function readLocalCreds(): AiUsageCredentials {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as AiUsageCredentials;
    return typeof o === "object" && o ? o : {};
  } catch {
    return {};
  }
}

function writeLocalCreds(c: AiUsageCredentials) {
  const keys = Object.keys(c).filter((k) => (c as Record<string, unknown>)[k] !== undefined);
  if (keys.length === 0) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(c));
}

export function AiUsageDashboard() {
  const [data, setData] = useState<AiUsageDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const storageRef = useRef<"httpOnly" | "localStorage">("localStorage");

  const [openAiKeyInput, setOpenAiKeyInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [openAiSpendInput, setOpenAiSpendInput] = useState("");
  const [cursorUsedInput, setCursorUsedInput] = useState("");
  const [cursorLimitInput, setCursorLimitInput] = useState("");
  const [geminiSpendInput, setGeminiSpendInput] = useState("");
  const [geminiBudgetInput, setGeminiBudgetInput] = useState("");
  const [anthropicAdminKeyInput, setAnthropicAdminKeyInput] = useState("");
  const [claudeModelsInput, setClaudeModelsInput] = useState("");
  const [claudeApproxSpendInput, setClaudeApproxSpendInput] = useState("");
  const [claudeApproxBudgetInput, setClaudeApproxBudgetInput] = useState("");

  const syncFormFromMeta = useCallback((payload: AiUsageDashboardPayload) => {
    const m = payload.meta;
    setBudgetInput(m.openaiMonthlyBudgetUsd != null ? String(m.openaiMonthlyBudgetUsd) : "");
    setOpenAiSpendInput(m.openaiManualSpendUsd != null ? String(m.openaiManualSpendUsd) : "");
    setCursorUsedInput(m.cursorFastRequestsUsed != null ? String(m.cursorFastRequestsUsed) : "");
    setCursorLimitInput(m.cursorFastRequestsLimit != null ? String(m.cursorFastRequestsLimit) : "");
    setGeminiSpendInput(m.geminiCloudSpendUsd != null ? String(m.geminiCloudSpendUsd) : "");
    setGeminiBudgetInput(m.geminiCloudBudgetUsd != null ? String(m.geminiCloudBudgetUsd) : "");
    setClaudeModelsInput(m.anthropicModelsInUse ?? "");
    setClaudeApproxSpendInput(
      m.anthropicApproxSpendUsd != null ? String(m.anthropicApproxSpendUsd) : ""
    );
    setClaudeApproxBudgetInput(
      m.anthropicApproxBudgetUsd != null ? String(m.anthropicApproxBudgetUsd) : ""
    );
    setOpenAiKeyInput("");
    setAnthropicAdminKeyInput("");
  }, []);

  const applyPayload = useCallback(
    (payload: AiUsageDashboardPayload) => {
      storageRef.current = payload.meta.secureCookieEnabled ? "httpOnly" : "localStorage";
      setData(payload);
      syncFormFromMeta(payload);
    },
    [syncFormFromMeta]
  );

  const fetchDashboard = useCallback(
    async (refresh: boolean, credentialsOverride?: AiUsageCredentials) => {
      setLoading(true);
      setErr(null);
      try {
        const httpOnly = storageRef.current === "httpOnly";

        if (httpOnly && credentialsOverride === undefined) {
          const url = refresh ? "/api/expenses/ai-usage?refresh=1" : "/api/expenses/ai-usage";
          const res = await fetch(url);
          const json = await res.json();
          if (!res.ok) {
            setErr(json.detail ?? json.error ?? "Request failed");
            setData(null);
            return;
          }
          applyPayload(json as AiUsageDashboardPayload);
          return;
        }

        const creds =
          credentialsOverride ?? (httpOnly ? {} : readLocalCreds());

        const res = await fetch("/api/expenses/ai-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh, credentials: creds }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErr(json.detail ?? json.error ?? "Request failed");
          setData(null);
          return;
        }
        applyPayload(json as AiUsageDashboardPayload);
      } catch {
        setErr("Network error");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [applyPayload]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/expenses/ai-usage");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErr(json.detail ?? json.error ?? "Request failed");
          setData(null);
          setLoading(false);
          return;
        }
        let payload = json as AiUsageDashboardPayload;

        if (!payload.meta.secureCookieEnabled) {
          const local = readLocalCreds();
          if (Object.keys(local).length > 0) {
            const res2 = await fetch("/api/expenses/ai-usage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credentials: local }),
            });
            const json2 = await res2.json();
            if (cancelled) return;
            if (!res2.ok) {
              setErr(json2.detail ?? json2.error ?? "Request failed");
              setData(null);
              setLoading(false);
              return;
            }
            payload = json2 as AiUsageDashboardPayload;
          }
        }

        applyPayload(payload);
      } catch {
        if (!cancelled) {
          setErr("Network error");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyPayload]);

  const httpOnly = storageRef.current === "httpOnly";

  const buildPatchFromForm = useCallback((): AiUsageCredentials => {
    const patch: AiUsageCredentials = {};
    if (openAiKeyInput.trim()) patch.openaiApiKey = openAiKeyInput.trim();
    if (anthropicAdminKeyInput.trim()) patch.anthropicAdminApiKey = anthropicAdminKeyInput.trim();
    if (budgetInput.trim()) {
      const n = Number.parseFloat(budgetInput);
      if (Number.isFinite(n) && n >= 0) patch.openaiMonthlyBudgetUsd = n;
    }
    if (openAiSpendInput.trim()) {
      const n = Number.parseFloat(openAiSpendInput);
      if (Number.isFinite(n) && n >= 0) patch.openaiManualSpendUsd = n;
    }
    if (cursorUsedInput.trim()) {
      const n = Number.parseFloat(cursorUsedInput);
      if (Number.isFinite(n) && n >= 0) patch.cursorFastRequestsUsed = n;
    }
    if (cursorLimitInput.trim()) {
      const n = Number.parseFloat(cursorLimitInput);
      if (Number.isFinite(n) && n > 0) patch.cursorFastRequestsLimit = n;
    }
    if (geminiSpendInput.trim()) {
      const n = Number.parseFloat(geminiSpendInput);
      if (Number.isFinite(n) && n >= 0) patch.geminiCloudSpendUsd = n;
    }
    if (geminiBudgetInput.trim()) {
      const n = Number.parseFloat(geminiBudgetInput);
      if (Number.isFinite(n) && n > 0) patch.geminiCloudBudgetUsd = n;
    }
    if (claudeApproxSpendInput.trim()) {
      const n = Number.parseFloat(claudeApproxSpendInput);
      if (Number.isFinite(n) && n >= 0) patch.anthropicApproxSpendUsd = n;
    }
    if (claudeApproxBudgetInput.trim()) {
      const n = Number.parseFloat(claudeApproxBudgetInput);
      if (Number.isFinite(n) && n > 0) patch.anthropicApproxBudgetUsd = n;
    }
    return patch;
  }, [
    openAiKeyInput,
    budgetInput,
    openAiSpendInput,
    cursorUsedInput,
    cursorLimitInput,
    geminiSpendInput,
    geminiBudgetInput,
    claudeApproxSpendInput,
    claudeApproxBudgetInput,
    anthropicAdminKeyInput,
  ]);

  async function handleSaveCredentials() {
    setSaveMsg(null);
    if (storageRef.current === "httpOnly") {
      const patch = buildPatchFromForm();
      const res = await fetch("/api/expenses/ai-usage/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: {
            ...patch,
            anthropicModelsInUse: claudeModelsInput.trim() || null,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setSaveMsg(j.error ?? "Save failed");
        return;
      }
      setSaveMsg("Saved to httpOnly cookie.");
      setOpenAiKeyInput("");
      setAnthropicAdminKeyInput("");
      await fetchDashboard(true);
      return;
    }

    const prev = readLocalCreds();
    const patch = buildPatchFromForm();
    const next: AiUsageCredentials = { ...prev, ...patch };
    if (!openAiKeyInput.trim() && prev.openaiApiKey) {
      next.openaiApiKey = prev.openaiApiKey;
    }
    if (!anthropicAdminKeyInput.trim() && prev.anthropicAdminApiKey) {
      next.anthropicAdminApiKey = prev.anthropicAdminApiKey;
    }
    if (!openAiSpendInput.trim() && prev.openaiManualSpendUsd != null) {
      next.openaiManualSpendUsd = prev.openaiManualSpendUsd;
    }
    if (!claudeModelsInput.trim()) {
      delete next.anthropicModelsInUse;
    } else {
      next.anthropicModelsInUse = claudeModelsInput.trim();
    }
    if (!claudeApproxSpendInput.trim() && prev.anthropicApproxSpendUsd != null) {
      next.anthropicApproxSpendUsd = prev.anthropicApproxSpendUsd;
    }
    if (!claudeApproxBudgetInput.trim() && prev.anthropicApproxBudgetUsd != null) {
      next.anthropicApproxBudgetUsd = prev.anthropicApproxBudgetUsd;
    }
    writeLocalCreds(next);
    setSaveMsg("Saved in this browser (localStorage).");
    setOpenAiKeyInput("");
    setAnthropicAdminKeyInput("");
    await fetchDashboard(true, next);
  }

  async function handleRemoveOpenAi() {
    setSaveMsg(null);
    if (storageRef.current === "httpOnly") {
      await fetch("/api/expenses/ai-usage/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearOpenAiApiKey: true, credentials: {} }),
      });
      setSaveMsg("OpenAI key removed from cookie.");
      await fetchDashboard(true);
      return;
    }
    const prev = readLocalCreds();
    delete prev.openaiApiKey;
    writeLocalCreds(prev);
    setSaveMsg("OpenAI key removed from localStorage.");
    await fetchDashboard(true, prev);
  }

  async function handleRemoveAnthropicAdmin() {
    setSaveMsg(null);
    if (storageRef.current === "httpOnly") {
      await fetch("/api/expenses/ai-usage/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAnthropicAdminApiKey: true, credentials: {} }),
      });
      setSaveMsg("Anthropic Admin key removed from cookie.");
      await fetchDashboard(true);
      return;
    }
    const prev = readLocalCreds();
    delete prev.anthropicAdminApiKey;
    writeLocalCreds(prev);
    setSaveMsg("Anthropic Admin key removed from localStorage.");
    await fetchDashboard(true, prev);
  }

  async function handleClearAllSaved() {
    setSaveMsg(null);
    if (storageRef.current === "httpOnly") {
      await fetch("/api/expenses/ai-usage/credentials", { method: "DELETE" });
      setSaveMsg("All saved credentials cleared.");
      setBudgetInput("");
      setOpenAiSpendInput("");
      setCursorUsedInput("");
      setCursorLimitInput("");
      setGeminiSpendInput("");
      setGeminiBudgetInput("");
      setClaudeModelsInput("");
      setClaudeApproxSpendInput("");
      setClaudeApproxBudgetInput("");
      setAnthropicAdminKeyInput("");
      await fetchDashboard(true, {});
      return;
    }
    localStorage.removeItem(LS_KEY);
    setBudgetInput("");
    setOpenAiSpendInput("");
    setClaudeModelsInput("");
    setClaudeApproxSpendInput("");
    setClaudeApproxBudgetInput("");
    setCursorUsedInput("");
    setCursorLimitInput("");
    setGeminiSpendInput("");
    setGeminiBudgetInput("");
    setAnthropicAdminKeyInput("");
    setSaveMsg("localStorage cleared.");
    await fetchDashboard(true, {});
  }

  const agg = data?.aggregateHealth ?? "unknown";
  const aggCls = healthStyles[agg];
  const secureCookie = data?.meta.secureCookieEnabled ?? false;

  return (
    <div className="space-y-6">
      <section className="border-4 border-black bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-swiss-accent">Saved credentials</p>
        <p className="mt-2 text-sm text-black/70">
          {secureCookie ? (
            <>
              <strong className="text-black">httpOnly mode:</strong> keys are encrypted server-side and stored in a
              cookie JavaScript cannot read. Set{" "}
              <code className="font-mono text-xs">AI_USAGE_CREDENTIALS_SECRET</code> (32+ random characters) in{" "}
              <code className="font-mono text-xs">.env.local</code>, then restart the dev server.
            </>
          ) : (
            <>
              <strong className="text-black">Browser mode:</strong> secrets are stored in{" "}
              <code className="font-mono text-xs">localStorage</code> on this device. Malicious scripts on this site could
              read them — prefer httpOnly mode for production.
            </>
          )}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            OpenAI API key
            <input
              type="password"
              autoComplete="off"
              value={openAiKeyInput}
              onChange={(e) => setOpenAiKeyInput(e.target.value)}
              placeholder={data?.meta.hasOpenAiKey ? "•••••••• (saved — paste to replace)" : "sk-…"}
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            OpenAI monthly budget (USD)
            <input
              type="text"
              inputMode="decimal"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="50"
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            OpenAI spend this month (USD) — manual
            <input
              type="text"
              inputMode="decimal"
              value={openAiSpendInput}
              onChange={(e) => setOpenAiSpendInput(e.target.value)}
              placeholder="From platform.openai.com billing"
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-black/50">
              Secret keys get HTTP 403 on OpenAI’s billing API; this number drives the bar instead.
            </span>
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Cursor fast requests used
            <input
              type="text"
              inputMode="numeric"
              value={cursorUsedInput}
              onChange={(e) => setCursorUsedInput(e.target.value)}
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Cursor fast requests limit
            <input
              type="text"
              inputMode="numeric"
              value={cursorLimitInput}
              onChange={(e) => setCursorLimitInput(e.target.value)}
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Gemini / GCP spend (USD)
            <input
              type="text"
              inputMode="decimal"
              value={geminiSpendInput}
              onChange={(e) => setGeminiSpendInput(e.target.value)}
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Gemini / GCP budget (USD)
            <input
              type="text"
              inputMode="decimal"
              value={geminiBudgetInput}
              onChange={(e) => setGeminiBudgetInput(e.target.value)}
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60 sm:col-span-2">
            Anthropic Admin API key (live Claude cost)
            <input
              type="password"
              autoComplete="off"
              value={anthropicAdminKeyInput}
              onChange={(e) => setAnthropicAdminKeyInput(e.target.value)}
              placeholder={
                data?.meta.hasAnthropicAdminKey
                  ? "•••••••• (saved — paste sk-ant-admin… to replace)"
                  : "sk-ant-admin… (org Admin key — not your Claude API key)"
              }
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-black/50">
              Enables automatic month-to-date USD from Anthropic&apos;s cost report (org accounts only). Create under Claude
              Console → Admin API keys. Refreshes with the dashboard; data is typically up to date within a few minutes.
            </span>
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60 sm:col-span-2">
            Claude / Anthropic — models in use
            <textarea
              value={claudeModelsInput}
              onChange={(e) => setClaudeModelsInput(e.target.value)}
              rows={3}
              placeholder={
                "e.g. claude-sonnet-4-20250514, claude-opus-4-20250514, Cursor · Claude (auto)"
              }
              className="w-full resize-y border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-black/50">
              No Anthropic Console numbers needed — this is your own inventory of which Claude models/tools you rely on.
              Clear the box and save to remove.
            </span>
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Claude — rough spend this month (USD), optional
            <input
              type="text"
              inputMode="decimal"
              value={claudeApproxSpendInput}
              onChange={(e) => setClaudeApproxSpendInput(e.target.value)}
              placeholder="Ballpark from invoice or Console"
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-black/50">
              When an Admin API key is saved, spend on the bar comes from Anthropic automatically — this field is only for
              manual mode.
            </span>
          </label>
          <label className="block space-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/60">
            Claude — comfort budget (USD / mo), optional
            <input
              type="text"
              inputMode="decimal"
              value={claudeApproxBudgetInput}
              onChange={(e) => setClaudeApproxBudgetInput(e.target.value)}
              placeholder="e.g. 100"
              className="w-full border-2 border-black bg-swiss-muted px-3 py-2 text-sm text-black outline-none focus:border-swiss-accent"
            />
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-black/50">
              Used with live API spend (Admin key) or with manual spend above — sets the bar limit.
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleSaveCredentials()}
            className="border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-swiss-accent hover:text-black"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => void handleRemoveOpenAi()}
            disabled={!data?.meta.hasOpenAiKey}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-swiss-muted disabled:opacity-40"
          >
            Remove OpenAI key
          </button>
          <button
            type="button"
            onClick={() => void handleRemoveAnthropicAdmin()}
            disabled={!data?.meta.hasAnthropicAdminKey}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-swiss-muted disabled:opacity-40"
          >
            Remove Anthropic Admin key
          </button>
          <button
            type="button"
            onClick={() => void handleClearAllSaved()}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-700 hover:bg-rose-50"
          >
            Clear all saved
          </button>
        </div>
        {saveMsg ? <p className="mt-3 text-sm font-medium text-black">{saveMsg}</p> : null}
      </section>

      <div className="flex flex-col gap-4 border-2 border-black bg-swiss-muted p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-black/60">Observation</p>
          <p className={`mt-1 text-lg font-black uppercase tracking-tight ${aggCls.label}`}>
            Workspace health: {agg}
          </p>
          <p className="mt-1 text-xs text-black/60">
            Warn ≥ {data?.warnPercent ?? "—"}% · Critical ≥ {data?.criticalPercent ?? "—"}%
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchDashboard(false)}
            disabled={loading}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => void fetchDashboard(true)}
            disabled={loading}
            className="border-2 border-black bg-swiss-accent px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:opacity-50"
          >
            Force reload
          </button>
        </div>
      </div>

      {err ? (
        <p className="border-2 border-black bg-swiss-accent px-4 py-3 text-sm font-medium text-black">{err}</p>
      ) : null}

      {data ? (
        <p className="text-xs text-black/60">
          {data.cache.hit
            ? `Served from cache · age ${data.cache.ageSeconds ?? 0}s · TTL ${data.cache.ttlSeconds}s`
            : `Fresh fetch · TTL ${data.cache.ttlSeconds}s`}
          {" · "}
          <span className="font-mono text-black/80">{data.generatedAt}</span>
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-1">
        {(data?.providers ?? []).map((row) => {
          const h = healthStyles[row.health];
          const w = barWidth(row);
          return (
            <article key={row.providerId} className="border-4 border-black bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-swiss-accent">
                    {row.displayName}
                  </p>
                  <p className="mt-2 text-2xl font-black uppercase tracking-tight text-black">{row.displayPrimary}</p>
                  {row.displaySecondary ? (
                    <p className="mt-1 text-sm text-black/70">{row.displaySecondary}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`border-2 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${h.badge}`}
                  >
                    {row.health}
                  </span>
                  <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                    {statusLabel(row.sourceStatus)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                  <span>Usage</span>
                  <span>{row.limitLabel ?? "Limit unknown"}</span>
                </div>
                <div className="mt-2 h-3 border-2 border-black bg-swiss-muted">
                  <div className={`h-full transition-all ${h.bar}`} style={{ width: `${Math.min(100, w)}%` }} />
                </div>
                <p className="mt-2 text-[10px] font-mono text-black/45">Polled {row.polledAt}</p>
                {row.detail ? (
                  <p className="mt-2 border-2 border-black bg-swiss-muted p-2 text-xs text-black/80">{row.detail}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {data?.notes?.length ? (
        <ul className="list-inside list-disc space-y-1 border-2 border-black bg-white p-4 text-sm text-black/70">
          {data.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
