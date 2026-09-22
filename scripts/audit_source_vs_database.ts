import fs from "fs";
import path from "path";

// Parse the source file
interface SourceQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  correctOptionLetter: string;
}

interface JsonQuestion {
  id: string;
  section: string;
  topic: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  correctAnswerText: string;
}

function parseSourceFile(filePath: string): Map<string, SourceQuestion> {
  const content = fs.readFileSync(filePath, "utf-8");
  const questions = new Map<string, SourceQuestion>();
  
  let currentTopic = "";
  const lines = content.split("\n");
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check for topic header
    const topicMatch = line.match(/^## \d+\. (.+)/);
    if (topicMatch) {
      currentTopic = topicMatch[1];
      i++;
      continue;
    }
    
    // Check for question with ID pattern like **CYB-S001.** or **MSO-S001.**
    const questionMatch = line.match(/\*\*([A-Z]{3}-[SP]\d+)\.\*\*\s+(.+)/);
    if (questionMatch) {
      const id = questionMatch[1];
      const questionText = questionMatch[2];
      const options: string[] = ["", "", "", ""]; // A, B, C, D
      let correctAnswer = "";
      let correctOptionLetter = "";
      
      // Parse options (next 4 lines should be options)
      let j = i + 1;
      let optionCount = 0;
      while (j < lines.length && optionCount < 4 && j < i + 10) {
        const optionLine = lines[j];
        const optionMatch = optionLine.match(/^-\s+([A-D])\)\s+(.+)$/);
        if (optionMatch) {
          const optionIndex = optionMatch[1].charCodeAt(0) - 65; // A=0, B=1, etc.
          options[optionIndex] = optionMatch[2];
          optionCount++;
        }
        j++;
      }
      
      // Look for answer line (should be within next few lines after options)
      while (j < lines.length && j < i + 15) {
        const answerLine = lines[j];
        const answerMatch = answerLine.match(/\*\*Answer:\s+([A-D])\*\*\s+—\s+(.+)/);
        if (answerMatch) {
          correctOptionLetter = answerMatch[1];
          correctAnswer = answerMatch[2];
          break;
        }
        j++;
      }
      
      // Only add if we have all 4 options and an answer
      if (options.every(opt => opt.length > 0) && correctOptionLetter) {
        questions.set(id, {
          id,
          topic: currentTopic,
          question: questionText,
          options,
          correctAnswer,
          correctOptionLetter
        });
      }
      
      i = j + 1; // Continue after the answer
      continue;
    }
    
    i++;
  }
  
  return questions;
}

