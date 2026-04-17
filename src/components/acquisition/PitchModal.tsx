"use client";

import { useEffect, useRef, useState } from "react";
import { generatePitch, type PitchProfile } from "@/lib/acquisition/pitch";
import type { Lead } from "@/lib/acquisition/types";

const STORAGE_KEY = "fos:pitch_profile";

function loadProfile(): PitchProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PitchProfile;
  } catch {
    return null;
  }
}

function saveProfile(p: PitchProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

type Step = "setup" | "pitch";

type Props = {
  lead: Lead;
  onClose: () => void;
};

export function PitchModal({ lead, onClose }: Props) {
  const [step, setStep] = useState<Step>("pitch");
  const [profile, setProfile] = useState<PitchProfile>({
    name: "",
    portfolioUrl: "",
    role: "",
  });
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadProfile();
    if (!saved || !saved.name || !saved.portfolioUrl) {
      setStep("setup");
    } else {
      setProfile(saved);
      setStep("pitch");
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pitch = step === "pitch" ? generatePitch(lead, profile) : null;

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.portfolioUrl.trim()) return;
    saveProfile(profile);
    setStep("pitch");
  };

  const handleCopy = async () => {
    if (!pitch) return;
    const text = `Subject: ${pitch.subject}\n\n${pitch.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-lg flex-col border-4 border-black bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-black">
              {step === "setup" ? "Set up your pitch profile" : "Send your pitch"}
            </p>
            <p className="mt-1 max-w-xs truncate text-xs text-black/60">
              {lead.title} · {lead.companyName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black p-1.5 text-black transition hover:bg-swiss-accent"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Step: Setup */}
        {step === "setup" && (
          <form onSubmit={handleSetupSubmit} className="flex flex-col gap-4 p-6">
            <p className="text-sm leading-6 text-black/70">
              Enter your details once — they'll be saved locally and reused for every pitch.
            </p>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-[0.22em] text-black/70">
              Your name
              <input
                required
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Alex Smith"
                className="border-2 border-black bg-swiss-muted px-3 py-3 text-sm text-black outline-none focus:border-swiss-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-[0.22em] text-black/70">
              Portfolio / website URL
              <input
                required
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, portfolioUrl: e.target.value }))
                }
                placeholder="https://yourname.com"
                className="border-2 border-black bg-swiss-muted px-3 py-3 text-sm text-black outline-none focus:border-swiss-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-[0.22em] text-black/70">
              Your role / specialty{" "}
              <span className="font-normal text-black/40">(optional)</span>
              <input
                value={profile.role ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, role: e.target.value }))
                }
                placeholder="e.g. full-stack developer, brand designer…"
                className="border-2 border-black bg-swiss-muted px-3 py-3 text-sm text-black outline-none focus:border-swiss-accent"
              />
            </label>
            <button
              type="submit"
              className="mt-2 border-2 border-black bg-black py-3 text-sm font-black uppercase tracking-[0.24em] text-white hover:bg-swiss-accent hover:text-black"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step: Pitch preview */}
        {step === "pitch" && pitch && (
          <div className="flex flex-col gap-4 p-6">
            <div className="border-2 border-black bg-swiss-muted p-4">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.24em] text-black/40">
                Subject
              </p>
              <p className="text-sm font-medium text-black">{pitch.subject}</p>
            </div>

            <div className="border-2 border-black bg-swiss-muted p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-black/40">
                Message
              </p>
              <pre className="whitespace-pre-wrap text-sm leading-6 text-black font-sans">
                {pitch.body}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className={`flex items-center gap-1.5 border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-[0.22em] transition-colors ${
                  copied
                    ? "bg-swiss-accent text-black"
                    : "bg-black text-white hover:bg-swiss-accent hover:text-black"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy message
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = pitch.mailtoHref; }}
                className="flex items-center gap-1.5 border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-black hover:bg-swiss-muted"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Open in email client
              </button>

              <a
                href={lead.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-black hover:bg-swiss-muted"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View listing
              </a>
            </div>

            <button
              type="button"
              onClick={() => setStep("setup")}
              className="self-start text-xs font-black uppercase tracking-[0.24em] text-black/50 underline decoration-2 underline-offset-4 hover:text-black"
            >
              Edit profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
