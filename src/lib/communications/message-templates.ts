import type { Client } from "@/lib/demo-db";

const SUPPORT_CONTACT_LINE =
  "If you have any doubt, you can reach us here: +918031150197, +918031320063.";

export function buildUpdateWhatsAppBody(
  client: Client,
  updateSummary: string,
  checklist: string[]
): string {
  const taskLines = checklist.map((t) => `- ${t}`).join("\n");
  return (
    `*Project Update*\n` +
    `Hi ${client.name},\n\n` +
    `${updateSummary}\n\n` +
    `✅ *Completed tasks*\n${taskLines}\n\n` +
    `Please review and reply when you can.\n\n` +
    `${SUPPORT_CONTACT_LINE}`
  );
}

export function buildWarningWhatsAppBody(client: Client): string {
  const taskLines = client.pending_checklist.map((t) => `- ${t}`).join("\n");
  return (
    `⚠️ *Pending review*\n` +
    `Hi ${client.name},\n\n` +
    `Update was sent for:\n${taskLines}\n\n` +
    `No reply yet — work is *paused* until reviewed. Reply if you need anything.\n\n` +
    `${SUPPORT_CONTACT_LINE}`
  );
}
