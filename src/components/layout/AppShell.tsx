"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen workspaces without the dashboard sidebar:
  // - Accenture workspace & MCQ practice
  // - DSA & Frontend IDE (/questions/[slug], /problems/[slug])
  // - SQL IDE (/sql/[slug])
  // - Mock test exam interface (/mock-tests/[id])
  const isFullScreenWorkspace =
    pathname === "/home/accenture" ||
    pathname.startsWith("/accenture") ||
    pathname.startsWith("/questions/") ||
    pathname.startsWith("/sql/") ||
    pathname.startsWith("/problems/") ||
    pathname.startsWith("/mock-tests/");

  if (isFullScreenWorkspace) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-hidden bg-[#0D1117]">{children}</main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.25rem)] flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#0D1117]">{children}</main>
      </div>
    </>
  );
}
