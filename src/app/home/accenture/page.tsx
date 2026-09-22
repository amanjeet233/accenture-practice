import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardList, History, Timer, Sparkles, Layers } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import {
  ACCENTURE_MODULES,
  getAccentureHeaderStats,
  getAccentureModuleCounts,
} from "@/lib/accentureModules";
import { BackButton } from "@/components/navigation/BackButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accenture Preparation | CodeTrack",
  description:
    "Accenture assessment preparation with topic-wise practice, coding, mock tests, and progress tracking.",
};

const MCQ_PRACTICE_TOPICS = new Set([
  "networking",
  "cybersecurity",
  "cloud",
  "ms-office",
]);

function getModuleHref(slug: string) {
  if (slug === "mcq") return "/accenture/mcq/practice";
  if (MCQ_PRACTICE_TOPICS.has(slug)) {
    return `/accenture/mcq/practice?module=${slug}`;
  }
  return `/accenture/${slug}`;
}

export default async function AccentureHomePage() {
  const user = await getSessionUser();
  const [moduleCounts, headerStats] = await Promise.all([
    getAccentureModuleCounts(user?.id),
    getAccentureHeaderStats(user?.id),
  ]);

  return (
    <div className="flex h-full min-h-0 font-sans text-xs">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="hidden h-full w-64 shrink-0 overflow-y-auto border-r border-[#30363D] bg-[#0D1117] p-4 lg:block scrollbar-thin scrollbar-thumb-[#30363D]">
        <div className="mb-4 border-b border-[#30363D] pb-3.5">
          <Link href="/home/accenture" className="font-mono text-sm font-bold tracking-wider text-[#F0F6FC] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#58A6FF]" />
            <span>ACCENTURE</span>
          </Link>
          <p className="mt-0.5 text-[10px] text-[#6E7681]">Assessment workspace</p>
        </div>
        <nav aria-label="Accenture modules" className="space-y-1">
          <Link
            href="/home/accenture"
            className="flex items-center justify-between rounded-md border-l-2 border-[#58A6FF] bg-[#21262D] px-3 py-2 font-mono text-[11px] font-semibold text-[#58A6FF]"
          >
            <span>Overview</span>
            <span className="text-[9px] uppercase text-[#6E7681]">Home</span>
          </Link>
          <div className="px-3 pb-1 pt-4 font-mono text-[9px] font-bold uppercase tracking-wider text-[#6E7681]">
            Workspace Modules
          </div>
          <Link
            href="/accenture/mcq/practice"
            title="All MCQ Practice Topics"
            className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-[#8B949E] transition-all hover:bg-[#161B22] hover:text-[#F0F6FC] border border-transparent hover:border-[#58A6FF]/20"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#58A6FF] group-hover:scale-110 transition-transform" />
            <span className="truncate text-[11px]">All Topics</span>
          </Link>
          {ACCENTURE_MODULES.filter(
            (module) => module.type === "QUESTIONS" && module.slug !== "mcq"
          ).map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={`workspace-${module.slug}`}
                href={getModuleHref(module.slug)}
                title={module.name}
                className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-[#8B949E] transition-all hover:bg-[#161B22] hover:text-[#F0F6FC] border border-transparent hover:border-[#58A6FF]/20"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#58A6FF] group-hover:scale-110 transition-transform" />
                <span className="truncate text-[11px]">{module.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="mx-auto min-w-0 max-w-7xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/home/accenture" className="transition-colors hover:text-[#F0F6FC]">
              ACCENTURE
            </Link>
            <span>/</span>
            <span className="font-semibold tracking-wider text-[#58A6FF]">OVERVIEW</span>
          </div>
          <BackButton />
        </div>

        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-xl border border-[#30363D] bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] p-6 sm:p-7 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />
          
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#58A6FF]">
                <Sparkles className="h-3 w-3 text-[#58A6FF]" />
                <span>ACCENTURE RECRUITMENT ASSESSMENT BANK</span>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F6FC]">
                ACCENTURE PREPARATION
              </h1>
              <p className="max-w-2xl text-xs text-[#8B949E] leading-relaxed">
                Build assessment readiness with focused technical practice, coding rounds,
                mock tests, and progress tracking.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 border border-[#30363D] bg-[#0D1117]/90 px-3.5 py-2 rounded-lg font-mono text-xs text-[#8B949E] shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FB950] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3FB950]"></span>
              </span>
              <span className="font-bold text-[#F0F6FC]">{moduleCounts.mcq ?? 0}</span>
              <span className="text-[#6E7681]">MCQs Live</span>
            </div>
          </div>
        </section>

        {/* Your Progress */}
        <section aria-labelledby="progress-heading" className="rounded-xl border border-[#30363D] bg-[#161B22]/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#30363D]/80 pb-3">
            <div className="space-y-0.5">
              <h2 id="progress-heading" className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#58A6FF]" />
                Your Preparation Progress
              </h2>
              <p className="text-[11px] text-[#8B949E]">Real-time performance metrics and question coverage status.</p>
            </div>
            <span className="rounded-full border border-[#3FB950]/30 bg-[#3FB950]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#3FB950]">
              LIVE SUMMARY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#3FB950]/50 hover:shadow-[0_0_15px_rgba(63,185,80,0.1)]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                <span>MCQs Solved</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3FB950]" />
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-[#3FB950] tracking-tight">{moduleCounts.progress ?? 0}</div>
            </div>

            <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#E3B341]/50 hover:shadow-[0_0_15px_rgba(227,179,65,0.1)]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                <span>Mock Attempts</span>
                <Timer className="h-3.5 w-3.5 text-[#E3B341]" />
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-[#F0F6FC] tracking-tight">{headerStats.totalAttempts}</div>
            </div>

            <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#58A6FF]/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.1)]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                <span>Average Accuracy</span>
                <BarChart3 className="h-3.5 w-3.5 text-[#58A6FF]" />
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-[#58A6FF] tracking-tight">{headerStats.accuracy}%</div>
            </div>

            <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#A371F7]/50 hover:shadow-[0_0_15px_rgba(163,113,247,0.1)]">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                <span>Question Bank</span>
                <ClipboardList className="h-3.5 w-3.5 text-[#A371F7]" />
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-[#F0F6FC] tracking-tight">{headerStats.totalQuestions}</div>
            </div>
          </div>
        </section>

        {/* Action Grids */}
        <section className="grid grid-cols-1 gap-5 border-t border-[#30363D] pt-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#D29922]" />
              Mock Tests
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["All Mock Tests", "/accenture/test", Timer],
                ["100 Questions · Mixed", "/accenture/test?count=100&duration=90", ClipboardList],
                ["200 Questions · Mixed", "/accenture/test?count=200&duration=150", ClipboardList],
                ["300 Questions · Mixed", "/accenture/test?count=300&duration=240", ClipboardList],
              ].map(([label, href, Icon]) => (
                <Link
                  key={label as string}
                  href={href as string}
                  className="group flex items-center gap-2.5 rounded-lg border border-[#30363D] bg-[#161B22] p-3 text-[#8B949E] transition-all hover:border-[#D29922]/60 hover:bg-[#21262D]/60 hover:text-[#F0F6FC] hover:shadow-[0_0_12px_rgba(210,153,34,0.15)]"
                >
                  <div className="p-1.5 rounded bg-[#D29922]/10 text-[#D29922] group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate font-mono text-xs font-medium">{label as string}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#58A6FF]" />
              Analytics & Tracking
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["Progress", "/accenture/progress", BarChart3],
                ["Analytics", "/accenture/analytics", BarChart3],
                ["Test History", "/accenture/history", History],
                ["MCQ Practice", "/accenture/mcq/practice", CheckCircle2],
              ].map(([label, href, Icon]) => (
                <Link
                  key={label as string}
                  href={href as string}
                  className="group flex items-center gap-2.5 rounded-lg border border-[#30363D] bg-[#161B22] p-3 text-[#8B949E] transition-all hover:border-[#58A6FF]/60 hover:bg-[#21262D]/60 hover:text-[#F0F6FC] hover:shadow-[0_0_12px_rgba(88,166,255,0.15)]"
                >
                  <div className="p-1.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate font-mono text-xs font-medium">{label as string}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
