import fs from "fs";
import path from "path";

const sourcePath = path.join(process.cwd(), "Accenture_MCQ_Bank.md");
const content = fs.readFileSync(sourcePath, "utf-8");

console.log("Sample around first question (position 2560):");
console.log(content.substring(2550, 2750));

console.log("\n\nTesting option regex patterns:");
const optionPattern1 = /^-\s+([A-D])\)\s+(.+)$/;
const testOption1 = "- A) Mail Merge";
const match1 = testOption1.match(optionPattern1);
console.log(`Pattern 1 match: ${match1 ? match1[0] : "null"}`);

const optionPattern2 = /^-\s+([A-D])\)\s+(.+)$/;
const testOption2 = "- A) Mail Merge";
const match2 = testOption2.match(optionPattern2);
console.log(`Pattern 2 match: ${match2 ? match2[0] : "null"}`);
if (match2) {
  console.log(`Option: ${match2[1]}, Text: ${match2[2]}`);
}