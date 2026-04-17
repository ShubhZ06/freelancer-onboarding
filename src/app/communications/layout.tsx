"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function CommunicationsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
