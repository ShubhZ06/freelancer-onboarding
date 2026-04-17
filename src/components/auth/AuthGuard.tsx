"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { readSessionUser } from "@/lib/auth-session";

/**
 * Wraps protected pages. If no session is found the user is
 * redirected to the sign-in page automatically.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorised, setAuthorised] = useState<boolean | null>(null);

  useEffect(() => {
    const user = readSessionUser();
    if (!user) {
      router.replace("/sign-in");
    } else {
      setAuthorised(true);
    }
  }, [router]);

  /* Still checking — show a quick loading state */
  if (authorised === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin-slow border-4 border-black bg-[#ffd93d]" />
          <p className="font-heading text-xs font-black uppercase tracking-[0.25em] text-black">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
