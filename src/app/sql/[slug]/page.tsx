import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { extractSchemaMetadata } from "@/lib/sqlEngine";
import { toQuestionDetailDTO } from "@/lib/dto";
import { SqlWorkspace } from "./SqlWorkspace";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = await prisma.question.findUnique({
    where: { slug },
    select: { title: true, difficulty: true, sourceType: true },
  });

  if (!question) {
    return { title: "SQL Question Not Found | SQL Playground" };
  }

  return {
    title: `${question.title} | Real SQL Practice Environment`,
    description: `Practice SQL queries for ${question.title}. Inspect interactive database schema, view sample rows, and validate query results in a sandboxed engine.`,
  };
}

export default async function SqlDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      questionTopics: { include: { topic: true } },
      questionCompanies: { include: { company: true } },
      questionSources: { include: { sourceDocument: true } },
      examplesList: true,
      hintsList: true,
      solutionsList: true,
      bookmarks: true,
      progress: true,
    },
  });

  if (!question || question.questionType !== "SQL") {
    notFound();
  }

  const formattedQuestion = toQuestionDetailDTO(question);

  // Extract schemas, columns, and sample seed rows for the schema viewer
  const schemaMetadata = extractSchemaMetadata(
    question.sqlSchemaSql,
    question.sqlSeedData
  );

  return (
    <SqlWorkspace
      question={formattedQuestion}
      schemaMetadata={schemaMetadata}
    />
  );
}
