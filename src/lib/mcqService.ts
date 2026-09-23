import { prisma } from "@/lib/prisma";
import { cleanExplanationText } from "@/lib/explanationUtils";
import { ACCENTURE_COMPANY_FILTER } from "@/lib/accentureModules";
import { resolveCanonicalTopic, getTopicPrismaFilter } from "@/lib/canonicalTopics";

export interface McqOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface McqQuestionItem {
  id: string;
  slug: string;
  questionNumber: number;
  title: string;
  stem: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctKey: "A" | "B" | "C" | "D";
  correctAnswerText: string;
  explanation: string;
  importanceReason?: string | null;
  verificationStatus?: string;
  auditNote?: string;
  codeBlock?: string | null;
  codeLanguage?: string | null;
}

// Parse options A-D and clean prompt leakage
function parseOptionsAndStem(title: string, description: string): { options: { [k: string]: string }; stem: string } {
  const options: { [k: string]: string } = {};
  const lines = description.split("\n");
  let currentKey: string | null = null;
  let currentVal: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const optMatch = trimmed.match(
      /^(?:[-*•]\s*)?(?:\*\*)?([A-D])[\)\.]\s*(?:\*\*)?\s*(.*)/i
    );
    if (optMatch) {
      if (currentKey) {
        options[currentKey] = currentVal.join(" ").trim();
      }
      currentKey = optMatch[1].toUpperCase();
      currentVal = [optMatch[2].trim()];
    } else if (currentKey) {
      if (trimmed && !trimmed.startsWith("###") && !trimmed.startsWith("####")) {
        currentVal.push(trimmed);
      }
    }
  }
  if (currentKey) {
    options[currentKey] = currentVal.join(" ").trim();
  }

  // Extract preliminary stem from description
  const parts = description.split(
    /###?\s*Options|####?\s*Options|[-*•]\s*\*\*?[A-D]\)?\*\*?/i
  );
  let stem = parts[0].trim();
  stem = stem.replace(/^###?\s*.*?\n+/i, "").trim();
  stem = stem.replace(/^(?:Question:\s*|•\s*)/i, "").trim();

  // Check if Option D leaked the actual question
  if (options["D"]) {
    const qMatch = options["D"].match(/(?:^|[\.\?\!\s])((?:IN\s+|WHICH\s+|WHAT\s+|HOW\s+|IF\s+|WHERE\s+|WHEN\s+|AN\s+|A\s+|SCENARIO:?\s*)[^?]+\?)/i);
    if (qMatch && qMatch.index !== undefined && qMatch.index > 3) {
      const extractedQuestion = qMatch[1].trim();
      if (!stem || stem.toLowerCase() === "question" || stem.length < 15) {
        stem = extractedQuestion;
      }
      options["D"] = options["D"].slice(0, qMatch.index).trim();
    } else {
      // General match
      const trailingQ = options["D"].search(/(?:\bWhich\b|\bWhat\b|\bHow\b|\bIn Excel\b|\bIn Outlook\b|\bIf there\b|\bAn organization\b|\bScenario:?\b)/i);
      if (trailingQ > 10) {
        const leaked = options["D"].slice(trailingQ).trim();
        if (!stem || stem.toLowerCase() === "question" || stem.length < 15) {
          stem = leaked;
        }
        options["D"] = options["D"].slice(0, trailingQ).trim();
      }
    }
  }

  if (stem.length < 15 && title && title.length > stem.length && title.toLowerCase() !== "question") {
    stem = title;
  }

  if (!stem || stem.toLowerCase() === "question") {
    stem = title && title.toLowerCase() !== "question" ? title : "Identify the correct option based on standard technical principles:";
  }

  return { options, stem };
}

