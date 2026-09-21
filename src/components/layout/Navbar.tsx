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
  ChevronDown,
  LogOut,
  History,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: "Problems", href: "/questions" },
    { label: "Accenture", href: "/accenture" },
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

        {/* Right Header Controls: Search, Bookmarks, User State */}
        <div className="flex items-center gap-2 text-xs">
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

          {loading ? (
            <div className="h-6 w-16 bg-[#21262D] rounded animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] font-mono text-[11px] transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#58A6FF]/20 text-[#58A6FF] flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-[#8B949E]" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 rounded-md border border-[#30363D] bg-[#161B22] py-1 shadow-lg z-50 font-mono text-xs">
                    <div className="px-3 py-1.5 border-b border-[#30363D] text-[11px]">
                      <div className="text-[#F0F6FC] font-semibold truncate">{user.name}</div>
                      <div className="text-[#8B949E] text-[10px] truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC]"
                    >
                      <User className="w-3.5 h-3.5 text-[#8B949E]" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/progress"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC]"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#8B949E]" />
                      <span>Progress</span>
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC]"
                    >
                      <History className="w-3.5 h-3.5 text-[#8B949E]" />
                      <span>History</span>
                    </Link>
                    <div className="border-t border-[#30363D] my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#F85149] hover:bg-[#21262D]"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#F85149]" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Link
                href="/login"
                className="px-2.5 py-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-2.5 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          )}

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
