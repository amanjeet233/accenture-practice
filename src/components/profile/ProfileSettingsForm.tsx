"use client";

import React, { useState } from "react";
import { User, Lock, CheckCircle2, AlertCircle, Sparkles, Save, Shield } from "lucide-react";

interface ProfileSettingsFormProps {
  initialName: string;
  email: string;
}

export function ProfileSettingsForm({ initialName, email }: ProfileSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 sm:p-6 shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3.5">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold font-mono text-[#F0F6FC] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#58A6FF]" />
            <span>Update Account & Security Settings</span>
          </h2>
          <p className="text-[11px] text-[#8B949E]">
            Manage your public display name and authentication password.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-mono border ${
            message.type === "success"
              ? "bg-[#238636]/15 border-[#3FB950]/40 text-[#3FB950]"
              : "bg-[#F85149]/15 border-[#F85149]/40 text-[#F85149]"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[#C9D1D9] font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8B949E]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:ring-1 focus:ring-[#58A6FF] focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#8B949E] font-medium flex items-center gap-1.5">
              <span>Email Address</span>
              <span className="text-[10px] text-[#6E7681]">(Permanent)</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117]/50 border border-[#30363D]/60 text-[#8B949E] text-xs font-mono cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#30363D]/60 space-y-3">
          <div className="text-[11px] font-semibold text-[#F0F6FC] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Change Password (Leave blank to keep current)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#8B949E]">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#8B949E]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full px-3 py-1.5 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#8B949E]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-1.5 rounded-md bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-[#58A6FF] focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(35,134,54,0.25)] cursor-pointer"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
