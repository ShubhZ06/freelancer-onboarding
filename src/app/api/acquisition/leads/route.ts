import { NextRequest, NextResponse } from "next/server";
import { fetchAdzunaLeads, getAdzunaConfig } from "@/lib/acquisition/adzuna";
import { fetchArbeitnowLeads } from "@/lib/acquisition/arbeitnow";
import { fetchJoobleLeads, getJoobleConfig } from "@/lib/acquisition/jooble";
import { parseIntentParams } from "@/lib/acquisition/intent";
import { mergeAndDedupe } from "@/lib/acquisition/merge";
import { getAllMockLeads, getMockLeads } from "@/lib/acquisition/mockLeads";
import { persistLeads } from "@/lib/acquisition/persist";
import { fetchRemoteOkLeads } from "@/lib/acquisition/remoteok";
import { fetchRemotiveLeads } from "@/lib/acquisition/remotive";
import { fetchUsaJobsLeads, getUsaJobsConfig } from "@/lib/acquisition/usajobs";
import { parsePage } from "@/lib/acquisition/utils";
import type { IntentPreset, Lead } from "@/lib/acquisition/types";

export const dynamic = "force-dynamic";

const MAX_Q_LENGTH = 200;

async function gatherFromSources(
  q: string,
  where: string,
  page: number,
  intents: IntentPreset[],
  warnings: string[],
  sourcesTried: Set<string>,
): Promise<Lead[][]> {
  const batches: Lead[][] = [];

  const run = async (name: string, fn: () => Promise<Lead[]>) => {
    sourcesTried.add(name);
    try {
      batches.push(await fn());
    } catch (e) {
      warnings.push(`${name}: ${e instanceof Error ? e.message : "failed"}`);
    }
  };

  const tasks: Promise<void>[] = [
    run("arbeitnow", () => fetchArbeitnowLeads(q, intents)),
    run("remotive", () => fetchRemotiveLeads(q, intents)),
    run("remoteok", () => fetchRemoteOkLeads(q, intents)),
  ];

  if (getAdzunaConfig()) {
    tasks.push(run("adzuna", () => fetchAdzunaLeads(q, where, page, intents)));
  }
  if (getJoobleConfig()) {
    tasks.push(run("jooble", () => fetchJoobleLeads(q, where, page, intents)));
  }
  if (getUsaJobsConfig()) {
    tasks.push(run("usajobs", () => fetchUsaJobsLeads(q, page, intents)));
  }

  await Promise.all(tasks);
  return batches;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const rawQ = sp.get("q") ?? "";
  const q = rawQ.slice(0, MAX_Q_LENGTH).trim();

  const intentMulti = sp.getAll("intent");
  const intents = parseIntentParams(
    intentMulti.length ? intentMulti : (sp.get("intent") ?? undefined),
  );

  const where = (sp.get("where") ?? "").slice(0, 100).trim();
  const page = parsePage(sp.get("page"));

  const warnings: string[] = [];
  const sourcesTried = new Set<string>();

  const batches = await gatherFromSources(
    q,
    where,
    page,
    intents,
    warnings,
    sourcesTried,
  );

  let leads = mergeAndDedupe(batches, intents);

  if (leads.length === 0 && intents.length > 0) {
    warnings.push(
      "No rows matched intent filters; showing broader results (keywords/location still applied).",
    );
    leads = mergeAndDedupe(batches, []);
  }

  let demo = false;

  if (leads.length === 0) {
    leads = getMockLeads(q, intents);
    if (leads.length === 0) leads = getAllMockLeads();
    demo = true;
    warnings.push("Showing demo data — no matching live results or all sources failed.");
  }

  const optionalMissing: string[] = [];
  if (!getAdzunaConfig()) optionalMissing.push("Adzuna");
  if (!getJoobleConfig()) optionalMissing.push("Jooble");
  if (!getUsaJobsConfig()) optionalMissing.push("USAJOBS");
  if (optionalMissing.length > 0) {
    warnings.push(
      `Optional sources not configured (no API keys): ${optionalMissing.join(", ")}.`,
    );
  }

  let persisted = false;
  try {
    persisted = await persistLeads(leads);
    if (!persisted && process.env.MONGODB_URI && leads.length > 0) {
      warnings.push("MongoDB: leads not persisted — check connection string and Atlas network access.");
    } else if (!process.env.MONGODB_URI) {
      warnings.push("MongoDB: MONGODB_URI not set — leads returned in response only.");
    }
  } catch (e) {
    warnings.push(
      `MongoDB: ${e instanceof Error ? e.message : "persist failed"}`,
    );
  }

  return NextResponse.json(
    {
      leads,
      demo,
      sourcesTried: [...sourcesTried],
      warnings,
      persisted,
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
