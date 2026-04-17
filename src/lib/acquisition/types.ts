export type LeadSource =
  | "arbeitnow"
  | "remotive"
  | "remoteok"
  | "adzuna"
  | "jooble"
  | "usajobs"
  | "mock";

export type IntentPreset = "freelance" | "contract" | "consultant" | "fractional";

export type Lead = {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  description: string;
  url: string;
  postedAt?: string;
  source: LeadSource;
  intentTags: IntentPreset[];
  rawJobType?: string;
};

export type LeadSearchResponse = {
  leads: Lead[];
  demo: boolean;
  sourcesTried: string[];
  warnings: string[];
  persisted: boolean;
};
