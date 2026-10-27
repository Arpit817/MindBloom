"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  Layers,
  BookOpen,
  Sparkles,
  PlayCircle,
  BarChart2,
  Activity,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", Icon: Layers },
  { href: "/notes", label: "Notes", Icon: BookOpen },
  { href: "/review", label: "Review", Icon: Sparkles },
  { href: "/learning", label: "Learning", Icon: PlayCircle },
  { href: "/progress", label: "Progress", Icon: BarChart2 },
  { href: "/activity", label: "Activity", Icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <aside
      className="sidebar hidden md:flex flex-col justify-between"
      aria-label="Main navigation"
    >
      {/* Top Section */}
      <div>
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-5 border-b border-white/10 hover:opacity-90 transition-opacity"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20"
            style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
          >
            <Brain size={20} color="white" />
          </div>
          <div>
            <span
              className="text-lg font-extrabold text-white block leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              MindBloom
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Active Recall & Spaced Rep
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="px-3 py-4 flex flex-col gap-1" aria-label="Sidebar navigation">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={cn("sidebar-link", isActive && "active")}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "Student"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || "Signed in"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
