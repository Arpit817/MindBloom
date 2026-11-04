"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Brain, PlayCircle, User } from "lucide-react";
import { cn } from "@/utils/cn";

const mobileNav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/notes",     label: "Notes",     Icon: BookOpen },
  { href: "/review",    label: "Review",    Icon: Brain },
  { href: "/learning",  label: "Learning",  Icon: PlayCircle },
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
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-blue-600"
                )}
              >
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
