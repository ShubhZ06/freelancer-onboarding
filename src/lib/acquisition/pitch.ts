import type { Lead } from "./types";

export type PitchProfile = {
  name: string;
  portfolioUrl: string;
  role?: string;
};

export type GeneratedPitch = {
  subject: string;
  body: string;
  mailtoHref: string;
};

export function generatePitch(
  lead: Lead,
  profile: PitchProfile,
): GeneratedPitch {
  const role = profile.role?.trim() || "freelancer";
  const company = lead.companyName !== "—" ? lead.companyName : "your team";

  const subject = `Re: ${lead.title} — ${profile.name} available`;

  const body = [
    `Hi ${company} team,`,
    ``,
    `I came across your "${lead.title}" post and wanted to reach out. I'm an independent ${role} and think I could be a strong fit for what you're describing.`,
    ``,
    `You can review my portfolio and past work here:`,
    `${profile.portfolioUrl}`,
    ``,
    `Happy to jump on a quick call to see if there's a match — what does your timeline look like?`,
    ``,
    `Best,`,
    profile.name,
  ].join("\n");

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoHref };
}