// Category-based plausible distractors for direct Q&A questions
const DISTRACTOR_POOLS: Record<string, string[]> = {
  "Common Applications & MS Office": [
    "Format Painter",
    "Conditional Formatting",
    "Data Validation",
    "VLOOKUP Formula",
    "Pivot Table",
    "Mail Merge",
    "AutoCorrect",
    "Spell Check",
    "Page Break Preview",
    "Track Changes",
    "Freeze Panes",
    "Macro Recorder",
  ],
  Networking: [
    "Border Gateway Protocol (BGP)",
    "Address Resolution Protocol (ARP)",
    "Domain Name System (DNS)",
    "Dynamic Host Configuration Protocol (DHCP)",
    "Transport Layer Security (TLS)",
    "Open Shortest Path First (OSPF)",
    "Transmission Control Protocol (TCP)",
    "User Datagram Protocol (UDP)",
    "Virtual Local Area Network (VLAN)",
    "Network Address Translation (NAT)",
  ],
  "Network Security & Cyber Security": [
    "Distributed Denial of Service (DDoS)",
    "Phishing and Social Engineering",
    "Ransomware Infection",
    "SQL Injection (SQLi)",
    "Cross-Site Scripting (XSS)",
    "Man-in-the-Middle (MitM) Attack",
    "Advanced Encryption Standard (AES)",
    "Intrusion Detection System (IDS)",
    "Multi-Factor Authentication (MFA)",
    "Zero-Day Vulnerability",
  ],
  "Cloud Computing": [
    "Infrastructure as a Service (IaaS)",
    "Platform as a Service (PaaS)",
    "Software as a Service (SaaS)",
    "Elastic Load Balancing (ELB)",
    "Auto-Scaling Group",
    "Virtual Private Cloud (VPC)",
    "Serverless Function (AWS Lambda)",
    "Simple Storage Service (S3)",
    "Identity and Access Management (IAM)",
    "Container Orchestration (Kubernetes)",
  ],
  Pseudocode: [
    "Returns 14",
    "Returns 22",
    "Returns 17",
    "Infinite recursion / StackOverflow",
    "Returns 0",
    "Returns 1",
    "Syntax Error",
    "Time Limit Exceeded",
  ],
  Default: [
    "Option not applicable in current architecture",
    "Requires privileged root access",
    "Standard library default behavior",
    "Linear time complexity O(N)",
  ],
};

function generateDistractors(category: string, correctAnswer: string): [string, string, string] {
  const pool = DISTRACTOR_POOLS[category] || DISTRACTOR_POOLS.Default;
  const filtered = pool.filter(
    (item) => !item.toLowerCase().includes(correctAnswer.toLowerCase().slice(0, 10))
  );
  
  const d1 = filtered[0] || "Alternative configuration parameter";
  const d2 = filtered[1] || "Default system setting";
  const d3 = filtered[2] || "Deprecated legacy protocol";
  return [d1, d2, d3];
}

