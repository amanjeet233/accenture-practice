import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bookmark, ArrowRight, Folder } from "lucide-react";
import { DifficultyBadge, ImportanceBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookmarks | CodeTrack",
  description: "Pinned problems organized for rapid review and interview practice.",
};

export default async function BookmarksPage() {
  const bookmarks = await prisma.bookmark.findMany({
    include: {
      question: {
        select: {
          title: true,
          slug: true,
          difficulty: true,
          importance: true,
          topics: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Bookmarks</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#D29922]" />
            Saved Problems
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Bookmarked questions for priority study, spaced repetition, and revision before interview rounds.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
          {bookmarks.length} saved
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="p-8 text-center rounded-md border border-[#30363D] bg-[#161B22] space-y-2">
          <Bookmark className="w-6 h-6 text-[#6E7681] mx-auto" />
          <p className="text-xs font-mono text-[#8B949E]">
            No bookmarked questions yet. Click the bookmark icon in any problem to pin it here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                  <th className="py-2 px-3">Problem</th>
                  <th className="py-2 px-3 w-20">Difficulty</th>
                  <th className="py-2 px-3 w-24">Folder</th>
                  <th className="py-2 px-3 w-32">Saved On</th>
                  <th className="py-2 px-3 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60 font-mono">
                {bookmarks.map((b) => (
                  <tr key={b.id} className="hover:bg-[#21262D]/40 transition-colors">
                    <td className="py-2 px-3">
                      <Link
                        href={`/questions/${b.question.slug}`}
                        className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                      >
                        {b.question.title}
                      </Link>
                      {b.note && (
                        <div className="text-[10px] text-[#8B949E] truncate">
                          Note: {b.note}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <DifficultyBadge difficulty={b.question.difficulty as any} />
                    </td>
                    <td className="py-2 px-3 text-[#8B949E]">
                      <span className="inline-flex items-center gap-1 text-[10px]">
                        <Folder className="w-3 h-3 text-[#58A6FF]" />
                        <span>{b.folderName}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#8B949E] text-[10px]">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Link
                        href={`/questions/${b.question.slug}`}
                        className="px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-[11px] transition-colors"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
