import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardList, History, Timer } from "lucide-react";
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
      <aside className="hidden h-full w-60 shrink-0 overflow-y-auto border-r border-[#30363D] bg-[#0D1117] p-4 lg:block">
        <div className="mb-5 border-b border-[#30363D] pb-4">
          <Link href="/home/accenture" className="font-mono text-sm font-bold tracking-wider text-[#F0F6FC]">
            ACCENTURE
          </Link>
          <p className="mt-1 text-[10px] text-[#6E7681]">Assessment workspace</p>
        </div>
        <nav aria-label="Accenture modules" className="space-y-1">
          <Link
            href="/home/accenture"
            className="flex items-center justify-between rounded border-l-2 border-[#58A6FF] bg-[#21262D] px-3 py-2 font-mono text-[11px] font-semibold text-[#58A6FF]"
          >
            <span>Overview</span>
            <span className="text-[9px] uppercase text-[#6E7681]">Home</span>
          </Link>
          <div className="px-3 pb-1 pt-4 font-mono text-[9px] uppercase tracking-wider text-[#6E7681]">
            Workspace
          </div>
          <Link
            href="/accenture/mcq/practice"
            className="flex items-center gap-2 rounded px-3 py-2 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#F0F6FC]"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#58A6FF]" />
            <span className="truncate">All Topics</span>
          </Link>
          {ACCENTURE_MODULES.filter(
            (module) => module.type === "QUESTIONS" && module.slug !== "mcq"
          ).map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={`workspace-${module.slug}`}
                href={getModuleHref(module.slug)}
                className="flex items-center gap-2 rounded px-3 py-2 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#F0F6FC]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#58A6FF]" />
                <span className="truncate">{module.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="mx-auto min-w-0 max-w-7xl flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/home/accenture" className="transition-colors hover:text-[#F0F6FC]">
              ACCENTURE
            </Link>
            <span>/</span>
            <span className="font-semibold tracking-wider text-[#F0F6FC]">OVERVIEW</span>
          </div>
          <BackButton />
        </div>

        <section className="border-b border-[#30363D] pb-5">
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#58A6FF]">
          Assessment preparation
        </div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-[#F0F6FC]">
              ACCENTURE
            </h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-[#8B949E]">
              Build assessment readiness with focused technical practice, coding rounds,
              mock tests, and progress tracking.
            </p>
          </div>
          <div className="shrink-0 border border-[#30363D] bg-[#161B22] px-3 py-2 font-mono text-[11px] text-[#8B949E]">
            {moduleCounts.mcq ?? 0} MCQs available
          </div>
        </div>
        </section>

        <section aria-labelledby="progress-heading" className="border border-[#30363D] bg-[#161B22] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 id="progress-heading" className="font-mono text-sm font-semibold uppercase tracking-wide text-[#F0F6FC]">
                Your progress
              </h2>
              <p className="mt-1 text-[11px] text-[#8B949E]">Your Accenture preparation status, available directly on this workspace.</p>
            </div>
            <span className="border border-[#58A6FF]/30 bg-[#58A6FF]/10 px-2 py-1 font-mono text-[10px] font-semibold text-[#58A6FF]">
              LIVE SUMMARY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="border border-[#30363D] bg-[#0D1117] p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-[#6E7681]">MCQs solved</div>
              <div className="mt-1 font-mono text-xl font-bold text-[#3FB950]">{moduleCounts.progress ?? 0}</div>
            </div>
            <div className="border border-[#30363D] bg-[#0D1117] p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-[#6E7681]">Mock attempts</div>
              <div className="mt-1 font-mono text-xl font-bold text-[#F0F6FC]">{headerStats.totalAttempts}</div>
            </div>
            <div className="border border-[#30363D] bg-[#0D1117] p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-[#6E7681]">Average accuracy</div>
              <div className="mt-1 font-mono text-xl font-bold text-[#58A6FF]">{headerStats.accuracy}%</div>
            </div>
            <div className="border border-[#30363D] bg-[#0D1117] p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-[#6E7681]">Question bank</div>
              <div className="mt-1 font-mono text-xl font-bold text-[#F0F6FC]">{headerStats.totalQuestions}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 border-t border-[#30363D] pt-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wide text-[#F0F6FC]">
              Mock tests
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["All Mock Tests", "/accenture/test?count=300&duration=240", Timer],
                ["100 Questions · Mixed", "/accenture/test?count=100&duration=90", ClipboardList],
                ["200 Questions · Mixed", "/accenture/test?count=200&duration=150", ClipboardList],
                ["300 Questions · Mixed", "/accenture/test?count=300&duration=240", ClipboardList],
              ].map(([label, href, Icon]) => (
                <Link
                  key={href as string}
                  href={href as string}
                  className="flex items-center gap-2 border border-[#30363D] bg-[#161B22] px-3 py-2.5 text-[#8B949E] transition-colors hover:border-[#D29922]/60 hover:text-[#F0F6FC]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#D29922]" />
                  <span className="truncate">{label as string}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wide text-[#F0F6FC]">
              Tracking
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Progress", "/accenture/progress", BarChart3],
                ["Analytics", "/accenture/analytics", BarChart3],
                ["Test History", "/accenture/history", History],
                ["MCQ Practice", "/accenture/mcq/practice", CheckCircle2],
              ].map(([label, href, Icon]) => (
                <Link
                  key={href as string}
                  href={href as string}
                  className="flex items-center gap-2 border border-[#30363D] bg-[#161B22] px-3 py-2.5 text-[#8B949E] transition-colors hover:border-[#58A6FF]/60 hover:text-[#F0F6FC]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#58A6FF]" />
                  <span className="truncate">{label as string}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
