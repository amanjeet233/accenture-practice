const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: { category: 'Networking', questionType: 'MCQ' },
    select: { id: true, title: true, explanation: true, starterCode: true, solution: true }
  });

  const patterns = {};
  for (const q of qs) {
    let p = null;
    try { p = JSON.parse(q.starterCode); } catch {}
    const stem = p?.stem || q.title;

    if (stem.includes("port number")) patterns["port_number"] = (patterns["port_number"] || 0) + 1;
    else if (stem.includes("protocol uses default port")) patterns["protocol_port"] = (patterns["protocol_port"] || 0) + 1;
    else if (stem.includes("network address")) patterns["network_address"] = (patterns["network_address"] || 0) + 1;
    else if (stem.includes("broadcast address")) patterns["broadcast_address"] = (patterns["broadcast_address"] || 0) + 1;
    else if (stem.includes("usable host")) patterns["usable_host"] = (patterns["usable_host"] || 0) + 1;
    else if (stem.includes("layer") || stem.includes("Layer") || stem.includes("OSI")) patterns["osi_layer"] = (patterns["osi_layer"] || 0) + 1;
    else if (stem.includes("topology") || stem.includes("Topology")) patterns["topology"] = (patterns["topology"] || 0) + 1;
    else patterns["other"] = (patterns["other"] || 0) + 1;
  }

  console.log('Networking pattern counts:', patterns);
}

main().catch(console.error).finally(() => prisma.$disconnect());
