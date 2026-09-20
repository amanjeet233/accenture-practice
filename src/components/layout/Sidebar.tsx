"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Code2,
  Building2,
  Database,
  MonitorCheck,
  Timer,
  Milestone,
  TrendingUp,
  Bookmark,
  History,
  Settings,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const PRIMARY_NAV: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Problems", href: "/questions", icon: Code2 },
  { name: "Accenture PYQs", href: "/companies/accenture", icon: Building2 },
  { name: "SQL", href: "/sql", icon: Database },
  { name: "Frontend", href: "/frontend", icon: MonitorCheck },
  { name: "Mock Tests", href: "/mock-tests", icon: Timer },
  { name: "Roadmap", href: "/practice", icon: Milestone },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

const SECONDARY_NAV: NavItem[] = [
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "History", href: "/submissions", icon: History },
  { name: "Settings", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-48 flex-shrink-0 border-r border-[#30363D] bg-[#0D1117] select-none text-xs">
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8B949E] font-semibold">
            Platform
          </div>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  isActive
                    ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                    : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-[#58A6FF]" : "text-[#8B949E]"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-0.5 pt-2 border-t border-[#30363D]/60">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8B949E] font-semibold">
            Workspace
          </div>
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  isActive
                    ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                    : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-[#58A6FF]" : "text-[#8B949E]"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Engine Status */}
      <div className="p-2.5 border-t border-[#30363D] text-[10px] font-mono text-[#8B949E] flex items-center justify-between bg-[#161B22]/30">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
          <span>OpenJDK 21</span>
        </div>
        <span className="text-[#6E7681]">LTS</span>
      </div>
    </aside>
  );
}
