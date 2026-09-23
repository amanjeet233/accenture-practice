const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to clean and format text
function formatSentence(text) {
  if (!text) return "";
  let s = text.trim();
  s = s.replace(/^###+\s*/gm, "");
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/^[-*•]\s+/gm, "");
  s = s.replace(/^(?:Explanation(?:\s*&\s*Key Concept)?:\s*)+/i, "");
  s = s.replace(/^The correct answer is Option [A-D]:\s*/i, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s && !/[.!?]$/.test(s)) s += ".";
  return s;
}

// 1. Number conversions (Computer Fundamentals)
function getNumberConversionExplanation(stem, answerText) {
  // Decimal to binary
  let m = stem.match(/binary equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    const powers = [];
    let rem = num;
    for (let p = 12; p >= 0; p--) {
      const val = 1 << p;
      if (val <= rem) {
        powers.push(val);
        rem -= val;
      }
    }
    const powerStr = powers.join(' + ');
    return `Converting decimal ${num} to binary by decomposing into powers of two (${powerStr}) yields ${answerText}.`;
  }

  // Binary to decimal
  m = stem.match(/decimal (?:value|equivalent) of the binary number\s*([01]+)/i);
  if (m) {
    const bin = m[1];
    const powers = [];
    const len = bin.length;
    for (let i = 0; i < len; i++) {
      if (bin[i] === '1') {
        powers.push(1 << (len - 1 - i));
      }
    }
    const powerStr = powers.join(' + ');
    return `Evaluating binary ${bin} by summing active powers of two (${powerStr}) yields decimal ${answerText}.`;
  }

  // Decimal to octal
  m = stem.match(/octal equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    return `Converting decimal ${num} to base-8 by successive division by 8 gives octal ${answerText}.`;
  }

  // Decimal to hex
  m = stem.match(/hexadecimal equivalent of the decimal number\s*(\d+)/i);
  if (m) {
    const num = parseInt(m[1], 10);
    const q = Math.floor(num / 16);
    const r = num % 16;
    const hexMap = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    return `Dividing decimal ${num} by 16 gives quotient ${q} (${hexMap[q] || q}) and remainder ${r} (${hexMap[r] || r}), yielding hexadecimal ${answerText}.`;
  }

  // Hexadecimal to decimal
  m = stem.match(/decimal (?:value|equivalent) of the hexadecimal number\s*([0-9a-f]+)/i);
  if (m) {
    const hex = m[1].toUpperCase();
    return `Converting hexadecimal ${hex} to decimal by evaluating base-16 positional values yields ${answerText}.`;
  }

  return null;
}

// 2. Pseudocode
function getPseudocodeExplanation(codeBlock, answerText) {
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
    return `Starting at x=${startX}, x multiplies by ${factor} each cycle until x >= ${target}, completing ${answerText} iterations.`;
  }

  // while(x < target) x = x * factor; Print x
  m = codeBlock.match(/Integer\s+x\s*=\s*(\d+).*while\s*\(x\s*<\s*(\d+)\).*x\s*=\s*x\s*\*\s*(\d+).*Print\s*x/is);
  if (m) {
    const startX = parseInt(m[1], 10);
    const target = parseInt(m[2], 10);
    const factor = parseInt(m[3], 10);
    return `Starting at x=${startX}, x is repeatedly multiplied by ${factor} until it reaches or exceeds ${target}, terminating with x = ${answerText}.`;
  }

  // Bitwise XOR or AND
  m = codeBlock.match(/(\d+)\s*\^\s*(\d+)/);
  if (m) {
    return `Bitwise XOR (^) between ${m[1]} and ${m[2]} compares binary bits, evaluating to ${answerText}.`;
  }

  return null;
}

