"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readSessionUser, signOutUser, type AuthUser } from "@/lib/auth-session";

export function AuthBar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(readSessionUser());
  }, []);

  function handleSignOut() {
    signOutUser();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white px-4 py-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-black/50">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-black">{user.name} · {user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:bg-swiss-accent hover:text-black"
      >
        Sign Out
      </button>
    </div>
  );
}
