import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toQuestionDetailDTO } from "@/lib/dto";
import { ProblemWorkspace } from "./ProblemWorkspace";
import { FrontendWorkspace } from "./FrontendWorkspace";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = await prisma.question.findUnique({
    where: { slug },
    select: { title: true, difficulty: true, importance: true },
  });

  if (!question) {
    return { title: "Question Not Found | Prep Platform" };
  }

  return {
    title: `${question.title} (${question.difficulty}) | Problem Workspace`,
    description: `Solve ${question.title} - comprehensive problem statement, examples, testcases, and verified company provenance.`,
  };
}

export default async function QuestionDetailPage({
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
      examplesList: { orderBy: { orderIndex: "asc" } },
      testCasesList: { orderBy: { orderIndex: "asc" } },
      hintsList: { orderBy: { orderIndex: "asc" } },
      solutionsList: true,
      bookmarks: true,
      progress: true,
    },
  });

  if (!question) {
    notFound();
  }

  if (question.questionType === "SQL") {
    redirect(`/sql/${slug}`);
  }

  const formatted = toQuestionDetailDTO(question);

  if (question.questionType === "HTML_CSS_JS" || question.questionType === "FRONTEND") {
    return <FrontendWorkspace question={formatted} />;
  }

  return <ProblemWorkspace question={formatted} />;
}
