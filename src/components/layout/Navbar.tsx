"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Bookmark,
  Search,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: "Problems", href: "/questions" },
    { label: "Accenture", href: "/companies/accenture" },
    { label: "SQL", href: "/sql" },
    { label: "Mock Tests", href: "/mock-tests" },
    { label: "Progress", href: "/progress" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363D] bg-[#161B22]/95 backdrop-blur-sm select-none">
      <div className="flex h-11 items-center justify-between px-3 sm:px-4">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold tracking-tight text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
          >
            <div className="h-6 w-6 rounded bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-xs tracking-wider">CODERTRACK</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 text-xs">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-[#21262D] text-[#F0F6FC] font-medium border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Controls: Search, Bookmarks, Profile, Settings */}
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/questions"
            className="p-1.5 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
            title="Search Problems"
          >
            <Search className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/bookmarks"
            className={`p-1.5 rounded transition-colors ${
              pathname.startsWith("/bookmarks")
                ? "text-[#F0F6FC] bg-[#21262D]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            }`}
            title="Bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/profile"
            className={`p-1.5 rounded transition-colors ${
              pathname === "/profile"
                ? "text-[#F0F6FC] bg-[#21262D]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            }`}
            title="Profile"
          >
            <User className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/settings"
            className={`p-1.5 rounded transition-colors ${
              pathname === "/settings"
                ? "text-[#F0F6FC] bg-[#21262D]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            }`}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#30363D] bg-[#161B22] px-3 py-2 space-y-0.5 text-xs font-mono">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 rounded text-[#F0F6FC] hover:bg-[#21262D]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-[#30363D]/60 space-y-0.5">
            <Link
              href="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            >
              Bookmarks
            </Link>
            <Link
              href="/submissions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            >
              History
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            >
              Profile / Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