function loadJsonFile(filePath: string): JsonQuestion[] {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fuzzyMatch(text1: string, text2: string): boolean {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  // Check if one contains the other (with minimum length)
  if (normalized1.length > 20 && normalized2.length > 20) {
    if (normalized1.includes(normalized2.substring(0, 30)) || 
        normalized2.includes(normalized1.substring(0, 30))) {
      return true;
    }
  }
  
  // Check for high similarity
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  if (longer.includes(shorter.substring(0, Math.min(shorter.length, 40)))) {
    return true;
  }
  
  return false;
}

async function auditJsonVsSource() {
  console.log("🔍 Starting comprehensive audit of JSON file vs source file...");
  
  // Parse source file
  const sourcePath = path.join(process.cwd(), "Accenture_MCQ_Bank.md");
  const sourceQuestions = parseSourceFile(sourcePath);
  console.log(`📖 Source file contains ${sourceQuestions.size} verified questions`);
  
  // Load JSON file
  const jsonPath = path.join(process.cwd(), "src/data/canonical_mcq_bank.json");
  const jsonQuestions = loadJsonFile(jsonPath);
  console.log(`� JSON file contains ${jsonQuestions.length} questions`);
  
  const results = {
    matches: 0,
    mismatches: [] as any[],
    optionsChanged: [] as any[],
    notInSource: [] as any[],
    missingInJson: [] as any[],
    totalChecked: 0
  };
  
  // Check each JSON question against source
  for (const jsonQ of jsonQuestions) {
    results.totalChecked++;
    
    // Try to find matching source question by content
    let matchedSource: SourceQuestion | null = null;
    let matchedId = "";
    
    for (const [sourceId, sourceQ] of sourceQuestions) {
      if (fuzzyMatch(jsonQ.question, sourceQ.question)) {
        matchedSource = sourceQ;
        matchedId = sourceId;
        break;
      }
    }
    
    if (!matchedSource) {
      results.notInSource.push({
        jsonId: jsonQ.id,
        jsonQuestion: jsonQ.question,
        topic: jsonQ.topic
      });
      continue;
    }
    
    // Extract JSON options
    const jsonOptions = jsonQ.options.map(o => o.text);
    const jsonCorrectKey = jsonQ.correctOptionId;
    const jsonCorrectAnswer = jsonQ.correctAnswerText;
    
    // Compare correct answers
    if (jsonCorrectAnswer.toLowerCase() !== matchedSource.correctAnswer.toLowerCase()) {
      results.mismatches.push({
        sourceId: matchedId,
        jsonId: jsonQ.id,
        question: matchedSource.question,
        sourceAnswer: matchedSource.correctAnswer,
        sourceKey: matchedSource.correctOptionLetter,
        jsonAnswer: jsonCorrectAnswer,
        jsonKey: jsonCorrectKey,
        sourceOptions: matchedSource.options,
        jsonOptions: jsonOptions
      });
    } else if (JSON.stringify(jsonOptions) !== JSON.stringify(matchedSource.options)) {
      results.optionsChanged.push({
        sourceId: matchedId,
        jsonId: jsonQ.id,
        question: matchedSource.question,
        sourceOptions: matchedSource.options,
        jsonOptions: jsonOptions
      });
    } else {
      results.matches++;
    }
  }
  
  // Check for questions in source but not in JSON
  for (const [sourceId, sourceQ] of sourceQuestions) {
    let found = false;
    for (const jsonQ of jsonQuestions) {
      if (fuzzyMatch(jsonQ.question, sourceQ.question)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      results.missingInJson.push({
        sourceId,
        question: sourceQ.question,
        topic: sourceQ.topic
      });
    }
  }
  
  return results;
}

async function main() {
  try {
    const results = await auditJsonVsSource();
    
    console.log("\n📊 AUDIT RESULTS:");
    console.log("================");
    console.log(`✅ Matches: ${results.matches}`);
    console.log(`❌ Mismatches: ${results.mismatches.length}`);
    console.log(`⚠️  Options Changed: ${results.optionsChanged.length}`);
    console.log(`❓ Not in Source: ${results.notInSource.length}`);
    console.log(`🔍 Missing in JSON: ${results.missingInJson.length}`);
    console.log(`📋 Total Checked: ${results.totalChecked}`);
    
    if (results.mismatches.length > 0) {
      console.log("\n🚨 CORRUPTED QUESTIONS (Answer Mismatches):");
      console.log("===========================================");
      results.mismatches.forEach((m, i) => {
        console.log(`\n${i + 1}. ${m.sourceId} -> ${m.jsonId}: ${m.question.substring(0, 80)}...`);
        console.log(`   Source: ${m.sourceKey}) ${m.sourceAnswer}`);
        console.log(`   JSON: ${m.jsonKey}) ${m.jsonAnswer}`);
        console.log(`   JSON Options: ${m.jsonOptions.join(", ")}`);
        console.log(`   Source Options: ${m.sourceOptions.join(", ")}`);
      });
    }
    
    if (results.optionsChanged.length > 0) {
      console.log("\n⚠️  QUESTIONS WITH CHANGED OPTIONS:");
      console.log("====================================");
      results.optionsChanged.forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.sourceId} -> ${c.jsonId}: ${c.question.substring(0, 80)}...`);
        console.log(`   Source Options: ${c.sourceOptions.join(", ")}`);
        console.log(`   JSON Options: ${c.jsonOptions.join(", ")}`);
      });
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), "AUDIT_SOURCE_VS_JSON.json");
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error("❌ Audit failed:", error);
    throw error;
  }
}

main();