import * as fs from "fs";

export interface ParsedQuestion {
  id: string;
  section: string;
  kind: "Source" | "Practice";
  sourceType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  stem: string;
  codeBlock: string | null;
  codeLanguage: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answerKey: "A" | "B" | "C" | "D";
  answerText: string;
  note: string | null;
  sourceCheck: string | null;
  explanation: string;
}

export function parseAccentureMcqBank(filePath: string): ParsedQuestion[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  let currentSection = "";
  let currentKind: "Source" | "Practice" = "Practice";

  const rawBlocks: Array<{
    id: string;
    section: string;
    kind: "Source" | "Practice";
    rawStem: string;
    lines: string[];
  }> = [];

  let currentBlock: (typeof rawBlocks)[0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      const heading = line.replace(/^##\s+/, "").trim();
      if (/^\d+\.\s+/.test(heading)) {
        currentSection = heading.replace(/^\d+\.\s+/, "").trim();
      }
    } else if (line.startsWith("### ")) {
      const sub = line.replace(/^###\s+/, "").trim().toLowerCase();
      if (sub.includes("source")) {
        currentKind = "Source";
      } else {
        currentKind = "Practice";
      }
    }

    const qMatch = line.match(/^\*\*([A-Z]{2,4}-[SP]\d{3,4})\.\*\*\s*(.*)/);
    if (qMatch) {
      if (currentBlock) rawBlocks.push(currentBlock);
      currentBlock = {
        id: qMatch[1],
        section: currentSection,
        kind: currentKind,
        rawStem: qMatch[2],
        lines: [line],
      };
    } else if (currentBlock) {
      if (line.startsWith("## ") && !line.startsWith("### ")) {
        rawBlocks.push(currentBlock);
        currentBlock = null;
      } else {
        currentBlock.lines.push(line);
      }
    }
  }
  if (currentBlock) rawBlocks.push(currentBlock);

  const parsedQuestions: ParsedQuestion[] = [];

  for (const block of rawBlocks) {
    let stemParts = [block.rawStem.trim()];
    let codeBlock: string | null = null;
    let codeLanguage: string | null = null;
    let inCode = false;
    let codeLines: string[] = [];
    const options: Record<string, string> = { A: "", B: "", C: "", D: "" };
    let answerKey: "A" | "B" | "C" | "D" = "A";
    let answerText = "";
    let note: string | null = null;
    let sourceCheck: string | null = null;

    let currentOptionKey: string | null = null;
    let optionLines: string[] = [];

    for (let idx = 1; idx < block.lines.length; idx++) {
      const l = block.lines[idx];
      const trimmed = l.trim();

      if (trimmed.startsWith("```")) {
        if (inCode) {
          codeBlock = codeLines.join("\n");
          inCode = false;
        } else {
          inCode = true;
          codeLines = [];
          codeLanguage = trimmed.replace(/^```/, "").trim() || null;
        }
        continue;
      }

      if (inCode) {
        codeLines.push(l);
        continue;
      }

      // Check option: - A) ... or - A. ...
      const optMatch = trimmed.match(/^-\s*([A-D])[\)\.]\s*(.*)/i);
      if (optMatch) {
        if (currentOptionKey) {
          options[currentOptionKey] = optionLines.join(" ").trim();
        }
        currentOptionKey = optMatch[1].toUpperCase();
        optionLines = [optMatch[2].trim()];
        continue;
      }

      // Check Answer: **Answer: A** — text
      const ansMatch = trimmed.match(/^\*\*Answer:\s*([A-D])\*\*(?:\s*[—–-]\s*(.*))?/i);
      if (ansMatch) {
        if (currentOptionKey) {
          options[currentOptionKey] = optionLines.join(" ").trim();
          currentOptionKey = null;
        }
        answerKey = ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
        answerText = ansMatch[2] ? ansMatch[2].trim() : "";
        continue;
      }

      // Check note: > ℹ️ ... or > ⚠️ **Source check:** ...
      if (trimmed.startsWith(">")) {
        if (trimmed.includes("Source check:")) {
          sourceCheck = trimmed.replace(/^>\s*⚠️?\s*\*\*Source check:\*\*\s*/i, "").trim();
        } else {
          note = trimmed.replace(/^>\s*ℹ️?\s*/i, "").trim();
        }
        continue;
      }

      // Stem lines vs option lines
      if (!currentOptionKey && !answerKey) {
        if (trimmed) stemParts.push(trimmed);
      } else if (currentOptionKey) {
        if (trimmed) optionLines.push(trimmed);
      }
    }

    if (currentOptionKey) {
      options[currentOptionKey] = optionLines.join(" ").trim();
    }

    // Special case for MSO-S059 (Yes/No)
    if (block.id === "MSO-S059") {
      options.C = "";
      options.D = "";
    }

    const cleanStem = stemParts.join("\n").trim();

    let difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM";
    if (block.section === "MS Office") {
      difficulty = "EASY";
    } else if (block.section === "Pseudocode" || block.section === "Java / OOP") {
      difficulty = "MEDIUM";
    }

    let explanation = `The correct answer is Option ${answerKey}: ${answerText || options[answerKey]}.`;
    if (note && sourceCheck) {
      explanation = `${note}\n\nNote: ${sourceCheck}`;
    } else if (note) {
      explanation = note;
    } else if (sourceCheck) {
      explanation = sourceCheck;
    }

    parsedQuestions.push({
      id: block.id,
      section: block.section,
      kind: block.kind,
      sourceType: block.kind === "Source" ? "REPORTED_PYQ" : "PRACTICE",
      difficulty,
      stem: cleanStem,
      codeBlock,
      codeLanguage,
      options: {
        A: options.A || "",
        B: options.B || "",
        C: options.C || "",
        D: options.D || "",
      },
      answerKey,
      answerText: answerText || options[answerKey] || "",
      note,
      sourceCheck,
      explanation,
    });
  }

  return parsedQuestions;
}
