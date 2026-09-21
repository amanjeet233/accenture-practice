"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Shield, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("A valid email address is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Successful registration -> redirect to login with query param
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#161B22] border border-[#30363D] text-[#58A6FF] shadow-sm">
            <Terminal className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#F0F6FC]">
            Create your account
          </h1>
          <p className="text-xs text-[#8B949E]">
            Start practicing verified Accenture MCQs, coding, and mock tests with isolated progress.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-6 shadow-xl space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aman Sharma"
                required
                className="w-full px-3 py-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3 py-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium">
                Password <span className="text-[#8B949E] text-[10px]">(min 6 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#30363D] text-center text-xs font-mono text-[#8B949E]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#58A6FF] hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#8B949E]">
          <Shield className="w-3.5 h-3.5 text-[#3FB950]" />
          <span>Server-side sessions with BCrypt encryption & HTTP-only cookies</span>
        </div>
      </div>
    </div>
  );
}
