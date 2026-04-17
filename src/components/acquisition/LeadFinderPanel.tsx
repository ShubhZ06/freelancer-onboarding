"use client";

import { useCallback, useState } from "react";
import type { IntentPreset, Lead, LeadSearchResponse } from "@/lib/acquisition/types";
import { INTENT_PRESETS } from "@/lib/acquisition/intent";
import { PitchModal } from "./PitchModal";

const INTENT_KEYS = Object.keys(INTENT_PRESETS) as IntentPreset[];

export function LeadFinderPanel() {
  const [q, setQ] = useState("");
  const [where, setWhere] = useState("");
  const [intents, setIntents] = useState<IntentPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LeadSearchResponse | null>(null);
  const [pitchLead, setPitchLead] = useState<Lead | null>(null);

  const toggleIntent = (key: IntentPreset) => {
    setIntents((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (where.trim()) params.set("where", where.trim());
      for (const i of intents) params.append("intent", i);

      const res = await fetch(`/api/acquisition/leads?${params}`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const json = (await res.json()) as LeadSearchResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, where, intents]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-800">
          Client opportunities
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Listings from Arbeitnow, Remotive, Remote OK, and optional Adzuna/Jooble/USAJOBS. Leave intent chips off for the broadest results; add chips to bias toward freelance/contract language.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Keywords
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. react, copywriter, fractional CFO"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-medium text-slate-600 sm:w-48">
            Location (Adzuna)
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. London"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
            />
          </label>
          <button
            type="button"
            onClick={() => void search()}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {INTENT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleIntent(key)}
              className={
                intents.includes(key)
                  ? "rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              }
            >
              {INTENT_PRESETS[key].label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {data?.demo ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Demo mode: showing sample leads. Configure APIs and MongoDB, or adjust
          keywords/intent filters for live matches.
        </div>
      ) : null}

      {data?.warnings?.length ? (
        <ul className="list-inside list-disc text-xs text-slate-600">
          {data.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {data?.persisted ? (
        <p className="text-xs text-emerald-700">
          Saved to MongoDB ({data.leads.length} row(s) upserted this request).
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {(data?.leads ?? []).map((lead) => (
          <li
            key={lead.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {lead.title}
                </p>
                <p className="text-sm text-slate-600">
                  {lead.companyName}
                  {lead.location ? ` · ${lead.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {lead.source}
                </span>
                {lead.rawJobType ? (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-900">
                    {lead.rawJobType}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {lead.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPitchLead(lead)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send pitch
              </button>
              <a
                href={lead.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-500 hover:text-indigo-700 hover:underline"
              >
                View listing ↗
              </a>
              {lead.source === "remotive" ? (
                <span className="text-xs text-slate-400">
                  via{" "}
                  <a
                    href="https://remotive.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Remotive
                  </a>
                </span>
              ) : lead.source === "remoteok" ? (
                <span className="text-xs text-slate-400">
                  via{" "}
                  <a
                    href="https://remoteok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Remote OK
                  </a>
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {!loading && data && data.leads.length === 0 ? (
        <p className="text-sm text-slate-600">No rows to show.</p>
      ) : null}

      {pitchLead ? (
        <PitchModal lead={pitchLead} onClose={() => setPitchLead(null)} />
      ) : null}
    </div>
  );
}
