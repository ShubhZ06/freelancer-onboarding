import { Suspense } from "react";
import { WorkspaceShell } from "@/components/navigation";
import { PaymentSuccessClient } from "./PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <WorkspaceShell
      eyebrow="Payments"
      title="Thank you"
      description="Your client completed checkout on Stripe. Here is your confirmation."
    >
      <Suspense
        fallback={
          <p className="font-heading text-lg font-black text-black">Loading confirmation…</p>
        }
      >
        <PaymentSuccessClient />
      </Suspense>
    </WorkspaceShell>
  );
}
