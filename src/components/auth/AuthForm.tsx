"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readSessionUser, registerUser, signInUser } from "@/lib/auth-session";

type Mode = "sign-in" | "sign-up";

type Props = {
  mode: Mode;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (readSessionUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (mode === "sign-up") {
      if (name.length < 2) {
        setError("Name must be at least 2 characters long.");
        setPending(false);
        return;
      }

      const result = registerUser({ name, email }, password);
      if (!result.success) {
        setError(result.message);
        setPending(false);
        return;
      }

      router.push(nextPath);
      return;
    }

    const result = signInUser(email, password);
    if (!result.success) {
      setError(result.message);
      setPending(false);
      return;
    }

    router.push(nextPath);
  }

  return (
    <section className="grid gap-8 border-4 border-black bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
      <div className="space-y-6">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-swiss-accent">
          {mode === "sign-up" ? "Create Account" : "Welcome Back"}
        </p>
        <div className="space-y-3">
          <h1 className="max-w-xl text-3xl font-black uppercase tracking-tighter text-black sm:text-4xl">
            {mode === "sign-up" ? "Create your workspace access" : "Sign in to your dashboard"}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-black/70 sm:text-base">
            {mode === "sign-up"
              ? "Set up your account once, then move straight into the dashboard and protected workspace."
              : "Use your workspace account to get back to the dashboard, leads, contracts, and client communication tools."}
          </p>
        </div>

        <div className="border-2 border-black bg-swiss-muted p-4 text-sm leading-6 text-black">
          Authentication here is local to this workspace demo. It gives you the public landing, sign-in, sign-up, and route protection structure you asked for.
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.22em] text-black/50">
          <span className="border-2 border-black bg-white px-3 py-1">Landing first</span>
          <span className="border-2 border-black bg-white px-3 py-1">Protected dashboard</span>
          <span className="border-2 border-black bg-white px-3 py-1">Public auth pages</span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4 border-2 border-black bg-swiss-muted p-5 sm:p-6">
        {mode === "sign-up" ? (
          <label className="block space-y-2 text-xs font-black uppercase tracking-[0.24em] text-black/60">
            Full name
            <input
              name="name"
              placeholder="Alex Morgan"
              autoComplete="name"
              className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-swiss-accent"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-xs font-black uppercase tracking-[0.24em] text-black/60">
          Email
          <input
            name="email"
            type="email"
            placeholder="alex@studio.com"
            autoComplete="email"
            className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-swiss-accent"
          />
        </label>

        <label className="block space-y-2 text-xs font-black uppercase tracking-[0.24em] text-black/60">
          Password
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-swiss-accent"
          />
        </label>

        {error ? (
          <p className="border-2 border-black bg-swiss-accent px-4 py-3 text-sm font-medium text-black">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full border-4 border-black bg-black px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-swiss-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : mode === "sign-up" ? "Create Account" : "Sign In"}
        </button>

        <p className="text-sm text-black/70">
          {mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
            className="font-black uppercase tracking-[0.22em] text-black underline decoration-2 underline-offset-4"
          >
            {mode === "sign-up" ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </section>
  );
}
