import { WorkspaceShell } from "@/components/navigation";
import { ClientDashboard } from "@/components/communications";
import { getWhatsAppDeliveryE164Display } from "@/lib/comm-config";

export default function CommunicationsPage() {
  const whatsappDeliveryE164 = getWhatsAppDeliveryE164Display();

  return (
    <WorkspaceShell
      eyebrow="Communications"
      title="Keep every client informed and move stuck projects forward"
      description="WhatsApp (Twilio) goes to the number in TWILIO_WHATSAPP_TO; updates and warnings are composed per client."
    >
      <ClientDashboard whatsappDeliveryE164={whatsappDeliveryE164} />
    </WorkspaceShell>
  );
}
