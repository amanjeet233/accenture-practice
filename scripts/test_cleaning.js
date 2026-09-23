const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateNumberConversionExplanation(stem, answerText) {
  // Check decimal to binary: "What is the binary equivalent of the decimal number (\d+)"
  let m = stem.match(/binary equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    const powers = [];
    let rem = num;
    for (let p = 10; p >= 0; p--) {
      const val = 1 << p;
      if (val <= rem) {
        powers.push(val);
        rem -= val;
      }
    }
    const powerStr = powers.join(' + ');
    return `Converting decimal ${num} to binary by decomposing into powers of two (${powerStr}) yields ${answerText}.`;
  }

  // Decimal to octal: "octal equivalent of the decimal number (\d+)"
  m = stem.match(/octal equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    return `Converting decimal ${num} to base-8 by successive division by 8 gives octal ${answerText}.`;
  }

  // Decimal to hex: "hexadecimal equivalent of the decimal number (\d+)"
  m = stem.match(/hexadecimal equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    return `Converting decimal ${num} to base-16 by successive division by 16 yields hex ${answerText}.`;
  }

  // Binary to decimal
  m = stem.match(/decimal equivalent of the binary number\s*([01]+)/i);
  if (m) {
    const bin = m[1];
    return `Evaluating binary ${bin} as sum of powers of 2 gives decimal ${answerText}.`;
  }

  return null;
}

function generatePseudocodeExplanation(codeBlock, answerText) {
  if (!codeBlock) return null;

  // for(i = A to B) sum = sum + i
  let m = codeBlock.match(/for\s*\(\s*i\s*=\s*(\d+)\s+to\s+(\d+)\s*\)\s*sum\s*=\s*sum\s*\+\s*i/i);
  if (m) {
    const start = parseInt(m[1], 10);
    const end = parseInt(m[2], 10);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return `The for loop accumulates integers from ${start} to ${end}: sum = ${nums.join(' + ')} = ${answerText}.`;
  }

  // while(n > 0) sum = sum + (n mod 10); n = n div 10
  m = codeBlock.match(/Integer\s+n\s*=\s*(\d+).*sum\s*=\s*sum\s*\+\s*\(n\s*mod\s*10\)/is);
  if (m) {
    const digits = m[1].split('').reverse();
    return `The while loop extracts and sums the decimal digits of ${m[1]}: ${digits.join(' + ')} = ${answerText}.`;
  }

  // while(x < target) x = x * factor; count = count + 1
  m = codeBlock.match(/Integer\s+x\s*=\s*(\d+).*count\s*=\s*0.*while\s*\(x\s*<\s*(\d+)\).*x\s*=\s*x\s*\*\s*(\d+).*count\s*=\s*count\s*\+\s*1/is);
  if (m) {
    const startX = parseInt(m[1], 10);
    const target = parseInt(m[2], 10);
    const factor = parseInt(m[3], 10);
    let cur = startX;
    let cnt = 0;
    const steps = [];
    while (cur < target && cnt < 20) {
      cur *= factor;
      cnt++;
      steps.push(`x=${cur} (count=${cnt})`);
    }
    return `Starting at x=${startX}, x multiplies by ${factor} each step: ${steps.slice(0, 3).join(', ')}. The loop exits when x >= ${target}, giving count = ${answerText}.`;
  }

  // while(x < target) x = x * factor; Print x
  m = codeBlock.match(/Integer\s+x\s*=\s*(\d+).*while\s*\(x\s*<\s*(\d+)\).*x\s*=\s*x\s*\*\s*(\d+).*Print\s*x/is);
  if (m) {
    const startX = parseInt(m[1], 10);
    const target = parseInt(m[2], 10);
    const factor = parseInt(m[3], 10);
    return `Starting at x=${startX}, x is repeatedly multiplied by ${factor} until it reaches or exceeds ${target}, terminating with x = ${answerText}.`;
  }

  return null;
}

function cleanMarkdownExplanation(raw) {
  if (!raw) return "";
  let text = raw.trim();

  // If text contains the bulky format, extract the technical explanation
  if (text.includes("Detailed Technical Explanation:") || text.includes("Detailed Architectural Explanation:")) {
    const match = text.match(/(?:Detailed (?:Technical|Architectural) Explanation:\s*)([\s\S]*?)(?:### Analysis|\n\n-|\n-|$)/i);
    if (match && match[1]) {
      text = match[1].trim();
    }
  }

  text = text
    .replace(/^###+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^Explanation:\s*/i, "")
    .replace(/^The correct answer is Option [A-D]:\s*/i, "")
    .replace(/^Correct: Option [A-D]\s*/i, "");

  if (text.includes("Analysis of")) {
    text = text.split(/Analysis of/i)[0].trim();
  }

  text = text.replace(/\s+/g, " ").trim();
  return text;
}

async function test() {
  const samples = await prisma.question.findMany({
    where: { questionType: 'MCQ' },
    select: { id: true, category: true, title: true, starterCode: true, explanation: true, solution: true },
    take: 10
  });

  for (const s of samples) {
    let p = null;
    if (s.starterCode) {
      try { p = JSON.parse(s.starterCode); } catch {}
    }
    const stem = p?.stem || s.title;
    const ansText = p?.correctAnswerText || s.solution;
    const codeBlock = p?.codeBlock;

    let res = generateNumberConversionExplanation(stem, ansText);
    if (!res) res = generatePseudocodeExplanation(codeBlock, ansText);
    if (!res) res = cleanMarkdownExplanation(s.explanation);

    console.log(`[${s.id}] (${s.category})`);
    console.log(`  Raw: ${s.explanation.substring(0, 60)}...`);
    console.log(`  Cleaned: ${res}\n`);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
