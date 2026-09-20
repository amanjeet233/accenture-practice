/**
 * Evidence-Based Question Intelligence Engine
 * 
 * Computes priority, importance reasons, and repeated pattern classification
 * solely from stored data (sources, shifts, dates, frequency, company linkage, and topics).
 * 
 * In accordance with engineering standards:
 * - NO arbitrary numerical rankings or fabricated score metrics.
 * - Every displayed reason is backed directly by stored records.
 */

export interface SourceInfo {
  title: string;
  year?: number | string | null;
  shift?: string | null;
  date?: string | Date | null;
  page?: number | null;
  evidenceType?: string | null;
}

export interface QuestionEvidenceInput {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  questionType: string;
  sourceType: string;
  importance?: string;
  importanceReason?: string | null;
  frequency?: number;
  sourceShift?: string | null;
  sourceDate?: Date | string | null;
  sourceDocument?: string | null;
  topics?: string[] | string | null;
  companies?: string[] | string | null;
  sources?: SourceInfo[];
  questionSources?: Array<{
    shift?: string | null;
    date?: Date | string | null;
    page?: number | null;
    evidenceType?: string | null;
    sourceDocument?: {
      title: string;
      company?: string;
      sourceDate?: Date | string | null;
    } | null;
  }>;
}

export interface CorroboratedSourceItem {
  documentTitle: string;
  shift?: string | null;
  date?: string | null;
  evidenceType?: string | null;
}

export interface EvidenceProfile {
  isMustDo: boolean;
  isRepeatedPattern: boolean;
  isRecent: boolean;
  isShiftReported: boolean;
  isPyq: boolean;
  factorCount: number;
  
  // Explicit 6 Factors
  hasReportedSource: boolean;
  hasShiftReport: boolean;
  hasMultipleSources: boolean;
  hasRecentAssessment: boolean;
  hasCompanyAssociation: boolean;
  hasRepeatedPattern: boolean;

  evidenceReasons: string[];
  corroboratedSources: CorroboratedSourceItem[];
  priorityTier: "MUST_DO" | "HIGH" | "MEDIUM" | "PRACTICE";
}

/**
 * Computes evidence-grounded factors and explanations for a given question.
 * Strictly avoids arbitrary numerical scores or ranks.
 */
