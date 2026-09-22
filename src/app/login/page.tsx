"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Shield, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const isRegistered = searchParams.get("registered") === "true";
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), password);

      if (!result.success) {
        setError(result.error || "Invalid email or password.");
        return;
      }

      router.push(redirectUrl);
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md space-y-6">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -left-12 -z-10 h-64 w-64 rounded-full bg-[#58A6FF]/10 blur-3xl opacity-60" />
      <div className="absolute -bottom-12 -right-12 -z-10 h-64 w-64 rounded-full bg-[#A371F7]/10 blur-3xl opacity-60" />

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#161B22] to-[#21262D] border border-[#30363D] text-[#58A6FF] shadow-lg">
          <Terminal className="w-6 h-6 text-[#58A6FF]" />
        </div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-[#F0F6FC]">
          Sign in to CODERTRACK
        </h1>
        <p className="text-xs text-[#8B949E] max-w-xs mx-auto">
          Access your personal practice history, mock tests, and progress reports.
        </p>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />

        {isRegistered && !error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#238636]/15 border border-[#3FB950]/40 text-[#3FB950] text-xs font-mono animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Registration successful! Please sign in with your credentials.</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F85149]/15 border border-[#F85149]/40 text-[#F85149] text-xs font-mono animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/20 focus:outline-none transition-all placeholder-[#484F58]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-[#C9D1D9] font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#8B949E]" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3FB950] disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(35,134,54,0.3)] hover:shadow-[0_0_20px_rgba(63,185,80,0.4)] cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#30363D]/80 text-center text-xs font-mono text-[#8B949E]">
          New to CODERTRACK?{" "}
          <Link href="/register" className="text-[#58A6FF] hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#8B949E]">
        <Shield className="w-3.5 h-3.5 text-[#3FB950]" />
        <span>Secure HTTP-only session authentication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <Suspense fallback={<div className="text-xs font-mono text-[#8B949E]">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
