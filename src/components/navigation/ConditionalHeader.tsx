"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

/* Routes that are accessible without login — no app header */
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

export function ConditionalHeader() {
  const pathname = usePathname();

  /* Hide the app header on public routes */
  if (PUBLIC_ROUTES.some((r) => pathname === r)) {
    return null;
  }

  return <SiteHeader />;
}
