/**
 * Canonical Accenture Assessment Topic Taxonomy
 * Defines authoritative topic identifiers, display names, slugs, and database category mappings.
 */

export type CanonicalTopicId =
  | "NETWORKING"
  | "CYBERSECURITY"
  | "CLOUD"
  | "MS_OFFICE"
  | "PSEUDOCODE"
  | "DEVOPS"
  | "DBMS"
  | "SQL"
  | "JAVA_OOP"
  | "CODING"
  | "COMMUNICATION"
  | "INTERVIEW"
  | "FRONTEND"
  | "COMPUTER_FUNDAMENTALS";

export interface CanonicalTopicDefinition {
  id: CanonicalTopicId;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  questionType: "MCQ" | "CODING" | "SQL" | "HTML_CSS_JS" | "ANY";
  // The database category strings that correspond to this canonical topic
  dbCategories: string[];
}

export const CANONICAL_TOPICS: Record<CanonicalTopicId, CanonicalTopicDefinition> = {
  NETWORKING: {
    id: "NETWORKING",
    slug: "networking",
    name: "Networking",
    shortName: "Networking",
    description: "OSI model layers, TCP/IP, routing protocols, subnets, switches, and network topologies.",
    questionType: "MCQ",
    dbCategories: ["Networking"],
  },
  CYBERSECURITY: {
    id: "CYBERSECURITY",
    slug: "cybersecurity",
    name: "Cybersecurity",
    shortName: "Cybersecurity",
    description: "Network security, encryption, attack vectors, firewalls, and cybersecurity defense.",
    questionType: "MCQ",
    dbCategories: ["Cybersecurity", "Network Security & Cyber Security"],
  },
  CLOUD: {
    id: "CLOUD",
    slug: "cloud",
    name: "Cloud Computing",
    shortName: "Cloud",
    description: "Cloud architecture, IaaS/PaaS/SaaS models, scalability, and cloud scenarios.",
    questionType: "MCQ",
    dbCategories: ["Cloud", "Cloud Computing"],
  },
  MS_OFFICE: {
    id: "MS_OFFICE",
    slug: "ms-office",
    name: "Common Applications & MS Office",
    shortName: "MS Office",
    description: "Common applications, shortcuts, Excel functions, PowerPoint, Word, and Outlook.",
    questionType: "MCQ",
    dbCategories: ["MS Office", "Common Applications & MS Office"],
  },
  PSEUDOCODE: {
    id: "PSEUDOCODE",
    slug: "pseudocode",
    name: "Pseudocode & Algorithm Tracing",
    shortName: "Pseudocode",
    description: "Solve step-by-step logic, bitwise operations, loop execution, and recursion questions.",
    questionType: "MCQ",
    dbCategories: ["Pseudocode"],
  },
  DEVOPS: {
    id: "DEVOPS",
    slug: "devops",
    name: "DevOps & Infrastructure",
    shortName: "DevOps",
    description: "CI/CD pipelines, containerization, Git workflows, and deployment infrastructure.",
    questionType: "MCQ",
    dbCategories: ["DevOps"],
  },
  DBMS: {
    id: "DBMS",
    slug: "dbms",
    name: "Database Management Systems (DBMS)",
    shortName: "DBMS",
    description: "Relational database concepts, normalization, indexing, transactions, and ACID properties.",
    questionType: "MCQ",
    dbCategories: ["DBMS"],
  },
  SQL: {
    id: "SQL",
    slug: "sql",
    name: "SQL Queries & Relational Data",
    shortName: "SQL",
    description: "Interactive database queries, joins, aggregations, and window functions.",
    questionType: "ANY", // covers both SQL MCQs and SQL interactive queries
    dbCategories: ["SQL", "GENERAL_SQL"],
  },
  JAVA_OOP: {
    id: "JAVA_OOP",
    slug: "java-oop",
    name: "Java & Object-Oriented Programming",
    shortName: "Java / OOP",
    description: "Java fundamentals, OOP principles (inheritance, polymorphism, abstraction, encapsulation), collections, and JVM.",
    questionType: "MCQ",
    dbCategories: ["Java", "Java & OOP"],
  },
  CODING: {
    id: "CODING",
    slug: "coding",
    name: "Coding & Problem Solving",
    shortName: "Coding",
    description: "Canonical Accenture coding round problems: strings, arrays, math, and dynamic programming.",
    questionType: "CODING",
    dbCategories: [
      "Coding & Problem Solving",
      "ACCENTURE_PATTERN",
      "ACCENTURE_REPORTED",
      "GENERAL_DSA",
    ],
  },
  COMMUNICATION: {
    id: "COMMUNICATION",
    slug: "communication",
    name: "Critical Communication & Verbal",
    shortName: "Communication",
    description: "Grammar, sentence completion, reading comprehension, and professional communication.",
    questionType: "MCQ",
    dbCategories: ["Communication"],
  },
  INTERVIEW: {
    id: "INTERVIEW",
    slug: "interview",
    name: "Technical & HR Interview Preparation",
    shortName: "Interview",
    description: "Core technical questions, scenario-based evaluations, and HR interview preparation.",
    questionType: "MCQ",
    dbCategories: ["Interview Preparation", "Interview"],
  },
  FRONTEND: {
    id: "FRONTEND",
    slug: "frontend",
    name: "Frontend Development",
    shortName: "Frontend",
    description: "UI challenges, HTML/CSS/JavaScript manipulation, and DOM inspection.",
    questionType: "ANY",
    dbCategories: ["Frontend", "GENERAL_FRONTEND"],
  },
  COMPUTER_FUNDAMENTALS: {
    id: "COMPUTER_FUNDAMENTALS",
    slug: "computer-fundamentals",
    name: "Computer Fundamentals & OS",
    shortName: "Fundamentals",
    description: "Operating systems, memory management, process scheduling, and computer architecture.",
    questionType: "MCQ",
    dbCategories: ["Computer Fundamentals", "Operating Systems"],
  },
};

