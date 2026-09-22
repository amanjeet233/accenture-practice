"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  LogOut,
  History,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenuOpen]);

  const NAV_LINKS = [
    { label: "Problems", href: "/questions" },
    { label: "Accenture", href: "/home/accenture" },
    { label: "SQL", href: "/sql" },
    { label: "Mock Tests", href: "/mock-tests" },
    { label: "Progress", href: "/progress" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#21262D] bg-[#0D1117]/90 backdrop-blur-md select-none transition-colors">
      <div className="flex h-12 items-center justify-between px-3 sm:px-5 max-w-7xl mx-auto">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#1F6FEB]/20 to-[#388BFD]/5 border border-[#388BFD]/30 flex items-center justify-center text-[#58A6FF] shadow-sm group-hover:border-[#58A6FF]/60 transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold tracking-wider text-[#F0F6FC]">
                CODERTRACK
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === link.href || pathname.startsWith(link.href);

              const isAccenture = link.label === "Accenture";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#161B22] text-[#F0F6FC] font-semibold border border-[#30363D] shadow-sm"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/70"
                  } ${isAccenture && !isActive ? "hover:text-[#58A6FF]" : ""}`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {isAccenture && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF]/80 inline-block" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Controls: Search, Bookmarks, User State */}
        <div className="flex items-center gap-2 text-xs">
          {/* Search Trigger */}
          <Link
            href="/home/accenture"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-[#58A6FF]/40 text-[#8B949E] hover:text-[#F0F6FC] transition-all shadow-sm"
            title="Search Assessment Bank"
          >
            <Search className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="hidden lg:inline text-[11px] text-[#6E7681]">Search...</span>
            <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#6E7681] font-mono">
              /
            </kbd>
          </Link>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            className={`p-1.5 rounded-lg border transition-all shadow-sm ${
              pathname.startsWith("/bookmarks")
                ? "text-[#58A6FF] bg-[#161B22] border-[#58A6FF]/40"
                : "text-[#8B949E] bg-[#161B22] hover:text-[#F0F6FC] hover:bg-[#21262D] border-[#30363D] hover:border-[#58A6FF]/40"
            }`}
            title="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* User Menu / Auth State */}
          {loading ? (
            <div className="h-7 w-20 bg-[#161B22] border border-[#30363D] rounded-lg animate-pulse" />
          ) : user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-[#58A6FF]/40 text-[#F0F6FC] font-mono text-xs transition-all shadow-sm"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#1F6FEB] to-[#238636] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#8B949E] transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-[#58A6FF]" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-[#30363D] bg-[#161B22]/98 backdrop-blur-xl p-1.5 shadow-2xl z-50 font-mono text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2.5 py-2 border-b border-[#21262D] mb-1">
                    <div className="text-[#F0F6FC] font-semibold truncate text-[11px]">{user.name}</div>
                    <div className="text-[#8B949E] text-[10px] truncate">{user.email}</div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/progress"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC] transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#3FB950]" />
                    <span>Progress</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC] transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-[#D29922]" />
                    <span>History</span>
                  </Link>
                  <div className="border-t border-[#21262D] my-1" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#F85149] hover:bg-[#DA3633]/15 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#F85149]" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] border border-transparent hover:border-[#30363D] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] text-white font-semibold shadow-md transition-all active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#21262D] bg-[#0D1117]/98 backdrop-blur-xl px-4 py-3 space-y-1 text-xs font-mono animate-in fade-in-50 duration-150">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#F0F6FC] hover:bg-[#161B22] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-[#21262D] space-y-1">
            <Link
              href="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] transition-colors"
            >
              Bookmarks
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] transition-colors"
            >
              History
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] transition-colors"
            >
              Profile / Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
