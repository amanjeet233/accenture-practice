import React from "react";
import { cleanExplanationText } from "@/lib/explanationUtils";

export { cleanExplanationText };

interface ExplanationBoxProps {
  explanation?: string | null;
  className?: string;
}

/**
 * Standardized Explanation Card Component
 * - Vibrant blue left accent border separating it visually
 * - Subtle darker tinted background
 * - Bold "Explanation:" inline with the text
 * - Responsive, comfortable padding
 */
export function ExplanationBox({ explanation, className = "" }: ExplanationBoxProps) {
  const cleaned = cleanExplanationText(explanation);
  if (!cleaned) return null;

  return (
    <div
      className={`rounded-lg border-l-4 border-l-[#3B82F6] border border-[#1E293B] bg-[#0E1726] p-4 sm:p-4.5 text-xs sm:text-[13px] leading-relaxed shadow-sm font-sans transition-all ${className}`}
      data-testid="mcq-explanation-box"
    >
      <p className="m-0 leading-relaxed text-[#CBD5E1]">
        <strong className="font-bold text-[#60A5FA] mr-1.5 select-none">Explanation:</strong>
        <span className="font-normal text-[#E2E8F0]">{cleaned}</span>
      </p>
    </div>
  );
}

export default ExplanationBox;
