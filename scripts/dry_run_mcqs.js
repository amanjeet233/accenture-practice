const { PrismaClient } = require('@prisma/client');
const { resolveQuestionExplanation } = require('./enhanced_mcq_resolver');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'MS Office',
    'Cloud Computing',
    'Networking',
    'Pseudocode',
    'Computer Fundamentals',
    'DevOps',
    'DBMS',
    'Java / OOP',
    'Cybersecurity',
    'SQL'
  ];

  console.log('Testing resolution across all 10 topics...\n');

  let grandTotal = 0;
  let grandRewritten = 0;
  let grandAlreadyGood = 0;
  let grandFlagged = 0;

  const topicReports = [];
  const samplesByTopic = {};

  for (const cat of categories) {
    const qs = await prisma.question.findMany({
      where: { questionType: 'MCQ', category: cat },
      select: { id: true, category: true, title: true, starterCode: true, explanation: true, solution: true }
    });

    let catRewritten = 0;
    let catAlreadyGood = 0;
    let catFlagged = 0;
    samplesByTopic[cat] = [];

    for (const q of qs) {
      const res = resolveQuestionExplanation(q);

      // Check for forbidden markdown artifacts (e.g. raw markdown headers, bold syntax, or filler)
      const hasMarkdownHeader = /^###+\s+/m.test(res.text);
      const hasBold = /\*\*.*?\*\*/.test(res.text);
      const hasFiller = res.text.includes('duty') && res.text.includes('Option');
      if (hasMarkdownHeader || hasBold || hasFiller) {
        catFlagged++;
        continue;
      }

      if (res.type === 'ALREADY_GOOD') {
        catAlreadyGood++;
      } else {
        catRewritten++;
      }

      if (samplesByTopic[cat].length < 5) {
        samplesByTopic[cat].push({
          id: q.id,
          title: q.title,
          solution: q.solution,
          type: res.type,
          explanation: res.text
        });
      }
    }

    grandTotal += qs.length;
    grandRewritten += catRewritten;
    grandAlreadyGood += catAlreadyGood;
    grandFlagged += catFlagged;

    topicReports.push({
      topic: cat,
      total: qs.length,
      rewritten: catRewritten,
      alreadyGood: catAlreadyGood,
      flagged: catFlagged,
      sumMatch: (catRewritten + catAlreadyGood + catFlagged === qs.length)
    });
  }

  console.table(topicReports);

  console.log(`\nGrand Total: Total=${grandTotal}, Rewritten=${grandRewritten}, AlreadyGood=${grandAlreadyGood}, Flagged=${grandFlagged}`);
  console.log(`Sum Reconciliation: ${grandRewritten + grandAlreadyGood + grandFlagged} === ${grandTotal}? ${grandRewritten + grandAlreadyGood + grandFlagged === grandTotal}`);

  console.log('\n5 Samples Per Topic:');
  for (const [cat, samples] of Object.entries(samplesByTopic)) {
    console.log(`\n=== ${cat} ===`);
    samples.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.id}] (${s.type}): ${s.explanation}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
