"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import type { ReactNode } from "react";

/**
 * Layout for all authenticated app pages (dashboard, acquisition,
 * contracts, communications, settings). Wraps children in AuthGuard
 * so unauthenticated users are redirected to /sign-in.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
