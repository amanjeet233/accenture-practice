import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User as UserIcon, Code2, Award, Calendar, CheckCircle2, Shield, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Profile & Settings | CodeTrack",
  description: "User profile, active execution environments, and session telemetry.",
};

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login?redirect=/profile");
  }

  const [dbUser, solvedCount, recentSubmissions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
    }),
    prisma.userProgress.count({
      where: { userId: sessionUser.id, isSolved: true },
    }),
    prisma.submission.findMany({
      where: { userId: sessionUser.id },
      take: 50,
      select: { language: true },
    }),
  ]);

  const activeUser = dbUser || sessionUser;

  // Compute most used language from actual submissions
  const langCounts: Record<string, number> = {};
  recentSubmissions.forEach((s) => {
    langCounts[s.language] = (langCounts[s.language] || 0) + 1;
  });
  let topLang = "Java 21 (Default)";
  let maxCount = 0;
  Object.entries(langCounts).forEach(([lang, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topLang = lang === "java" ? "Java 21" : lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  });

  const initials = activeUser.name
    ? activeUser.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3.5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Settings</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2 mt-1">
            <Settings className="w-5 h-5 text-[#58A6FF]" />
            Candidate Profile & System Settings
          </h1>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#161B22] border border-[#30363D] p-5 sm:p-6 shadow-md space-y-5 font-mono">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#21262D] to-[#161B22] flex items-center justify-center text-base font-bold font-mono text-[#58A6FF] border border-[#58A6FF]/40 shadow-inner">
              {initials}
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#F0F6FC]">{activeUser.name}</h2>
              <p className="text-xs text-[#8B949E]">{activeUser.email}</p>
              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                  Target: Accenture Technical Assessment
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/40 font-semibold">
                  Active Candidate
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#30363D]/80 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Solved Problems</span>
            <div className="text-2xl font-black text-[#3FB950]">
              {solvedCount}
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Preferred Runtime</span>
            <div className="text-xl font-bold text-[#58A6FF]">
              {topLang}
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Registered Since</span>
            <div className="text-sm font-semibold text-[#F0F6FC] mt-0.5">
              {formatDate(activeUser.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <ProfileSettingsForm initialName={activeUser.name} email={activeUser.email} />
    </div>
  );
}
