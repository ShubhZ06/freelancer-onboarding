"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readSessionUser, signOutUser, type AuthUser } from "@/lib/auth-session";
import { AppNav } from "./AppNav";

export function SiteHeader() {
  const router = useRouter();
  const [user] = useState<AuthUser | null>(() => readSessionUser());

  function handleSignOut() {
    signOutUser();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-[#fffdf5]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Top bar — logo + user info */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 border-4 border-black bg-[#ff6b6b] px-3 py-2 neo-shadow-sm transition-transform duration-100 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <span className="font-heading text-lg uppercase tracking-tight text-black sm:text-xl">
              Freelancer/OS
            </span>
            <span aria-hidden className="inline-block h-2 w-2 bg-black" />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="inline-flex h-8 w-8 items-center justify-center border-[3px] border-black bg-[#ffd93d] font-heading text-sm font-black uppercase text-black">
                    {user.name.charAt(0) || "?"}
                  </span>
                  <span className="text-xs font-bold text-black">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="neo-btn neo-btn-dark text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/sign-in" className="neo-btn neo-btn-dark text-xs">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation tabs */}
        <AppNav />
      </div>
    </header>
  );
}