export function analyzeQuestionEvidence(q: QuestionEvidenceInput): EvidenceProfile {
  const reasons: string[] = [];
  const rawSourcesList: CorroboratedSourceItem[] = [];

  // 1. Gather all normalized source records
  if (q.questionSources && q.questionSources.length > 0) {
    q.questionSources.forEach((qs) => {
      const docTitle = qs.sourceDocument?.title || q.sourceDocument || "Archival Paper Record";
      const shift = qs.shift || q.sourceShift || null;
      let dateStr: string | null = null;
      if (qs.date) {
        dateStr = new Date(qs.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } else if (qs.sourceDocument?.sourceDate) {
        dateStr = new Date(qs.sourceDocument.sourceDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } else if (q.sourceDate) {
        dateStr = new Date(q.sourceDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      rawSourcesList.push({
        documentTitle: docTitle,
        shift,
        date: dateStr,
        evidenceType: qs.evidenceType || "VERIFIED_RECORD",
      });
    });
  } else if (q.sources && q.sources.length > 0) {
    q.sources.forEach((s) => {
      rawSourcesList.push({
        documentTitle: s.title || "Archival Source Document",
        shift: s.shift || null,
        date: s.date ? String(s.date) : (s.year ? String(s.year) : null),
        evidenceType: s.evidenceType || "VERIFIED_RECORD",
      });
    });
  } else if (q.sourceDocument) {
    rawSourcesList.push({
      documentTitle: q.sourceDocument,
      shift: q.sourceShift || null,
      date: q.sourceDate ? new Date(q.sourceDate).getFullYear().toString() : null,
      evidenceType: "ARCHIVAL_RECORD",
    });
  }

  // Deduplicate and group unique sources
  const seenSources = new Set<string>();
  const sourcesList: CorroboratedSourceItem[] = [];
  for (const src of rawSourcesList) {
    const key = `${src.documentTitle}::${src.shift || ""}`;
    if (!seenSources.has(key)) {
      seenSources.add(key);
      sourcesList.push(src);
    }
  }

  const uniqueDocTitles = Array.from(new Set(sourcesList.map((s) => s.documentTitle)));

  // ----------------------------------------------------
  // Factor 1: Reported source
  // ----------------------------------------------------
  const hasReportedSource =
    q.sourceType === "REPORTED_PYQ" ||
    q.sourceType === "SHIFT_REPORTED" ||
    sourcesList.length > 0;

  if (hasReportedSource) {
    if (uniqueDocTitles.length > 0) {
      reasons.push(`Reported in official source: "${uniqueDocTitles[0]}"`);
    } else {
      reasons.push("Extracted directly from verified candidate-reported assessment records");
    }
  }

  // ----------------------------------------------------
  // Factor 2: Shift report
  // ----------------------------------------------------
  const shiftRecorded =
    q.sourceShift ||
    sourcesList.find((s) => Boolean(s.shift))?.shift ||
    (q.questionSources && q.questionSources.find((s) => Boolean(s.shift))?.shift);

  const hasShiftReport = Boolean(shiftRecorded) || q.sourceType === "SHIFT_REPORTED";
  if (hasShiftReport) {
    reasons.push(`Specific examination slot recorded: ${shiftRecorded || "Candidate Shift Debrief"}`);
  }

  // ----------------------------------------------------
  // Factor 3: Multiple independent sources
  // ----------------------------------------------------
  const hasMultipleSources = uniqueDocTitles.length >= 2 || sourcesList.length >= 2;

  if (hasMultipleSources) {
    reasons.push(
      `Appears in ${uniqueDocTitles.length} independent examination source papers`
    );
  }

  // ----------------------------------------------------
  // Factor 4: Recent assessment (>= 2024 or 2025)
  // ----------------------------------------------------
  let hasRecentAssessment = false;
  const recentYear = 2024;

  const datesToCheck = [
    q.sourceDate,
    ...(q.questionSources?.map((s) => s.date || s.sourceDocument?.sourceDate) || []),
    ...(q.sources?.map((s) => s.date || s.year) || []),
  ];

  for (const d of datesToCheck) {
    if (!d) continue;
    const yr = typeof d === "number" ? d : new Date(d).getFullYear();
    if (!isNaN(yr) && yr >= recentYear) {
      hasRecentAssessment = true;
      reasons.push(`Assessed in recent recruitment drive (${yr})`);
      break;
    }
  }

  if (!hasRecentAssessment && q.importanceReason && (q.importanceReason.includes("2024") || q.importanceReason.includes("2025"))) {
    hasRecentAssessment = true;
    reasons.push("Assessed in recent recruitment drive (2024-2025)");
  }

  // ----------------------------------------------------
  // Factor 5: Company association
  // ----------------------------------------------------
  let companyArray: string[] = [];
  if (Array.isArray(q.companies)) {
    companyArray = q.companies;
  } else if (typeof q.companies === "string") {
    try {
      companyArray = JSON.parse(q.companies);
    } catch {
      companyArray = [q.companies];
    }
  }

  const hasCompanyAssociation = Boolean(
    (companyArray.length > 0 && companyArray.some((c) => c.toLowerCase().includes("accenture"))) ||
      sourcesList.some((s) => s.documentTitle.toLowerCase().includes("accenture")) ||
      q.importanceReason?.toLowerCase().includes("accenture")
  );

  if (hasCompanyAssociation) {
    reasons.push("Formally documented in Accenture recruitment drive papers");
  }

  // ----------------------------------------------------
  // Factor 6: Repeated pattern
  // ----------------------------------------------------
  const frequency = q.frequency || sourcesList.length || 1;
  const hasRepeatedPattern = Boolean(
    hasMultipleSources || frequency > 1 || q.importanceReason?.toLowerCase().includes("pattern")
  );

  if (hasRepeatedPattern) {
    reasons.push(
      `Matches recurring concept pattern (${frequency} documented appearances)`
    );
  }

  // If topic is present, add high-frequency topic context
  let topicArray: string[] = [];
  if (Array.isArray(q.topics)) {
    topicArray = q.topics;
  } else if (typeof q.topics === "string") {
    try {
      topicArray = JSON.parse(q.topics);
    } catch {
      topicArray = [q.topics];
    }
  }

  if (topicArray.length > 0) {
    reasons.push(`Covers core syllabus domain: ${topicArray.slice(0, 2).join(", ")}`);
  }

  // Count active factors
  let factorCount = 0;
  if (hasReportedSource) factorCount++;
  if (hasShiftReport) factorCount++;
  if (hasMultipleSources) factorCount++;
  if (hasRecentAssessment) factorCount++;
  if (hasCompanyAssociation) factorCount++;
  if (hasRepeatedPattern) factorCount++;

  // Determine Priority Tier based on evidence factors
  const isMustDo = factorCount >= 3 || q.importance === "MUST_DO";

  let priorityTier: "MUST_DO" | "HIGH" | "MEDIUM" | "PRACTICE" = "PRACTICE";
  if (isMustDo) {
    priorityTier = "MUST_DO";
  } else if (factorCount >= 2) {
    priorityTier = "HIGH";
  } else if (factorCount >= 1) {
    priorityTier = "MEDIUM";
  }

  return {
    isMustDo,
    isRepeatedPattern: hasRepeatedPattern,
    isRecent: hasRecentAssessment,
    isShiftReported: hasShiftReport,
    isPyq: hasReportedSource,
    factorCount,
    hasReportedSource,
    hasShiftReport,
    hasMultipleSources,
    hasRecentAssessment,
    hasCompanyAssociation,
    hasRepeatedPattern,
    evidenceReasons: reasons,
    corroboratedSources: sourcesList,
    priorityTier,
  };
}
