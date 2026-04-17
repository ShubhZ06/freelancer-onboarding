"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth-session";
import { useSessionUser } from "@/lib/use-session-user";

export function AuthBar() {
  const router = useRouter();
  const user = useSessionUser();

  function handleSignOut() {
    signOutUser();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-4 border-black bg-[#c4b5fd] px-5 py-4 neo-shadow-md">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[#ffd93d] font-heading text-lg font-black uppercase text-black">
          {user.name.charAt(0) || "?"}
        </span>
        <div>
          <p className="font-heading text-[10px] font-black uppercase tracking-[0.28em] text-black">
            Signed In
          </p>
          <p className="mt-0.5 text-sm font-bold text-black">
            {user.name} · {user.email}
          </p>
        </div>
      </div>
      <button type="button" onClick={handleSignOut} className="neo-btn neo-btn-dark text-xs">
        Sign Out
      </button>
    </div>
  );
}
