import { prisma } from "@/lib/prisma";
import {
  FileCode2,
  Cpu,
  Layers,
  Network,
  ShieldCheck,
  Cloud,
  TerminalSquare,
  Code2,
  Database,
  MonitorCheck,
  MessageSquare,
  Users,
  Timer,
  TrendingUp,
} from "lucide-react";

export interface AccentureModuleConfig {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  type: "QUESTIONS" | "MOCK_TESTS" | "PROGRESS";
  queryFilter?: any;
}

export const ACCENTURE_MODULES: AccentureModuleConfig[] = [
  {
    slug: "mcq",
    name: "MCQ Practice",
    shortName: "MCQ",
    description: "Practice Accenture-style technical MCQs across all engineering domains.",
    icon: FileCode2,
    type: "QUESTIONS",
    queryFilter: { questionType: "MCQ" },
  },
  {
    slug: "pseudocode",
    name: "Pseudocode",
    shortName: "Pseudocode",
    description: "Solve step-by-step logic, bitwise operations, loop execution, and recursion questions.",
    icon: Cpu,
    type: "QUESTIONS",
    queryFilter: { category: "Pseudocode" },
  },
  {
    slug: "ms-office",
    name: "MS Office",
    shortName: "MS Office",
    description: "Common applications, shortcuts, Excel functions, PowerPoint, Word, and Outlook.",
    icon: Layers,
    type: "QUESTIONS",
    queryFilter: { category: "Common Applications & MS Office" },
  },
  {
    slug: "networking",
    name: "Networking",
    shortName: "Networking",
    description: "OSI model layers, TCP/IP, routing protocols, subnets, switches, and network topologies.",
    icon: Network,
    type: "QUESTIONS",
    queryFilter: { category: "Networking" },
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    shortName: "Cybersecurity",
    description: "Network security, encryption, attack vectors, firewalls, and cybersecurity defense.",
    icon: ShieldCheck,
    type: "QUESTIONS",
    queryFilter: { category: "Network Security & Cyber Security" },
  },
  {
    slug: "cloud",
    name: "Cloud Computing",
    shortName: "Cloud",
    description: "Cloud architecture, IaaS/PaaS/SaaS models, scalability, and cloud scenarios.",
    icon: Cloud,
    type: "QUESTIONS",
    queryFilter: { category: "Cloud Computing" },
  },
  {
    slug: "devops",
    name: "DevOps",
    shortName: "DevOps",
    description: "CI/CD pipelines, containerization, Git workflows, and deployment infrastructure.",
    icon: TerminalSquare,
    type: "QUESTIONS",
    queryFilter: { category: { contains: "DevOps", mode: "insensitive" } },
  },
  {
    slug: "coding",
    name: "Coding / DSA",
    shortName: "Coding",
    description: "Canonical Accenture coding round problems: strings, arrays, math, and dynamic programming.",
    icon: Code2,
    type: "QUESTIONS",
    queryFilter: { questionType: "CODING" },
  },
  {
    slug: "sql",
    name: "SQL",
    shortName: "SQL",
    description: "Interactive database queries, joins, aggregations, and window functions.",
    icon: Database,
    type: "QUESTIONS",
    queryFilter: { questionType: "SQL" },
  },
  {
    slug: "frontend",
    name: "Frontend",
    shortName: "Frontend",
    description: "UI challenges, HTML/CSS/JavaScript manipulation, and DOM inspection.",
    icon: MonitorCheck,
    type: "QUESTIONS",
    queryFilter: {
      OR: [
        { questionType: "HTML_CSS_JS" },
        { questionType: "FRONTEND" },
        { category: "GENERAL_FRONTEND" },
        { category: "Frontend" },
      ],
    },
  },
  {
    slug: "communication",
    name: "Communication",
    shortName: "Communication",
    description: "Grammar, sentence completion, reading comprehension, and professional communication.",
    icon: MessageSquare,
    type: "QUESTIONS",
    queryFilter: { category: { contains: "Communication", mode: "insensitive" } },
  },
  {
    slug: "interview",
    name: "Interview",
    shortName: "Interview",
    description: "Core technical questions, scenario-based evaluations, and HR interview preparation.",
    icon: Users,
    type: "QUESTIONS",
    queryFilter: { category: { contains: "Interview", mode: "insensitive" } },
  },
  {
    slug: "mock-tests",
    name: "Mock Tests",
    shortName: "Mocks",
    description: "Full-length timed assessment simulations mirroring actual Accenture test pattern.",
    icon: Timer,
    type: "MOCK_TESTS",
  },
  {
    slug: "progress",
    name: "Progress",
    shortName: "Progress",
    description: "Detailed performance tracking, domain mastery breakdown, and accuracy analysis.",
    icon: TrendingUp,
    type: "PROGRESS",
  },
];

export const ACCENTURE_COMPANY_FILTER = {
  OR: [
    { companies: { contains: "accenture" } },
    { questionCompanies: { some: { company: { slug: "accenture" } } } },
  ],
};

/**
 * Fetch real database counts for all modules in parallel
 */
export async function getAccentureModuleCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const questionPromises = ACCENTURE_MODULES.map(async (mod) => {
    if (mod.type === "MOCK_TESTS") {
      const cnt = await prisma.mockTest.count({
        where: {
          OR: [
            { company: { contains: "Accenture" } },
            { companyRef: { slug: "accenture" } },
          ],
        },
      });
      counts[mod.slug] = cnt;
    } else if (mod.type === "PROGRESS") {
      const cnt = await prisma.userProgress.count({
        where: { isSolved: true },
      });
      counts[mod.slug] = cnt;
    } else {
      const cnt = await prisma.question.count({
        where: {
          AND: [ACCENTURE_COMPANY_FILTER, mod.queryFilter],
        },
      });
      counts[mod.slug] = cnt;
    }
  });

  await Promise.all(questionPromises);
  return counts;
}

/**
 * Fetch real database stats for Accenture header
 */
export async function getAccentureHeaderStats() {
  const [totalQuestions, totalMockTests, totalAttempts] = await Promise.all([
    prisma.question.count({ where: ACCENTURE_COMPANY_FILTER }),
    prisma.mockTest.count({
      where: {
        OR: [
          { company: { contains: "Accenture" } },
          { companyRef: { slug: "accenture" } },
        ],
      },
    }),
    prisma.testAttempt.count(),
  ]);

  let accuracy = 0;
  if (totalAttempts > 0) {
    const agg = await prisma.testAttempt.aggregate({
      _avg: { accuracy: true },
    });
    accuracy = Math.round(agg._avg.accuracy || 0);
  }

  return {
    totalQuestions,
    totalMockTests,
    totalAttempts,
    accuracy,
  };
}
