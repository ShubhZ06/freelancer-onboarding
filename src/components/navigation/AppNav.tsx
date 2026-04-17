"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/acquisition", label: "Acquisition" },
  { href: "/contracts", label: "Contracts" },
  { href: "/signing", label: "Signing" },
  { href: "/expenses", label: "Expenses" },
  { href: "/settings", label: "Setup" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-950 text-white"
                : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-950"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
