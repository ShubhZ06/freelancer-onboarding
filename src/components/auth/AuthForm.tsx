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

  const isSignUp = mode === "sign-up";

  return (
    <section className="relative grid gap-10 border-4 border-black bg-[#fffdf5] p-6 neo-shadow-lg sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-12">
      {/* Decorative floaters */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 hidden h-16 w-16 border-4 border-black bg-[#ffd93d] neo-shadow-sm lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-10 hidden h-10 w-10 rotate-45 border-4 border-black bg-[#ff6b6b] lg:block"
      />

      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="neo-tag neo-tag-accent">
            {isSignUp ? "New / Account" : "Welcome / Back"}
          </span>
          <span aria-hidden className="h-[3px] w-12 bg-black" />
        </div>

        <div className="space-y-4">
          <h1 className="font-heading max-w-xl text-5xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-6xl md:text-7xl">
            {isSignUp ? (
              <>
                Clock
                <br />
                <span className="bg-[#ff6b6b] px-2 text-white text-shadow-hard">
                  In.
                </span>
              </>
            ) : (
              <>
                Back to
                <br />
                <span className="bg-[#ffd93d] px-2 text-black">
                  Work.
                </span>
              </>
            )}
          </h1>
          <p className="max-w-xl text-lg font-bold leading-snug text-black sm:text-xl">
            {isSignUp
              ? "Spin up your workspace in 30 seconds. No credit card, no corporate nonsense."
              : "Get back to your dashboard, contracts, and clients. Let's move."}
          </p>
        </div>

        <div className="border-4 border-black bg-[#c4b5fd] p-5 neo-shadow-sm">
          <p className="font-heading text-xs font-black uppercase tracking-[0.25em] text-black">
            Demo Notice
          </p>
          <p className="mt-2 text-sm font-bold leading-snug text-black">
            Authentication here is local to this workspace demo. Public landing,
            sign-in, sign-up, and route protection all wired up for you.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="neo-tag neo-tag-yellow">Landing First</span>
          <span className="neo-tag neo-tag-violet">Protected Dash</span>
          <span className="neo-tag">Public Auth</span>
        </div>
      </div>

      <form
        action={handleSubmit}
        className="space-y-5 border-4 border-black bg-black p-6 neo-shadow-md sm:p-8"
      >
        <div className="flex items-center gap-3 border-b-[3px] border-[#ffd93d] pb-4">
          <span className="inline-block h-3 w-3 bg-[#ff6b6b]" aria-hidden />
          <p className="font-heading text-xs font-black uppercase tracking-[0.3em] text-[#ffd93d]">
            {isSignUp ? "Create Account" : "Sign In"}
          </p>
        </div>

        {isSignUp ? (
          <label className="block space-y-2">
            <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
              Full name
            </span>
            <input
              name="name"
              placeholder="Alex Morgan"
              autoComplete="name"
              className="neo-input"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
            Email
          </span>
          <input
            name="email"
            type="email"
            placeholder="alex@studio.com"
            autoComplete="email"
            className="neo-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
            Password
          </span>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="neo-input"
          />
        </label>

        {error ? (
          <p className="border-[3px] border-black bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-black">
            ⚠ {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="neo-btn neo-btn-primary w-full text-base py-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : isSignUp ? "Create Account →" : "Sign In →"}
        </button>

        <p className="text-sm font-bold text-white">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="border-b-[3px] border-[#ffd93d] font-heading uppercase tracking-wider text-[#ffd93d] hover:bg-[#ffd93d] hover:text-black"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </section>
  );
}
