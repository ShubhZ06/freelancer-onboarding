"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/components/navigation";

export default function PaymentGeneratePage() {
  const [amount, setAmount] = useState("500");
  const [projectTitle, setProjectTitle] = useState("");
  const [clientLabel, setClientLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  async function generatePayment() {
    setLoading(true);
    setError(null);
    setCheckoutUrl(null);
    setShareMsg(null);
    setCopyMsg(null);
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid amount.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: n,
          projectTitle: projectTitle.trim() || undefined,
          clientLabel: clientLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.hint ? `${data.error}\n\n${data.hint}` : data.error ?? "Request failed");
        return;
      }
      setCheckoutUrl(data.url as string);
      setAmountUsd(n);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopyMsg("Link copied.");
      setTimeout(() => setCopyMsg(null), 2500);
    } catch {
      setCopyMsg("Could not copy — select the link manually.");
    }
  }

  async function sendWhatsAppTwilio() {
    if (!checkoutUrl || amountUsd == null) return;
    setShareMsg(null);
    try {
      const res = await fetch("/api/payments/share-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutUrl,
          amountUsd,
          projectTitle: projectTitle.trim() || "Project payment",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareMsg(data.error ?? "Send failed");
        return;
      }
      setShareMsg(
        data.demo
          ? "Demo mode — message logged to server console (configure Twilio to send real WhatsApp)."
          : `Sent via WhatsApp. SID: ${data.twilioSid ?? "n/a"}`
      );
    } catch {
      setShareMsg("Network error.");
    }
  }

  function openWhatsAppWeb() {
    if (!checkoutUrl || amountUsd == null) return;
    const title = projectTitle.trim() || "Project payment";
    const text = `Payment request\n${title}\n$${amountUsd.toFixed(2)} USD\n\nPay here:\n${checkoutUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <WorkspaceShell
      eyebrow="Payments"
      title="Generate client payment"
      description="Create a secure Stripe checkout page, then share the link manually or send payment details through WhatsApp."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border-4 border-black bg-white p-6 neo-shadow-sm">
          <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black">1. Amount & details</h2>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">Amount (USD)</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-[3px] border-black bg-[#fffdf5] px-3 py-2 font-bold text-black outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                placeholder="500"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">Project title</span>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full border-[3px] border-black bg-[#fffdf5] px-3 py-2 font-bold text-black outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                placeholder="Website redesign — Acme Co."
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">Client note (optional)</span>
              <input
                type="text"
                value={clientLabel}
                onChange={(e) => setClientLabel(e.target.value)}
                className="w-full border-[3px] border-black bg-[#fffdf5] px-3 py-2 font-bold text-black outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                placeholder="Invoice #1042 — Net 15"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void generatePayment()}
            disabled={loading}
            className="neo-btn neo-btn-dark mt-6 w-full sm:w-auto"
          >
            {loading ? "Creating…" : "Generate payment"}
          </button>
          {error ? (
            <pre className="mt-4 whitespace-pre-wrap border-[3px] border-black bg-[#ffe4e6] p-3 text-sm font-bold text-black">
              {error}
            </pre>
          ) : null}
        </section>

        <section className="border-4 border-black bg-[#ffd93d] p-6 neo-shadow-sm">
          <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black">2. Share the link</h2>
          <p className="mt-2 text-sm font-bold text-black">
            Stripe hosts the checkout. After you generate, copy the link or open WhatsApp with the message prefilled.
          </p>
          {checkoutUrl ? (
            <div className="mt-4 space-y-3">
              <div className="break-all border-[3px] border-black bg-white p-3 text-sm font-bold text-black">
                <a href={checkoutUrl} className="underline" target="_blank" rel="noreferrer">
                  {checkoutUrl}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void copyLink()} className="neo-btn bg-white text-black">
                  Copy link
                </button>
                <button type="button" onClick={openWhatsAppWeb} className="neo-btn bg-[#25D366] text-white border-black">
                  WhatsApp (prefill message)
                </button>
                <button
                  type="button"
                  onClick={() => void sendWhatsAppTwilio()}
                  className="neo-btn neo-btn-dark"
                >
                  Send via Twilio WhatsApp
                </button>
              </div>
              {copyMsg ? <p className="text-sm font-bold text-black">{copyMsg}</p> : null}
              {shareMsg ? <p className="text-sm font-bold text-black">{shareMsg}</p> : null}
            </div>
          ) : (
            <p className="mt-6 text-sm font-bold text-black/70">Generate a payment to get a shareable link.</p>
          )}
        </section>
      </div>

      <section className="mt-8 border-4 border-black bg-[#c4b5fd] p-6 neo-shadow-sm">
        <h2 className="font-heading text-lg font-black uppercase text-black">After the client pays</h2>
        <p className="mt-2 max-w-3xl text-sm font-bold text-black">
          They are redirected to a confirmation page on this site. Configure{" "}
          <code className="bg-white px-1">STRIPE_WEBHOOK_SECRET</code> and point Stripe webhooks to{" "}
          <code className="bg-white px-1">/api/webhooks/stripe</code> so paid status syncs to your database.
        </p>
      </section>
    </WorkspaceShell>
  );
}
