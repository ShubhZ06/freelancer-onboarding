"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [amountLabel, setAmountLabel] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("Missing session. Return to payments and complete checkout from the generated link.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/payments/session-status?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not verify payment");
          setLoading(false);
          return;
        }
        setPaid(!!data.paid);
        if (data.amount_total != null && data.currency) {
          const major = (data.amount_total as number) / 100;
          setAmountLabel(`${data.currency.toUpperCase()} ${major.toFixed(2)}`);
        }
        setProjectTitle(typeof data.project_title === "string" ? data.project_title : null);
      } catch {
        if (!cancelled) setError("Network error verifying payment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return <p className="font-heading text-lg font-black text-black">Confirming payment…</p>;
  }

  if (error) {
    return (
      <div className="border-4 border-black bg-[#ffe4e6] p-6">
        <p className="font-bold text-black">{error}</p>
        <Link href="/payment/generate" className="neo-btn neo-btn-dark mt-4 inline-block">
          Back to payments
        </Link>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-[#86efac] p-8 neo-shadow-md">
      <p className="font-heading text-4xl font-black uppercase tracking-tight text-black">Payment confirmed</p>
      <p className="mt-4 text-lg font-bold text-black">
        {paid
          ? "Stripe reports this checkout session as paid. Thank you — you can close this tab."
          : "Session found. If you just completed payment, status may update in a few seconds."}
      </p>
      {amountLabel ? (
        <p className="mt-4 border-t-4 border-black pt-4 font-heading text-2xl font-black text-black">{amountLabel}</p>
      ) : null}
      {projectTitle ? <p className="mt-2 font-bold text-black">Project: {projectTitle}</p> : null}
      <Link href="/dashboard" className="neo-btn neo-btn-dark mt-8 inline-block">
        Back to dashboard
      </Link>
    </div>
  );
}
