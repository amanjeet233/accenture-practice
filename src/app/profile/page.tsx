import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { User as UserIcon, Code2, Award, Calendar, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Profile & Settings | CodeTrack",
  description: "User profile, active execution environments, and session telemetry.",
};

export default async function ProfilePage() {
  const [user, solvedProgress, recentSubmissions] = await Promise.all([
    prisma.user.findFirst({
      include: {
        submissions: {
          take: 10,
          orderBy: { submittedAt: "desc" },
        },
      },
    }),
    prisma.userProgress.findMany({
      where: { isSolved: true },
    }),
    prisma.submission.findMany({
      take: 50,
      select: { language: true },
    }),
  ]);

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CE";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Settings</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#58A6FF]" />
            Candidate Profile & System Settings
          </h1>
        </div>
      </div>

      {!user ? (
        <div className="p-8 rounded-md border border-[#30363D] bg-[#161B22] text-center space-y-2">
          <UserIcon className="w-6 h-6 text-[#6E7681] mx-auto" />
          <h3 className="text-xs font-semibold text-[#F0F6FC]">No candidate profile registered</h3>
          <p className="text-xs text-[#8B949E] max-w-md mx-auto">
            Your candidate profile and session telemetry will be automatically initialized on your first problem attempt.
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-md bg-[#161B22] border border-[#30363D] space-y-4 font-mono">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-[#21262D] flex items-center justify-center text-sm font-bold font-mono text-[#F0F6FC] border border-[#30363D]">
              {initials}
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-[#F0F6FC]">{user.name}</h2>
              <p className="text-xs text-[#8B949E]">{user.email}</p>
              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <span className="px-1.5 py-0.2 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                  Target: Accenture Technical Assessment
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30">
                  Active Candidate
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#30363D] text-xs">
            <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D]">
              <span className="text-[10px] text-[#8B949E] uppercase">Solved Problems</span>
              <div className="text-lg font-bold text-[#F0F6FC] mt-0.5">
                {solvedProgress.length}
              </div>
            </div>
            <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D]">
              <span className="text-[10px] text-[#8B949E] uppercase">Preferred Runtime</span>
              <div className="text-lg font-bold text-[#58A6FF] mt-0.5">
                {topLang}
              </div>
            </div>
            <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D]">
              <span className="text-[10px] text-[#8B949E] uppercase">Registered Since</span>
              <div className="text-xs font-medium text-[#8B949E] mt-1.5">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
