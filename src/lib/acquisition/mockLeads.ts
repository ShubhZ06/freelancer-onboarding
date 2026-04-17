import type { IntentPreset, Lead } from "./types";
import { matchesIntent } from "./intent";
import { matchesQuery } from "./utils";

type MockTemplate = Omit<Lead, "postedAt">;

const TEMPLATES: MockTemplate[] = [
  {
    id: "mock:1",
    title: "Freelance React developer for 3-month product sprint",
    companyName: "Northwind Labs",
    location: "Remote, EU timezones",
    description:
      "We need an experienced React/TypeScript engineer to help ship a client dashboard. Contract outside IR35, weekly rate.",
    url: "https://example.com/jobs/mock-react",
    source: "mock",
    intentTags: ["contract", "freelance"],
    rawJobType: "contract",
  },
  {
    id: "mock:2",
    title: "Fractional CTO — early-stage B2B SaaS",
    companyName: "Harbor Analytics",
    location: "US remote",
    description:
      "2–3 days per week. Architecture, hiring support, and roadmap. Previous startup experience required.",
    url: "https://example.com/jobs/mock-fct",
    source: "mock",
    intentTags: ["fractional", "consultant"],
    rawJobType: "part_time",
  },
  {
    id: "mock:3",
    title: "Marketing consultant — launch campaign",
    companyName: "Brightpath Co-op",
    location: "London / hybrid",
    description:
      "Short project: positioning, messaging, and paid social plan for Q3 launch. Consultant or boutique agency welcome.",
    url: "https://example.com/jobs/mock-mkt",
    source: "mock",
    intentTags: ["consultant"],
  },
];

function withDate(t: MockTemplate): Lead {
  return { ...t, postedAt: new Date().toISOString() };
}

export function getMockLeads(q: string, intents: IntentPreset[]): Lead[] {
  return TEMPLATES.filter(
    (t) =>
      matchesQuery(t.title, t.description, q) &&
      matchesIntent(t.title, t.description, intents),
  ).map(withDate);
}

export function getAllMockLeads(): Lead[] {
  return TEMPLATES.map(withDate);
}
