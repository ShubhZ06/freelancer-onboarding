import { WorkspaceShell } from "@/components/navigation";
import { ClientDashboard } from "@/components/communications";

export default function CommunicationsPage() {
  return (
    <WorkspaceShell
      eyebrow="Communications"
      title="Keep every client informed and move stuck projects forward"
      description="WhatsApp (Twilio) goes to a fixed number; updates and warnings are composed per client."
    >
      <ClientDashboard />
    </WorkspaceShell>
  );
}
