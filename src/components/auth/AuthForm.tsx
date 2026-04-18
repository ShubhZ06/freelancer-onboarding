"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readSessionUser, registerUser, signInUser } from "@/lib/auth-session";

type Mode = "sign-in" | "sign-up";

type Props = {
  mode: Mode;
};

type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
  name: string;
  email: string;
  location: string;
  phoneNumber: string;
  password: string;
  businessName: string;
  businessLocation: string;
  businessRegistrationNumber: string;
};

const EMPTY_SIGN_UP: SignUpData = {
  name: "",
  email: "",
  location: "",
  phoneNumber: "",
  password: "",
  businessName: "",
  businessLocation: "",
  businessRegistrationNumber: "",
};

const EMPTY_SIGN_IN: SignInData = {
  email: "",
  password: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [signInData, setSignInData] = useState<SignInData>(EMPTY_SIGN_IN);
  const [signUpData, setSignUpData] = useState<SignUpData>(EMPTY_SIGN_UP);
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (readSessionUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function validateSignUpStepOne(data: SignUpData) {
    if (data.name.trim().length < 2) {
      return "Name must be at least 2 characters long.";
    }
    if (!isValidEmail(data.email.trim())) {
      return "Enter a valid email address.";
    }
    if (data.location.trim().length < 2) {
      return "Location is required.";
    }
    if (data.phoneNumber.trim().length < 7) {
      return "Phone number must be at least 7 characters.";
    }
    if (data.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null;
  }

  function validateSignUpStepTwo(data: SignUpData) {
    if (data.businessName.trim().length < 2) {
      return "Business name is required.";
    }
    if (data.businessLocation.trim().length < 2) {
      return "Business location is required.";
    }
    if (data.businessRegistrationNumber.trim().length < 3) {
      return "Business registration number is required.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (pending) {
      return;
    }

    setError(null);

    if (mode === "sign-up") {
      if (signUpStep === 1) {
        const stepOneError = validateSignUpStepOne(signUpData);
        if (stepOneError) {
          setError(stepOneError);
          return;
        }

        setSignUpStep(2);
        return;
      }

      const stepTwoError = validateSignUpStepTwo(signUpData);
      if (stepTwoError) {
        setError(stepTwoError);
        return;
      }

      setPending(true);

      const result = registerUser(
        {
          name: signUpData.name.trim(),
          email: signUpData.email.trim(),
          location: signUpData.location.trim(),
          phoneNumber: signUpData.phoneNumber.trim(),
          businessName: signUpData.businessName.trim(),
          businessLocation: signUpData.businessLocation.trim(),
          businessRegistrationNumber: signUpData.businessRegistrationNumber.trim(),
        },
        signUpData.password
      );

      if (!result.success) {
        setError(result.message);
        setPending(false);
        return;
      }

      router.push(nextPath);
      return;
    }

    setPending(true);

    const result = signInUser(signInData.email.trim(), signInData.password);
    if (!result.success) {
      setError(result.message);
      setPending(false);
      return;
    }

    router.push(nextPath);
  }

  const isSignUp = mode === "sign-up";

  function updateSignUpField(field: keyof SignUpData, value: string) {
    setSignUpData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  }

  function updateSignInField(field: keyof SignInData, value: string) {
    setSignInData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  }

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
            Quick note
          </p>
          <p className="mt-2 text-sm font-bold leading-snug text-black">
            Your profile details are used to auto-fill contracts, messages, and settings so you can move faster.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="neo-tag neo-tag-yellow">Fast Setup</span>
          <span className="neo-tag neo-tag-violet">Secure Access</span>
          <span className="neo-tag">Client Ready</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border-4 border-black bg-black p-6 neo-shadow-md sm:p-8">
        <div className="flex items-center gap-3 border-b-[3px] border-[#ffd93d] pb-4">
          <span className="inline-block h-3 w-3 bg-[#ff6b6b]" aria-hidden />
          <p className="font-heading text-xs font-black uppercase tracking-[0.3em] text-[#ffd93d]">
            {isSignUp ? `Create Account · Step ${signUpStep} / 2` : "Sign In"}
          </p>
        </div>

        {isSignUp ? (
          <>
            {signUpStep === 1 ? (
              <>
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Full name
                  </span>
                  <input
                    name="name"
                    value={signUpData.name}
                    onChange={(e) => updateSignUpField("name", e.target.value)}
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => updateSignUpField("email", e.target.value)}
                    placeholder="alex@studio.com"
                    autoComplete="email"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Location
                  </span>
                  <input
                    name="location"
                    value={signUpData.location}
                    onChange={(e) => updateSignUpField("location", e.target.value)}
                    placeholder="London, UK"
                    autoComplete="address-level2"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Phone Number
                  </span>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={signUpData.phoneNumber}
                    onChange={(e) => updateSignUpField("phoneNumber", e.target.value)}
                    placeholder="+44 7000 123456"
                    autoComplete="tel"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => updateSignUpField("password", e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="neo-input pr-20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-black bg-[#ffd93d] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <>
                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Business Name
                  </span>
                  <input
                    name="businessName"
                    value={signUpData.businessName}
                    onChange={(e) => updateSignUpField("businessName", e.target.value)}
                    placeholder="Acme Studios Ltd"
                    autoComplete="organization"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Business Location
                  </span>
                  <input
                    name="businessLocation"
                    value={signUpData.businessLocation}
                    onChange={(e) => updateSignUpField("businessLocation", e.target.value)}
                    placeholder="Mumbai, India"
                    autoComplete="street-address"
                    className="neo-input"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                    Registration Number
                  </span>
                  <input
                    name="businessRegistrationNumber"
                    value={signUpData.businessRegistrationNumber}
                    onChange={(e) => updateSignUpField("businessRegistrationNumber", e.target.value)}
                    placeholder="REG-2026-001"
                    className="neo-input"
                    required
                  />
                </label>
              </>
            )}
          </>
        ) : (
          <>
            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                Email
              </span>
              <input
                name="email"
                type="email"
                value={signInData.email}
                onChange={(e) => updateSignInField("email", e.target.value)}
                placeholder="alex@studio.com"
                autoComplete="email"
                className="neo-input"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#ffd93d]">
                Password
              </span>
              <input
                name="password"
                type="password"
                value={signInData.password}
                onChange={(e) => updateSignInField("password", e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="neo-input"
                required
              />
            </label>
          </>
        )}

        {error ? (
          <p className="border-[3px] border-black bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-black">
            ⚠ {error}
          </p>
        ) : null}

        {isSignUp ? (
          signUpStep === 1 ? (
            <button
              type="submit"
              disabled={pending}
              className="neo-btn neo-btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue to Business Details →
            </button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSignUpStep(1);
                }}
                disabled={pending}
                className="neo-btn w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="neo-btn neo-btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Creating…" : "Create Account →"}
              </button>
            </div>
          )
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="neo-btn neo-btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Working…" : "Sign In →"}
          </button>
        )}

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
