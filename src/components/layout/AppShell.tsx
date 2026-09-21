"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The complete Accenture experience is one workspace. Keeping its routes out
  // of the product dashboard shell prevents dashboard navigation from leaking
  // into a test, practice, or tracking flow.
  const isAccentureWorkspace =
    pathname === "/home/accenture" || pathname.startsWith("/accenture/");

  if (isAccentureWorkspace) {
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