// Convert a database Question row to McqQuestionItem
export function formatMcqQuestion(q: any, questionNumber: number): McqQuestionItem {
  // 1. Check if canonical starterCode payload is present (100% verified canonical record)
  if (q.starterCode) {
    try {
      const payload = JSON.parse(q.starterCode);
      if (payload.options && payload.options.length >= 2) {
        const finalOpts = {
          A: payload.options.find((o: any) => o.id === "A")?.text || "",
          B: payload.options.find((o: any) => o.id === "B")?.text || "",
          C: payload.options.find((o: any) => o.id === "C")?.text || "",
          D: payload.options.find((o: any) => o.id === "D")?.text || "",
        };
        const correctKey = (payload.correctOptionId || q.solution || "A") as "A" | "B" | "C" | "D";
        const correctAnswerText = payload.correctAnswerText || finalOpts[correctKey];
        const stem = payload.stem || (q.description ? q.description.split("### Options")[0].trim() : q.title);

        const cleanImportanceReason =
          q.importanceReason &&
          !q.importanceReason.includes("dropped or truncated") &&
          !q.importanceReason.includes("PDF conversion")
            ? q.importanceReason
            : null;

        return {
          id: q.id,
          slug: q.slug,
          questionNumber,
          title: q.title,
          stem: stem || q.title,
          category: q.category || "Accenture Assessment",
          difficulty: (q.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
          sourceType: q.sourceType || "SOURCE_DOCUMENT",
          options: finalOpts,
          correctKey,
          correctAnswerText,
          explanation: cleanExplanationText(q.explanation) || `The verified answer is ${correctAnswerText}.`,
          importanceReason: cleanImportanceReason,
          verificationStatus: payload.verificationStatus || q.verificationStatus || "VERIFIED",
          auditNote: payload.auditNote || undefined,
          codeBlock: payload.codeBlock || null,
          codeLanguage: payload.codeLanguage || null,
        };
      }
    } catch {
      // Fall through to legacy parsing
    }
  }

  const { options: parsedOpts, stem } = parseOptionsAndStem(q.title, q.description || "");
  let correctKey: "A" | "B" | "C" | "D" = "A";
  let explanation =
    q.explanation ||
    "Accenture assessments evaluate conceptual precision and accurate application of technical principles.";

  // Extract correct key from solution if available
  if (q.solution) {
    const keyMatch = q.solution.match(/^([A-D])\b/i);
    if (keyMatch) {
      correctKey = keyMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
    }
  }

  // Ensure 4 options
  let finalOpts = {
    A: parsedOpts["A"] || "",
    B: parsedOpts["B"] || "",
    C: parsedOpts["C"] || "",
    D: parsedOpts["D"] || "",
  };

  const hasAll4 = finalOpts.A && finalOpts.B && finalOpts.C && finalOpts.D;

  if (!hasAll4) {
    // If we have a solution string but missing 4 options (e.g. Q&A type)
    const solText = q.solution ? q.solution.replace(/^[A-D][\)\.\:\-]\s*/i, "").trim() : "";
    const answerText = solText || finalOpts.A || q.title;

    const [dist1, dist2, dist3] = generateDistractors(q.category || "General", answerText);

    // Deterministic position based on question number to vary answer positions (A, B, C, D)
    const posIndex = (questionNumber % 4);
    const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    correctKey = keys[posIndex];

    const allChoices: string[] = [];
    allChoices[posIndex] = answerText;
    const distractors = [dist1, dist2, dist3];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== posIndex) {
        allChoices[i] = distractors[dIdx++];
      }
    }

    finalOpts = {
      A: allChoices[0],
      B: allChoices[1],
      C: allChoices[2],
      D: allChoices[3],
    };
  }

  // If question had 4 options but solution was missing or null
  if (!q.solution) {
    // Smart resolution based on known Accenture question patterns
    const s = (stem + " " + q.title).toLowerCase();
    if (s.includes("mail merge") || s.includes("same layout but different content")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/mail merge/i.test(v)) correctKey = k as any;
      explanation = "Mail Merge in MS Word allows creating sets of documents with identical layout and formatting but individualized data per recipient.";
    } else if (s.includes("vlookup")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/first column/i.test(v)) correctKey = k as any;
      explanation = "=VLOOKUP looks up a value in the first column of a range and retrieves a value in the same row from a specified index.";
    } else if (s.includes("insert a new slide") || (s.includes("powerpoint") && s.includes("slide"))) {
      for (const [k, v] of Object.entries(finalOpts)) if (/ctrl\s*\+\s*m/i.test(v)) correctKey = k as any;
      explanation = "In Microsoft PowerPoint, pressing Ctrl + M inserts a new slide immediately following the currently active slide.";
    } else if (s.includes("out of office")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/automated reply/i.test(v)) correctKey = k as any;
      explanation = "The Out of Office Assistant in Microsoft Outlook configures automated email responses while you are away.";
    } else if (s.includes("extension for an excel") || s.includes(".xlsx")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/\.xlsx/i.test(v)) correctKey = k as any;
      explanation = ".xlsx is the default XML-based workbook format introduced in Microsoft Excel 2007 and utilized in all subsequent versions.";
    } else if (s.includes("autocorrect") || s.includes("typing errors")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/autocorrect/i.test(v)) correctKey = k as any;
      explanation = "AutoCorrect automatically fixes common spelling typos and punctuation errors in real-time as words are typed.";
    } else if (s.includes("dhcp") || s.includes("assign ip addresses")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/dhcp/i.test(v)) correctKey = k as any;
      explanation = "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and subnet masks to network hosts.";
    } else if (s.includes("router in a network") || s.includes("connect different networks")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/connect different networks/i.test(v)) correctKey = k as any;
      explanation = "Routers operate at Layer 3 (Network Layer) to route data packets between disparate networks based on logical IP addresses.";
    } else if (s.includes("session layer") || s.includes("establishing, managing")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/session/i.test(v)) correctKey = k as any;
      explanation = "Layer 5 (Session Layer) of the OSI model coordinates and synchronizes sessions and exchanges between network applications.";
    } else if (s.includes("ping command") || s.includes("reachability of a host")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/reachability/i.test(v)) correctKey = k as any;
      explanation = "The ping utility sends ICMP Echo Request messages to verify network connectivity and reachability of a target host.";
    } else if (s.includes("star topology") || s.includes("central hub")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/star/i.test(v)) correctKey = k as any;
      explanation = "In a star topology, each network node connects directly to a central hub, switch, or concentrator.";
    } else if (s.includes("https") || s.includes("secure communication over a network")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/https/i.test(v)) correctKey = k as any;
      explanation = "HTTPS secures web traffic over TCP port 443 via TLS encryption, safeguarding data confidentiality and authenticity.";
    } else if (s.includes("firewall in network security") || s.includes("block unauthorized access")) {
      for (const [k, v] of Object.entries(finalOpts)) if (/block unauthorized access/i.test(v)) correctKey = k as any;
      explanation = "Firewalls act as network security barriers, inspecting incoming and outgoing traffic and filtering unauthorized packets.";
    }
  }

  const correctAnswerText = finalOpts[correctKey] || finalOpts.A;

  return {
    id: q.id,
    slug: q.slug,
    questionNumber,
    title: q.title,
    stem,
    category: q.category || "Accenture Assessment",
    difficulty: (q.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
    sourceType: q.sourceType || "ACCENTURE_PATTERN",
    options: finalOpts,
    correctKey,
    correctAnswerText,
    explanation: cleanExplanationText(explanation),
    importanceReason:
      q.importanceReason &&
      !q.importanceReason.includes("dropped or truncated") &&
      !q.importanceReason.includes("PDF conversion")
        ? q.importanceReason
        : null,
    verificationStatus: q.verificationStatus || (q.solution ? "VERIFIED" : "NEEDS_VERIFICATION"),
    auditNote: q.solution ? undefined : "Answer key not explicitly verified in source",
  };
}

