import fs from "fs";
import path from "path";

// Simple direct comparison - no complex parsing
const sourcePath = path.join(process.cwd(), "Accenture_MCQ_Bank.md");
const jsonPath = path.join(process.cwd(), "src/data/canonical_mcq_bank.json");

const sourceContent = fs.readFileSync(sourcePath, "utf-8");
const jsonContent = fs.readFileSync(jsonPath, "utf-8");

const jsonQuestions = JSON.parse(jsonContent);

// Find the specific HTTPS question
const httpsQuestions = jsonQuestions.filter(q => 
  q.question.toLowerCase().includes("secure communication") || 
  q.question.toLowerCase().includes("https")
);

console.log(`Found ${httpsQuestions.length} HTTPS-related questions in JSON:`);
httpsQuestions.forEach((q, i) => {
  console.log(`\n${i + 1}. ${q.id}: ${q.question}`);
  console.log(`   Options: ${q.options.map(o => `${o.id}) ${o.text}`).join(", ")}`);
  console.log(`   Correct: ${q.correctOptionId}) ${q.correctAnswerText}`);
});

// Check if CYB-S001 exists in source
if (sourceContent.includes("CYB-S001")) {
  console.log("\n✓ CYB-S001 found in source file");
  const startIndex = sourceContent.indexOf("CYB-S001");
  console.log("Context:", sourceContent.substring(startIndex, startIndex + 200));
} else {
  console.log("\n✗ CYB-S001 NOT found in source file");
}