// 3. Bulky Markdown Extractor (Cloud & Networking)
function getBulkyMarkdownExplanation(raw) {
  if (!raw) return null;
  if (
    raw.includes("### Correct Answer:") ||
    raw.includes("Detailed Technical Explanation:") ||
    raw.includes("Detailed Architectural Explanation:")
  ) {
    const match = raw.match(
      /(?:Detailed (?:Technical|Architectural) Explanation:\s*)([\s\S]*?)(?:### Analysis|\n\n-|\n-|$)/i
    );
    if (match && match[1]) {
      return formatSentence(match[1]);
    }
  }
  return null;
}

// 4. Pair-based patterns (MS Office, DevOps, Cybersecurity)
function getPairPatternExplanation(category, stem, answerText) {
  // MS Office Shortcuts: In MS Word/Excel/PowerPoint, which shortcut is used to: <action>?
  let m = stem.match(/In\s+(MS\s+\w+),\s+which\s+shortcut\s+is\s+used\s+to:\s*(.*?)\??$/i);
  if (m) {
    const app = m[1];
    const action = m[2].trim().replace(/\.$/, '');
    return `${answerText} is the standard shortcut in ${app} used to ${action.toLowerCase()}.`;
  }

  // In MS Word/Excel/PowerPoint, what does the shortcut <X> do?
  m = stem.match(/In\s+(MS\s+\w+),\s+what\s+does\s+the\s+shortcut\s+([A-Za-z0-9\+\s]+)\s+do\??$/i);
  if (m) {
    const app = m[1];
    const sc = m[2].trim();
    return `In ${app}, pressing ${sc} executes the command to ${answerText.toLowerCase().replace(/\.$/, '')}.`;
  }

  // DevOps Git commands: Which Git command is used to: <action>?
  m = stem.match(/Which\s+Git\s+command\s+is\s+used\s+to:\s*(.*?)\??$/i);
  if (m) {
    const action = m[1].trim().replace(/\.$/, '');
    return `The \`${answerText}\` command in Git is used to ${action.toLowerCase()}.`;
  }

  // What does the Git command `<X>` do?
  m = stem.match(/What\s+does\s+the\s+Git\s+command\s+`?([A-Za-z0-9\-\s_]+)`?\s+do\??$/i);
  if (m) {
    const cmd = m[1].trim();
    return `Running \`${cmd}\` in Git performs the operation to ${answerText.toLowerCase().replace(/\.$/, '')}.`;
  }

  // Cybersecurity: Which attack or threat is described as <action>?
  m = stem.match(/Which\s+attack\s+or\s+threat\s+is\s+described\s+as\s+(.*?)\??$/i);
  if (m) {
    const desc = m[1].trim().replace(/\.$/, '');
    return `${answerText} is a cybersecurity threat characterized by ${desc.toLowerCase()}.`;
  }

  // Which of the following best describes <Threat>?
  m = stem.match(/Which\s+of\s+the\s+following\s+best\s+describes\s+(.*?)\??$/i);
  if (m) {
    const concept = m[1].trim();
    return `${concept} is defined as ${answerText.toLowerCase().replace(/\.$/, '')}.`;
  }

  // DBMS FDs: Consider the relation R... with FDs: ... What is the attribute closure ...
  if (stem.includes("attribute closure") || stem.includes("FDs:")) {
    return `Computing the attribute closure involves iteratively adding the right-hand attributes of functional dependencies whose determinants are in the current set, yielding ${answerText}.`;
  }

  return null;
}

// 5. Existing explanation sanitizer for high-quality items
function getCleanExistingExplanation(raw, answerText) {
  if (!raw) return null;
  const cleaned = formatSentence(raw);
  // If it's just "The correct answer is Option X: <ans>" or just the answer text, it needs meaningful reasoning
  if (
    cleaned.startsWith("The correct answer is") ||
    cleaned === answerText ||
    cleaned === `${answerText}.` ||
    cleaned.length < 15
  ) {
    return null;
  }
  return cleaned;
}

// Master resolver for a single question
function resolveExplanation(q) {
  let p = null;
  if (q.starterCode) {
    try { p = JSON.parse(q.starterCode); } catch {}
  }
  const stem = p?.stem || q.title;
  const answerText = p?.correctAnswerText || q.solution;
  const codeBlock = p?.codeBlock;
  const rawExp = q.explanation;

  // 1. Check if bulky markdown (Networking, Cloud)
  const bulky = getBulkyMarkdownExplanation(rawExp);
  if (bulky) return { text: bulky, type: 'BULKY_EXTRACTED' };

  // 2. Check number conversion (Computer Fundamentals)
  const conv = getNumberConversionExplanation(stem, answerText);
  if (conv) return { text: conv, type: 'COMPUTED_CONVERSION' };

  // 3. Check pseudocode execution
  const pseudo = getPseudocodeExplanation(codeBlock, answerText);
  if (pseudo) return { text: pseudo, type: 'COMPUTED_PSEUDOCODE' };

  // 4. Check paired questions (MS Office, DevOps, Cybersecurity, DBMS FDs)
  const pair = getPairPatternExplanation(q.category, stem, answerText);
  if (pair) return { text: pair, type: 'PAIR_PATTERN' };

  // 5. Check if existing explanation is already good & answer-focused
  const existing = getCleanExistingExplanation(rawExp, answerText);
  if (existing) return { text: existing, type: 'ALREADY_GOOD' };

  // 6. Contextual fallback based on stem and answer
  return {
    text: `${answerText} directly fulfills the required technical specification and operational criteria described in the question.`,
    type: 'SYNTHESIZED_FALLBACK'
  };
}

module.exports = {
  resolveExplanation,
  formatSentence
};
