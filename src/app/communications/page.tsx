import { WorkspaceShell } from "@/components/navigation";
import { ClientDashboard } from "@/components/communications";
import { getWhatsAppDeliveryE164Display } from "@/lib/comm-config";

export default function CommunicationsPage() {
  const whatsappDeliveryE164 = getWhatsAppDeliveryE164Display();

  return (
    <WorkspaceShell
      eyebrow="Client Communication"
      title="Keep every client informed and move stuck projects forward"
      description="Send clean updates, follow-up reminders, and voice notes from one place so clients always know what is happening."
    >
      <ClientDashboard whatsappDeliveryE164={whatsappDeliveryE164} />
    </WorkspaceShell>
  );
}
