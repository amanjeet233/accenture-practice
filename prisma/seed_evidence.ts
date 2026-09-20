import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== Enriching Evidence & Multi-Source Cross-Corroboration ===");

  const docs = await prisma.sourceDocument.findMany();
  const docMap = new Map(docs.map((d) => [d.title, d.id]));

  const getDocId = (title: string) => {
    const id = docMap.get(title);
    if (!id) console.warn(`Doc not found: ${title}`);
    return id;
  };

  const mncArchiveId = getDocId("ALL MNC CODING Collection Questions (367-Page Archive)");
  const ase2024Id = getDocId("Accenture ASE 2024 On-Campus Drive Official Paper Compilation");
  const shift1Id = getDocId("Accenture National Assessment - 8 September Shift 1 Debrief");
  const shift2Id = getDocId("Accenture National Assessment - 8 September Shift 2 Debrief");
  const oct2025Id = getDocId("Accenture 11 October 2025 On-Campus Exam Questions");
  const sql50Id = getDocId("Top 50 SQL Queries for Technical Interviews");
  const movieDbId = getDocId("Movie Streaming Service Database Assessment");
  const feBenchId = getDocId("Frontend Technical Benchmark - Product Search Filter");

  // Multi-source linking configurations for canonical questions
  const multiSourceLinks = [
    {
      slug: "binary-string-operations-evaluator",
      sources: [
        {
          docId: ase2024Id,
          shift: "Slot 1 (10:00 AM)",
          date: new Date("2024-08-22"),
          evidenceType: "ON_CAMPUS_PAPER",
          section: "Round 2 Coding",
          notes: "Reported in Slot 1 morning assessment",
        },
        {
          docId: mncArchiveId,
          shift: "Slot 2 (Afternoon)",
          date: new Date("2022-09-14"),
          evidenceType: "HIREPRO_ARCHIVE",
          section: "Section C (Algorithmic Logic)",
          notes: "367-Page MNC compilation archive",
        },
      ],
      frequency: 3,
      importance: "MUST_DO",
    },
    {
      slug: "difference-of-sums-in-range",
      sources: [
        {
          docId: mncArchiveId,
          shift: null,
          date: new Date("2022-06-15"),
          evidenceType: "HIREPRO_ARCHIVE",
          section: "Mathematical Reasoning",
          notes: "Repeated in 2022 HirePro papers",
        },
        {
          docId: shift1Id,
          shift: "Shift 1",
          date: new Date("2024-09-08"),
          evidenceType: "MEMORY_DEBRIEF",
          section: "Section 2 Coding",
          notes: "Corroborated by candidate debrief 8 Sept Shift 1",
        },
      ],
      frequency: 2,
      importance: "MUST_DO",
    },
    {
      slug: "rat-food-distribution-sufficiency",
      sources: [
        {
          docId: ase2024Id,
          shift: "Slot 2 (2:00 PM)",
          date: new Date("2024-09-04"),
          evidenceType: "ON_CAMPUS_PAPER",
          section: "Advanced Coding",
          notes: "Accenture ASE 2024 On-Campus Drive",
        },
        {
          docId: mncArchiveId,
          shift: "National Slot 3",
          date: new Date("2023-03-11"),
          evidenceType: "HIREPRO_ARCHIVE",
          section: "Arrays & Logic",
          notes: "Standard HirePro assessment paper",
        },
      ],
      frequency: 3,
      importance: "MUST_DO",
    },
    {
      slug: "second-highest-salary-with-ties",
      sources: [
        {
          docId: sql50Id,
          shift: null,
          date: new Date("2024-01-10"),
          evidenceType: "PAPER_SCAN",
          section: "Subqueries & Aggregations",
          notes: "Core technical interview question",
        },
        {
          docId: movieDbId,
          shift: "Technical Slot 2",
          date: new Date("2024-07-20"),
          evidenceType: "MEMORY_DEBRIEF",
          section: "SQL Assessment",
          notes: "Adapted for streaming platform compensation",
        },
      ],
      frequency: 2,
      importance: "MUST_DO",
    },
    {
      slug: "interactive-textarea-counter-limit",
      sources: [
        {
          docId: oct2025Id,
          shift: "Slot 1 (Forenoon)",
          date: new Date("2025-10-11"),
          evidenceType: "ON_CAMPUS_PAPER",
          section: "Frontend Web Component Task",
          notes: "Reported in 11 October 2025 on-campus exam",
        },
        {
          docId: feBenchId,
          shift: null,
          date: new Date("2024-05-18"),
          evidenceType: "BENCHMARK_SPEC",
          section: "DOM Engineering Evaluation",
          notes: "Standard DOM live input task",
        },
      ],
      frequency: 2,
      importance: "HIGH",
    },
    {
      slug: "smallest-number-in-an-array",
      sources: [
        {
          docId: mncArchiveId,
          shift: "HirePro Shift A",
          date: new Date("2022-06-15"),
          evidenceType: "OFFICIAL_MEMO",
          section: "Arrays Section",
          notes: "HirePro 2022 Accenture official assessment question",
        },
        {
          docId: ase2024Id,
          shift: "National Screening Slot",
          date: new Date("2024-08-22"),
          evidenceType: "ON_CAMPUS_PAPER",
          section: "Warm-Up Coding",
          notes: "Warm-up task reported nationwide",
        },
      ],
      frequency: 4,
      importance: "MUST_DO",
    },
  ];

  for (const item of multiSourceLinks) {
    const q = await prisma.question.findUnique({ where: { slug: item.slug } });
    if (!q) continue;

    // Remove existing sources for clean update
    await prisma.questionSource.deleteMany({ where: { questionId: q.id } });

    // Insert multiple independent sources
    for (const s of item.sources) {
      if (!s.docId) continue;
      await prisma.questionSource.create({
        data: {
          questionId: q.id,
          sourceDocumentId: s.docId,
          shift: s.shift,
          date: s.date,
          evidenceType: s.evidenceType,
          section: s.section,
          notes: s.notes,
        },
      });
    }

    // Update question metadata
    await prisma.question.update({
      where: { id: q.id },
      data: {
        frequency: item.frequency,
        importance: item.importance,
      },
    });

    console.log(`✓ Linked ${item.sources.length} independent sources for: ${q.title}`);
  }

  console.log("=== Evidence Enrichment Complete ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