export interface PaginatedMcqPracticeResult {
  questions: McqQuestionItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Cache only the bounded page requested by the user, never the full question bank.
const practiceListCache: Record<
  string,
  { data: PaginatedMcqPracticeResult; expiresAt: number }
> = {};

let distinctCategoriesCache: { data: string[]; expiresAt: number } | null = null;

export async function getAccentureDistinctCategories(): Promise<string[]> {
  const now = Date.now();
  if (distinctCategoriesCache && distinctCategoriesCache.expiresAt > now) {
    return distinctCategoriesCache.data;
  }
  const distinct = await prisma.question.findMany({
    where: {
      AND: [ACCENTURE_COMPANY_FILTER, { questionType: "MCQ" }],
    },
    select: { category: true },
    distinct: ["category"],
  });
  const categories = distinct.map((c) => c.category).filter(Boolean) as string[];
  distinctCategoriesCache = {
    data: categories,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes cache
  };
  return categories;
}

// Fetch MCQs formatted and ready for Practice Mode (cached for 60 seconds)
export async function getAccentureMcqPracticeList(
  filterCategory?: string,
  page: number = 1,
  limit: number = 5000
): Promise<PaginatedMcqPracticeResult> {
  const canonical = resolveCanonicalTopic(filterCategory);
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(10000, Math.max(1, limit));
  const cacheKey = `${canonical ? `topic_${canonical.id}` : filterCategory || "all"}_p${safePage}_l${safeLimit}`;
  const now = Date.now();
  if (practiceListCache[cacheKey] && practiceListCache[cacheKey].expiresAt > now) {
    return practiceListCache[cacheKey].data;
  }

  let whereClause: any;
  if (canonical) {
    whereClause = {
      AND: [
        ACCENTURE_COMPANY_FILTER,
        getTopicPrismaFilter(canonical),
        { questionType: "MCQ" },
      ],
    };
  } else if (filterCategory && filterCategory !== "all") {
    whereClause = {
      AND: [
        ACCENTURE_COMPANY_FILTER,
        { questionType: "MCQ" },
        { category: { equals: filterCategory, mode: "insensitive" } },
      ],
    };
  } else {
    whereClause = {
      AND: [
        ACCENTURE_COMPANY_FILTER,
        { questionType: "MCQ" },
      ],
    };
  }

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where: whereClause,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        sourceType: true,
        solution: true,
        explanation: true,
        importanceReason: true,
        starterCode: true,
        frequency: true,
        createdAt: true,
      },
      orderBy: [
        { frequency: "desc" },
        { createdAt: "asc" },
      ],
    }),
    prisma.question.count({ where: whereClause }),
  ]);

  const result = {
    questions: questions.map((q, idx) =>
      formatMcqQuestion(q, (safePage - 1) * safeLimit + idx + 1)
    ),
    totalCount,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(totalCount / safeLimit),
  };

  practiceListCache[cacheKey] = {
    data: result,
    expiresAt: Date.now() + 60000,
  };

  return result;
}
