"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/acquisition", label: "Client Finder", icon: "◉" },
  { href: "/communications", label: "Client Communication", icon: "✉" },
  { href: "/contracts", label: "Contract Generator", icon: "📄" },
  { href: "/payment/generate", label: "Payments", icon: "💳" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {navigationItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-2 whitespace-nowrap border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-100 ${
              isActive
                ? "translate-x-0 translate-y-0 bg-black text-[#ffd93d] shadow-[4px_4px_0_0_#ff6b6b]"
                : "bg-white text-black shadow-[3px_3px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ffd93d] hover:shadow-[5px_5px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-sm" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
