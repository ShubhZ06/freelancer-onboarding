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
      <div className="border-4 border-black bg-white p-5 swiss-dots">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-swiss-accent">
          Client opportunities
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/70">
          Listings from Arbeitnow, Remotive, Remote OK, and optional Adzuna/Jooble/USAJOBS. Leave intent chips off for the broadest results; add chips to bias toward freelance/contract language.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_240px_auto] lg:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs font-black uppercase tracking-[0.24em] text-black/60">
            Keywords
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. react, copywriter, fractional CFO"
              className="border-2 border-black bg-white px-3 py-3 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-black uppercase tracking-[0.24em] text-black/60">
            Location (Adzuna)
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. London"
              className="border-2 border-black bg-white px-3 py-3 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
          <button
            type="button"
            onClick={() => void search()}
            disabled={loading}
            className="border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
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
                  ? "border-2 border-black bg-swiss-accent px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-black"
                  : "border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-black hover:bg-swiss-muted"
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
        <div className="border-2 border-black bg-swiss-accent px-4 py-3 text-sm font-medium text-black">
          Demo mode: showing sample leads. Configure APIs and MongoDB, or adjust
          keywords/intent filters for live matches.
        </div>
      ) : null}

      {data?.warnings?.length ? (
        <ul className="list-inside list-disc text-xs text-black/70">
          {data.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {data?.persisted ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black">
          Saved to MongoDB ({data.leads.length} row(s) upserted this request).
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {(data?.leads ?? []).map((lead) => (
          <li
            key={lead.id}
            className="border-2 border-black bg-white p-4 transition-colors duration-150 hover:bg-swiss-muted"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-black uppercase tracking-tight text-black">
                  {lead.title}
                </p>
                <p className="text-sm text-black/70">
                  {lead.companyName}
                  {lead.location ? ` · ${lead.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="border-2 border-black bg-black px-2 py-0.5 text-xs font-black uppercase tracking-[0.2em] text-white">
                  {lead.source}
                </span>
                {lead.rawJobType ? (
                  <span className="border-2 border-black bg-swiss-accent px-2 py-0.5 text-xs font-black uppercase tracking-[0.2em] text-black">
                    {lead.rawJobType}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              {lead.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPitchLead(lead)}
                className="border-2 border-black bg-black px-3 py-2 text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black"
              >
                Send pitch
              </button>
              <a
                href={lead.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black uppercase tracking-[0.2em] text-black/60 underline decoration-2 underline-offset-4 hover:text-black"
              >
                View listing
              </a>
              {lead.source === "remotive" ? (
                <span className="text-xs text-black/50">
                  via{" "}
                  <a
                    href="https://remotive.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-2 underline-offset-4"
                  >
                    Remotive
                  </a>
                </span>
              ) : lead.source === "remoteok" ? (
                <span className="text-xs text-black/50">
                  via{" "}
                  <a
                    href="https://remoteok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-2 underline-offset-4"
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
        <p className="text-sm text-black/70">No rows to show.</p>
      ) : null}

      {pitchLead ? (
        <PitchModal lead={pitchLead} onClose={() => setPitchLead(null)} />
      ) : null}
    </div>
  );
}
