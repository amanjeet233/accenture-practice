"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/home/accenture");
        }
      }}
      className="inline-flex items-center gap-1.5 rounded border border-[#30363D] bg-[#161B22] px-2.5 py-1.5 font-mono text-[11px] text-[#8B949E] transition-colors hover:bg-[#21262D] hover:text-[#F0F6FC]"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>Back</span>
    </button>
  );
}