export const CANONICAL_TOPIC_LIST = Object.values(CANONICAL_TOPICS);

/**
 * Normalizes any topic input (slug, uppercase ID, raw category string) into a CanonicalTopicDefinition.
 * Returns null if the input is invalid.
 */
export function resolveCanonicalTopic(input?: string | null): CanonicalTopicDefinition | null {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase().replace(/[\s-]+/g, "_");

  // 1. Direct ID match
  if (CANONICAL_TOPICS[upper as CanonicalTopicId]) {
    return CANONICAL_TOPICS[upper as CanonicalTopicId];
  }

  // 2. Direct Slug match
  const bySlug = CANONICAL_TOPIC_LIST.find((t) => t.slug === lower);
  if (bySlug) return bySlug;

  // 3. Match against database categories
  for (const topic of CANONICAL_TOPIC_LIST) {
    for (const cat of topic.dbCategories) {
      if (cat.toLowerCase() === lower) {
        return topic;
      }
    }
  }

  // 4. Fuzzy / alias mappings
  if (lower.includes("network") && !lower.includes("security")) return CANONICAL_TOPICS.NETWORKING;
  if (lower.includes("security") || lower.includes("cyber")) return CANONICAL_TOPICS.CYBERSECURITY;
  if (lower.includes("cloud")) return CANONICAL_TOPICS.CLOUD;
  if (lower.includes("office") || lower.includes("excel") || lower.includes("word") || lower.includes("powerpoint")) return CANONICAL_TOPICS.MS_OFFICE;
  if (lower.includes("pseudo")) return CANONICAL_TOPICS.PSEUDOCODE;
  if (lower.includes("devops")) return CANONICAL_TOPICS.DEVOPS;
  if (lower.includes("dbms")) return CANONICAL_TOPICS.DBMS;
  if (lower === "sql" || lower.includes("query")) return CANONICAL_TOPICS.SQL;
  if (lower.includes("java") || lower.includes("oop")) return CANONICAL_TOPICS.JAVA_OOP;
  if (lower.includes("coding") || lower.includes("dsa") || lower.includes("algorithm")) return CANONICAL_TOPICS.CODING;
  if (lower.includes("communi") || lower.includes("verbal") || lower.includes("english")) return CANONICAL_TOPICS.COMMUNICATION;
  if (lower.includes("interview")) return CANONICAL_TOPICS.INTERVIEW;
  if (lower.includes("front") || lower.includes("html") || lower.includes("css")) return CANONICAL_TOPICS.FRONTEND;
  if (lower.includes("fundamental") || lower.includes("os") || lower.includes("operating")) return CANONICAL_TOPICS.COMPUTER_FUNDAMENTALS;

  return null;
}

/**
 * Builds a strict Prisma `where` clause that isolates questions exclusively to this canonical topic.
 */
export function getTopicPrismaFilter(topic: CanonicalTopicDefinition) {
  const categoryConditions = topic.dbCategories.map((c) => ({
    category: { equals: c, mode: "insensitive" as const },
  }));

  const baseFilter: any = {
    OR: categoryConditions,
  };

  // If questionType is constrained to MCQ, enforce it
  if (topic.questionType === "MCQ") {
    return {
      AND: [baseFilter, { questionType: "MCQ" }],
    };
  } else if (topic.questionType === "CODING") {
    return {
      AND: [baseFilter, { questionType: "CODING" }],
    };
  }

  return baseFilter;
}
