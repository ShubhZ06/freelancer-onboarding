import type { IntentPreset } from "./types";

export const INTENT_PRESETS: Record<
  IntentPreset,
  { label: string; tokens: string[] }
> = {
  freelance: {
    label: "Freelance",
    tokens: ["freelance", "freelancer", "independent contractor"],
  },
  contract: {
    label: "Contract",
    tokens: ["contract", "contractor", "fixed-term", "temporary"],
  },
  consultant: {
    label: "Consultant",
    tokens: ["consultant", "consulting", "advisory"],
  },
  fractional: {
    label: "Fractional",
    tokens: ["fractional", "part-time", "part time", "retainer"],
  },
};

export function parseIntentParams(
  raw: string | string[] | undefined,
): IntentPreset[] {
  if (!raw) return [];
  const parts = Array.isArray(raw)
    ? raw
    : raw.split(",").map((s) => s.trim());
  const allowed = new Set(Object.keys(INTENT_PRESETS) as IntentPreset[]);
  return parts.filter((p): p is IntentPreset => allowed.has(p as IntentPreset));
}

export function composeSearchQuery(
  userQ: string,
  intents: IntentPreset[],
): string {
  const tokens = intents.flatMap((i) => INTENT_PRESETS[i]?.tokens ?? []);
  const unique = [...new Set(tokens)];
  return [userQ.trim(), ...unique].filter(Boolean).join(" ");
}

export function matchesIntent(
  title: string,
  description: string,
  intents: IntentPreset[],
): boolean {
  if (intents.length === 0) return true;
  const hay = `${title}\n${description}`.toLowerCase();
  return intents.some((i) =>
    (INTENT_PRESETS[i]?.tokens ?? []).some((t) => hay.includes(t.toLowerCase())),
  );
}

export function intentMatchScore(
  title: string,
  description: string,
  intents: IntentPreset[],
): number {
  if (intents.length === 0) return 0;
  const hay = `${title}\n${description}`.toLowerCase();
  let score = 0;
  for (const i of intents) {
    for (const t of INTENT_PRESETS[i]?.tokens ?? []) {
      if (hay.includes(t.toLowerCase())) score += 1;
    }
  }
  return score;
}
