import Link from "next/link";
import { WorkspaceShell } from "@/components/navigation";

export default function PaymentCancelPage() {
  return (
    <WorkspaceShell
      eyebrow="Payments"
      title="Checkout cancelled"
      description="No charge was made. You can generate a new payment link anytime."
    >
      <div className="border-4 border-black bg-white p-8 neo-shadow-sm">
        <p className="text-lg font-bold text-black">
          The client left the Stripe checkout page before paying. Share your payment link again if they still need to pay.
        </p>
        <Link href="/payment/generate" className="neo-btn neo-btn-dark mt-6 inline-block">
          Generate another link
        </Link>
      </div>
    </WorkspaceShell>
  );
}
