"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, BookOpen, Layers, PlayCircle, BarChart2, Activity, User } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/notes",     label: "Notes",       Icon: BookOpen },
  { href: "/subjects",  label: "Subjects",    Icon: Layers },
  { href: "/review",    label: "Review",      Icon: Brain },
  { href: "/learning",  label: "Learning",    Icon: PlayCircle },
  { href: "/progress",  label: "Progress",    Icon: BarChart2 },
  { href: "/activity",  label: "Activity",    Icon: Activity },
  { href: "/profile",   label: "Profile",     Icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar hidden md:flex flex-col"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
        >
          <Brain size={18} color="white" />
        </div>
        <span
          className="text-lg font-extrabold text-white"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        >
          MindBloom
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Sidebar navigation">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-slate-500 text-center">MindBloom · Free forever</p>
      </div>
    </aside>
  );
}
