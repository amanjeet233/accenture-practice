"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Shield, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const isRegistered = searchParams.get("registered") === "true";
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#161B22] border border-[#30363D] text-[#58A6FF] shadow-sm">
          <Terminal className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-[#F0F6FC]">
          Sign in to CODERTRACK
        </h1>
        <p className="text-xs text-[#8B949E]">
          Access your personal practice history, mock tests, and progress reports.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-6 shadow-xl space-y-5">
        {isRegistered && !error && (
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#238636]/10 border border-[#238636]/30 text-[#3FB950] text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Registration successful! Please sign in with your new credentials.</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
              className="w-full px-3 py-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs text-[#C9D1D9] font-medium">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#30363D] text-center text-xs font-mono text-[#8B949E]">
          New to CODERTRACK?{" "}
          <Link href="/register" className="text-[#58A6FF] hover:underline font-medium">
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
