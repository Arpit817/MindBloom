"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, BookOpen, Sparkles, User } from "lucide-react";
import { cn } from "@/utils/cn";

const mobileNav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/subjects",  label: "Subjects",  Icon: Layers },
  { href: "/notes",     label: "Notes",     Icon: BookOpen },
  { href: "/review",    label: "Review",    Icon: Sparkles },
  { href: "/profile",   label: "Profile",   Icon: User },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--sidebar-bg)] border-t border-white/10"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNav.map(({ href, label, Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-brand-600 shadow-md shadow-brand-600/30"
                )}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
