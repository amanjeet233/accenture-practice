"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Shield, ArrowRight, AlertCircle, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#58A6FF]/10 blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#A371F7]/10 blur-3xl opacity-60" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#161B22] to-[#21262D] border border-[#30363D] text-[#58A6FF] shadow-lg">
            <Terminal className="w-6 h-6 text-[#58A6FF]" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[#F0F6FC]">
            Create your account
          </h1>
          <p className="text-xs text-[#8B949E] max-w-xs mx-auto">
            Start practicing verified Accenture MCQs, coding, and mock tests with isolated progress.
          </p>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F85149]/15 border border-[#F85149]/40 text-[#F85149] text-xs font-mono animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aman Sharma"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/20 focus:outline-none transition-all placeholder-[#484F58]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/20 focus:outline-none transition-all placeholder-[#484F58]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Password</span> <span className="text-[#8B949E] text-[10px]">(min 6 chars)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/20 focus:outline-none transition-all placeholder-[#484F58]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#F0F6FC] transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/20 focus:outline-none transition-all placeholder-[#484F58]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3FB950] disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(35,134,54,0.3)] hover:shadow-[0_0_20px_rgba(63,185,80,0.4)] cursor-pointer"
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

          <div className="pt-3 border-t border-[#30363D]/80 text-center text-xs font-mono text-[#8B949E]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#58A6FF] hover:underline font-semibold">
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
