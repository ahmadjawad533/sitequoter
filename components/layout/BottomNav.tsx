"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, BarChart3, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      isActive: pathname.startsWith("/jobs"),
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      label: "Prices",
      href: "/prices",
      icon: Tag,
      isActive: pathname.startsWith("/prices"),
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-[720px] items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg",
                item.isActive
                  ? "text-[#1D4ED8]"
                  : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-1",
                  item.isActive ? "stroke-[2.25px]" : "stroke-[1.75px]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
