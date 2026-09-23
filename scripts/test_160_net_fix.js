const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function resolveNetQuestion(stem, answerText) {
  // 1. Subnet mask for /CIDR
  let m = stem.match(/subnet mask for a\s*\/(\d+)\s*network/i);
  if (m) {
    const cidr = parseInt(m[1], 10);
    return `A /${cidr} network mask sets the first ${cidr} bits to 1 and remaining ${32 - cidr} bits to 0, producing subnet mask ${answerText}.`;
  }

  // 2. Network address of host IP/CIDR
  m = stem.match(/network address of the host\s*(\d+\.\d+\.\d+\.\d+)\/(\d+)/i);
  if (m) {
    const ip = m[1];
    const cidr = parseInt(m[2], 10);
    const hostBits = 32 - cidr;
    const blockSize = Math.pow(2, hostBits <= 8 ? hostBits : hostBits % 8);
    return `In a /${cidr} subnet (block size ${blockSize}), the subnet boundary for host ${ip} gives network address ${answerText}.`;
  }

  // 3. Broadcast address of network containing IP/CIDR
  m = stem.match(/broadcast address of the network containing\s*(\d+\.\d+\.\d+\.\d+)\/(\d+)/i);
  if (m) {
    const ip = m[1];
    const cidr = parseInt(m[2], 10);
    const hostBits = 32 - cidr;
    const blockSize = Math.pow(2, hostBits <= 8 ? hostBits : hostBits % 8);
    return `In a /${cidr} subnet with block size ${blockSize}, the last address in the subnet span containing ${ip} is broadcast address ${answerText}.`;
  }

  // 4. IPv4 Class ranges
  m = stem.match(/Which class does the IPv4 address\s*(\d+)\./i);
  if (m) {
    const firstOctet = parseInt(m[1], 10);
    return `The first octet ${firstOctet} falls within the standard IPv4 range for ${answerText}.`;
  }

  // 5. First-octet range
  m = stem.match(/first-octet range for (Class [A-E])/i);
  if (m) {
    return `IPv4 ${m[1]} is standardized with first-octet range ${answerText}.`;
  }

  // 6. Address classification: How is the IPv4 address X classified?
  m = stem.match(/How is the IPv4 address\s*(\d+\.\d+\.\d+\.\d+)\s*classified/i);
  if (m) {
    const ip = m[1];
    if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.16.") || ip.startsWith("172.20.")) {
      return `${ip} falls within RFC 1918 private address space, designating it as a ${answerText}.`;
    }
    if (ip.startsWith("127.")) {
      return `${ip} belongs to the 127.0.0.0/8 loopback block used for local host testing.`;
    }
    if (ip.startsWith("169.254.")) {
      return `${ip} belongs to the Automatic Private IP Addressing (APIPA) link-local range.`;
    }
    return `${ip} is classified as ${answerText}.`;
  }

  // 7. Length of addresses
  if (stem.includes("length of an IPv6 address")) {
    return `An IPv6 address is 128 bits (16 bytes) in length, written as 8 hexadecimal blocks separated by colons.`;
  }
  if (stem.includes("length of an IPv4 address")) {
    return `An IPv4 address is 32 bits (4 bytes) in length, typically expressed in dotted-decimal notation.`;
  }
  if (stem.includes("length of a MAC address")) {
    return `A MAC address is 48 bits (6 bytes) long, permanently identifying a network interface at the Data Link layer.`;
  }

  // 8. Acronyms
  if (stem.includes("What does OSI stand for")) {
    return `OSI stands for Open Systems Interconnection, the standard ISO reference model for network communications.`;
  }
  if (stem.includes("What does VLAN stand for")) {
    return `VLAN stands for Virtual Local Area Network, enabling logical segmentation of physical networks.`;
  }
  if (stem.includes("What does SSID stand for")) {
    return `SSID stands for Service Set Identifier, the human-readable network name of a wireless local area network (WLAN).`;
  }
  if (stem.includes("What does CSMA/CD stand for")) {
    return `CSMA/CD stands for Carrier Sense Multiple Access with Collision Detection, the legacy collision control protocol for Ethernet.`;
  }

  // 9. HTTP Status codes
  if (stem.includes("HTTP status code 200")) {
    return `HTTP status code 200 OK indicates that the client request has succeeded and the server has returned the expected resource.`;
  }
  if (stem.includes("HTTP status code 404")) {
    return `HTTP status code 404 Not Found indicates that the origin server cannot find the requested resource at the target URL.`;
  }
  if (stem.includes("HTTP status code 500")) {
    return `HTTP status code 500 Internal Server Error indicates an unexpected condition on the server prevented it from fulfilling the request.`;
  }
  if (stem.includes("HTTP status code 403")) {
    return `HTTP status code 403 Forbidden indicates that the server understands the request but refuses authorization.`;
  }

  // 10. Protocols & Commands
  if (stem.includes("purpose of NAT")) {
    return `Network Address Translation (NAT) modifies IP header addresses to map private IP addresses into a public IP for Internet routing.`;
  }
  if (stem.includes("purpose of the ARP")) {
    return `Address Resolution Protocol (ARP) translates a known IPv4 network address into its corresponding physical MAC hardware address.`;
  }
  if (stem.includes("ping command do")) {
    return `The ping command sends ICMP Echo Request packets to test network reachability and round-trip latency to a remote host.`;
  }
  if (stem.includes("steps of the TCP three-way handshake")) {
    return `The TCP three-way handshake establishes a reliable connection by exchanging SYN, SYN-ACK, and ACK control packets.`;
  }
  if (stem.includes("protocol is connectionless")) {
    return `UDP (User Datagram Protocol) is connectionless, sending datagrams without pre-establishing a connection or guaranteeing packet order.`;
  }
  if (stem.includes("protocol is connection-oriented")) {
    return `TCP (Transmission Control Protocol) is connection-oriented, providing reliable, ordered byte streams via handshakes and acknowledgments.`;
  }

  // 11. DNS Record types
  if (stem.includes("DNS record type 'A'") || stem.includes("record maps a domain name to an IPv4")) {
    return `A DNS 'A' record maps a human-readable hostname or domain name directly to its 32-bit IPv4 address.`;
  }
  if (stem.includes("record maps a domain name to an IPv6") || stem.includes("DNS record type 'AAAA'")) {
    return `A DNS 'AAAA' (quad-A) record maps a domain name directly to its 128-bit IPv6 address.`;
  }
  if (stem.includes("DNS record creates an alias")) {
    return `A CNAME (Canonical Name) record aliases one domain name to another canonical domain name.`;
  }
  if (stem.includes("DNS record specifies the mail server")) {
    return `An MX (Mail Exchanger) record directs incoming email messages to the designated mail servers for a domain.`;
  }

  // 12. Topologies
  if (stem.includes("topology") && stem.includes("hub")) {
    return `In a star topology, each individual network node connects to a central hub, switch, or concentrator.`;
  }

  // Clean fallback: factual 1-line answer statement
  const cleanStem = stem.replace(/\?$/, '').replace(/^[\[\(].*?[\]\)]\s*/, '').trim();
  return `${answerText} is the correct technical answer for "${cleanStem}".`;
}

async function main() {
  const qs = await prisma.question.findMany({
    where: {
      category: 'Networking',
      questionType: 'MCQ',
      explanation: { contains: 'Option Review' }
    },
    select: { id: true, title: true, starterCode: true, solution: true }
  });

  console.log(`Testing all ${qs.length} questions that had Option Review:\n`);
  for (let i = 0; i < Math.min(15, qs.length); i++) {
    const q = qs[i];
    let p = null;
    try { p = JSON.parse(q.starterCode); } catch {}
    const stem = p?.stem || q.title;
    const ansText = p?.correctAnswerText || q.solution;
    const exp = resolveNetQuestion(stem, ansText);
    console.log(`[${q.id}] ${stem}`);
    console.log(`  Ans: ${ansText}`);
    console.log(`  New Exp: ${exp}\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
