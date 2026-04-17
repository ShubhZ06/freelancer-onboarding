"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/acquisition", label: "Acquisition" },
  { href: "/contracts", label: "Contracts" },
  { href: "/signing", label: "Signing" },
  { href: "/expenses", label: "Expenses" },
  { href: "/communications", label: "Communications" },
  { href: "/settings", label: "Setup" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end">
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition duration-150 ${
              isActive
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-swiss-muted hover:text-black"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
