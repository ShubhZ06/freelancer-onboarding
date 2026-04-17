"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
