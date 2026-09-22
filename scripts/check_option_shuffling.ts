import fs from "fs";
import path from "path";

// Check for any option shuffling logic in the codebase
const srcPath = path.join(process.cwd(), "src");

function searchForShuffling(dir: string): string[] {
  const results: string[] = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...searchForShuffling(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check for suspicious patterns
      const patterns = [
        /shuffle|random.*option|option.*random/i,
        /Math\.random\(\).*option/,
        /Object\.entries.*options/,
        /options.*sort.*random/,
        /options.*reverse/i,
        / Fisher-Yates/i
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          results.push(`${fullPath}: ${pattern}`);
          break;
        }
      }
    }
  }
  
  return results;
}

console.log("🔍 Searching for option shuffling logic...");
const shufflingFiles = searchForShuffling(srcPath);

if (shufflingFiles.length > 0) {
  console.log("⚠️  Found potential shuffling logic:");
  shufflingFiles.forEach(file => console.log(`  - ${file}`));
} else {
  console.log("✅ No option shuffling logic found");
}

// Check the specific HTTPS question logic
console.log("\n🔍 Checking mcqService.ts for HTTPS handling...");
const mcqServicePath = path.join(process.cwd(), "src/lib/mcqService.ts");
const mcqServiceContent = fs.readFileSync(mcqServicePath, "utf-8");

if (mcqServiceContent.includes("https")) {
  console.log("✓ Found HTTPS handling logic");
  const httpsMatch = mcqServiceContent.match(/s\.includes\("https"\)[^}]+}/);
  if (httpsMatch) {
    console.log(`  Logic: ${httpsMatch[0]}`);
  }
} else {
  console.log("✗ No HTTPS-specific handling found");
}