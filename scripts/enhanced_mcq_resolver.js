const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to format clean sentences
function formatSentence(text) {
  if (!text) return "";
  let s = text.trim();
  s = s.replace(/^###+\s*/gm, "");
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/^[-*•]\s+/gm, "");
  s = s.replace(/^(?:Explanation(?:\s*&\s*Key Concept)?:\s*)+/i, "");
  s = s.replace(/^The correct answer is Option [A-D]:\s*/i, "");
  s = s.replace(/^Correct Answer: Option [A-D](?:\s*\(.*?\))?\s*/i, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s && !/[.!?]$/.test(s)) s += ".";
  return s;
}

// 1. Number conversions & Tree math (Computer Fundamentals)
function getNumberConversionExplanation(stem, answerText) {
  // Full binary tree leaf calculation
  let treeMatch = stem.match(/full binary tree has\s*(\d+)\s*internal nodes.*?How many leaf nodes/i);
  if (treeMatch) {
    const internal = parseInt(treeMatch[1], 10);
    return `In any full binary tree where every internal node has two children, the number of leaf nodes equals internal nodes plus one (L = I + 1): ${internal} + 1 = ${answerText}.`;
  }

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

// 2. Hardware / Concepts in Computer Fundamentals
function getComputerFundamentalsExplanation(stem, answerText) {
  if (stem.includes("CPU stand for")) {
    return `CPU stands for Central Processing Unit, the primary hardware component that interprets and executes machine instructions.`;
  }
  if (stem.includes("ALU stand for") || stem.includes("ALU does") || stem.includes("component of the CPU performs arithmetic and logical")) {
    return `The ALU (Arithmetic Logic Unit) executes all basic arithmetic calculations and logical comparisons within the processor.`;
  }
  if (stem.includes("RAM stand for") || stem.includes("RAM is")) {
    return `RAM (Random Access Memory) provides high-speed, volatile main memory used by the OS and active programs.`;
  }
  if (stem.includes("ROM stand for") || stem.includes("ROM is")) {
    return `ROM (Read-Only Memory) is non-volatile memory storing permanent firmware and system bootstrap instructions (BIOS).`;
  }
  if (stem.includes("BIOS")) {
    return `BIOS (Basic Input/Output System) initializes and tests system hardware during startup before loading the operating system.`;
  }
  if (stem.includes("cache memory") || stem.includes("Cache")) {
    return `Cache memory is a small, ultra-fast memory buffer positioned close to the CPU core to reduce main memory access latency.`;
  }
  return null;
}

// 3. Pseudocode
function getPseudocodeExplanation(codeBlock, answerText) {
  if (!codeBlock) return null;

  // for (i = 1; i <= n; i++) result = result * i if (result > 10) break
  if (codeBlock.includes("result * i") && codeBlock.includes("break")) {
    return `Tracing the loop: i=1 gives result=1; i=2 gives result=2; i=3 gives result=6; i=4 gives result=24. Since 24 > 10, the break statement terminates the loop, outputting ${answerText}.`;
  }

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

  // Fibo recursion
  if (codeBlock.includes("Function Fibo") || codeBlock.includes("Fibo(n-1) + Fibo(n-2)")) {
    return `Fibo(5) recursively computes Fibonacci numbers: F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, and F(5) = F(4) + F(3) = 3 + 2 = ${answerText}.`;
  }

  // Array divisibility by 4
  if (codeBlock.includes("arr[i] % 4 == 0")) {
    return `The loop tests each element for divisibility by 4: 4 % 4 == 0 and 8 % 4 == 0. Summing these matching elements yields 4 + 8 = ${answerText}.`;
  }

  // String char count (e.g. 'g' in "Programming")
  if (codeBlock.includes("str[i] == 'g'") && codeBlock.includes("Programming")) {
    return `The loop scans "Programming" for character 'g', which appears at index 3 and index 10, resulting in count = ${answerText}.`;
  }

  // Bitwise XOR or AND
  m = codeBlock.match(/(\d+)\s*\^\s*(\d+)/);
  if (m) {
    return `Bitwise XOR (^) between ${m[1]} and ${m[2]} compares binary bits, evaluating to ${answerText}.`;
  }

  return null;
}

// 4. SQL Queries
function getSqlExplanation(stem, codeBlock, answerText) {
  const code = (codeBlock || stem || "").trim();

  if (code.includes("COUNT(*) FROM employees")) {
    return `COUNT(*) returns the total number of records in the employees table, which is ${answerText}.`;
  }
  if (code.includes("COUNT(dept_id) FROM employees")) {
    return `COUNT(dept_id) counts all non-null values in dept_id; 9 of the 10 employee records contain an assigned department, resulting in ${answerText}.`;
  }
  if (code.includes("COUNT(manager_id) FROM employees")) {
    return `COUNT(manager_id) excludes NULLs, counting the 9 employees who have an assigned direct manager, yielding ${answerText}.`;
  }
  if (code.includes("COUNT(DISTINCT dept_id) FROM employees")) {
    return `COUNT(DISTINCT dept_id) evaluates unique non-null departments present across all employees, giving ${answerText} distinct departments.`;
  }
  if (code.includes("COUNT(DISTINCT city) FROM employees")) {
    return `COUNT(DISTINCT city) counts the unique cities where employees are located, resulting in ${answerText} distinct cities.`;
  }
  if (code.includes("COUNT(DISTINCT salary) FROM employees")) {
    return `COUNT(DISTINCT salary) filters out duplicate compensation amounts across employees, identifying ${answerText} unique salaries.`;
  }
  if (code.includes("MAX(salary) FROM employees")) {
    return `MAX(salary) returns the highest compensation figure among all employees in the table, which is ${answerText}.`;
  }
  if (code.includes("MIN(salary) FROM employees")) {
    return `MIN(salary) returns the lowest compensation figure recorded in the employees table, which is ${answerText}.`;
  }
  if (code.includes("SUM(salary) FROM employees")) {
    return `SUM(salary) computes the cumulative total compensation across all employees, resulting in ${answerText}.`;
  }
  if (code.includes("AVG(salary) FROM employees")) {
    return `AVG(salary) calculates the arithmetic mean salary across all 10 employees (475000 / 10), resulting in ${answerText}.`;
  }

  // General SQL concepts
  if (stem.includes("HAVING") || code.includes("HAVING")) {
    return `The HAVING clause filters aggregated groups after the GROUP BY operation, unlike WHERE which filters individual rows before grouping.`;
  }
  if (stem.includes("WHERE") && stem.includes("GROUP BY")) {
    return `The WHERE clause filters individual rows prior to grouping, whereas HAVING filters groups after aggregation.`;
  }
  if (stem.includes("INNER JOIN")) {
    return `INNER JOIN returns only the records that have matching values in both joined tables based on the join condition.`;
  }
  if (stem.includes("LEFT JOIN")) {
    return `LEFT JOIN returns all rows from the left table and matched rows from the right table, populating NULL for non-matching right rows.`;
  }
  if (stem.includes("UNION ALL")) {
    return `UNION ALL concatenates result sets from multiple queries without removing duplicate rows, preserving all records.`;
  }
  if (stem.includes("UNION") && !stem.includes("UNION ALL")) {
    return `UNION combines the result sets of two queries and automatically removes duplicate rows from the final result.`;
  }

  return null;
}

// 5. Networking Specialized Subnetting & Protocol Handler
function getNetworkingExplanation(stem, answerText) {
  // Subnet mask for /CIDR
  let m = stem.match(/subnet mask for a\s*\/(\d+)\s*network/i);
  if (m) {
    const cidr = parseInt(m[1], 10);
    return `A /${cidr} network mask sets the first ${cidr} bits to 1 and remaining ${32 - cidr} bits to 0, producing subnet mask ${answerText}.`;
  }

  // CIDR prefix length equivalent to subnet mask
  m = stem.match(/CIDR prefix length equivalent to the subnet mask\s*(\d+\.\d+\.\d+\.\d+)/i);
  if (m) {
    return `${answerText} represents the exact prefix length corresponding to subnet mask ${m[1]}.`;
  }

  // Network address of host IP/CIDR
  m = stem.match(/network address of the host\s*(\d+\.\d+\.\d+\.\d+)\/(\d+)/i);
  if (m) {
    const ip = m[1];
    const cidr = parseInt(m[2], 10);
    const hostBits = 32 - cidr;
    const blockSize = Math.pow(2, hostBits <= 8 ? hostBits : hostBits % 8);
    return `In a /${cidr} subnet (block size ${blockSize}), the subnet boundary for host ${ip} gives network address ${answerText}.`;
  }

  // Broadcast address of network containing IP/CIDR
  m = stem.match(/broadcast address of the network containing\s*(\d+\.\d+\.\d+\.\d+)\/(\d+)/i);
  if (m) {
    const ip = m[1];
    const cidr = parseInt(m[2], 10);
    const hostBits = 32 - cidr;
    const blockSize = Math.pow(2, hostBits <= 8 ? hostBits : hostBits % 8);
    return `In a /${cidr} subnet with block size ${blockSize}, the last address in the subnet span containing ${ip} is broadcast address ${answerText}.`;
  }

  // Usable host count
  m = stem.match(/usable hosts.*?\/(\d+)/i);
  if (m) {
    const cidr = parseInt(m[1], 10);
    const h = 32 - cidr;
    const total = Math.pow(2, h);
    return `A /${cidr} subnet has ${h} host bits, providing 2^${h} - 2 = ${total} - 2 = ${answerText} usable host addresses.`;
  }

  // IPv4 Class ranges
  m = stem.match(/Which class does the IPv4 address\s*(\d+)\./i);
  if (m) {
    const firstOctet = parseInt(m[1], 10);
    return `The first octet ${firstOctet} falls within the standard IPv4 range for ${answerText}.`;
  }

  // First-octet range
  m = stem.match(/first-octet range for (Class [A-E])/i);
  if (m) {
    return `IPv4 ${m[1]} is standardized with first-octet range ${answerText}.`;
  }

  // Address classification
  m = stem.match(/How is the IPv4 address\s*(\d+\.\d+\.\d+\.\d+)\s*classified/i);
  if (m) {
    const ip = m[1];
    if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.16.") || ip.startsWith("172.20.")) {
      return `${ip} falls within RFC 1918 private address space, designating it as a ${answerText} address.`;
    }
    if (ip.startsWith("127.")) {
      return `${ip} belongs to the 127.0.0.0/8 loopback block used for local host testing.`;
    }
    if (ip.startsWith("169.254.")) {
      return `${ip} belongs to the Automatic Private IP Addressing (APIPA) link-local range.`;
    }
    return `${ip} is classified as ${answerText}.`;
  }

  // Length of addresses
  if (stem.includes("length of an IPv6 address")) {
    return `An IPv6 address is 128 bits (16 bytes) in length, written as 8 hexadecimal blocks separated by colons.`;
  }
  if (stem.includes("length of an IPv4 address")) {
    return `An IPv4 address is 32 bits (4 bytes) in length, typically expressed in dotted-decimal notation.`;
  }
  if (stem.includes("length of a MAC address")) {
    return `A MAC address is 48 bits (6 bytes) long, permanently identifying a network interface at the Data Link layer.`;
  }

  // Acronyms
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

  // HTTP Status codes
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

  // Protocols & Commands
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

  // DNS Record types
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

  // Topologies
  if (stem.includes("topology") && stem.includes("hub")) {
    return `In a star topology, each individual network node connects to a central hub, switch, or concentrator.`;
  }

  // OSI layer operate
  m = stem.match(/At which OSI layer does the following operate or belong:\s*(.*?)\??$/i);
  if (m) {
    return `${m[1]} operates at the ${answerText} layer of the OSI model.`;
  }

  return null;
}

// 6. Bulky Markdown Extractor (Cloud & Networking)
function getBulkyMarkdownExplanation(raw) {
  if (!raw) return null;

  const headerMatch = raw.match(
    /(?:Detailed (?:Technical|Architectural|Cloud Architecture) (?:Explanation|Mapping|Principle):\s*)([\s\S]*?)(?:### Analysis|### Multi-Cloud|### Option Review|\n\n-|\n-|$)/i
  );
  if (headerMatch && headerMatch[1]) {
    let clean = formatSentence(headerMatch[1]);
    clean = clean.replace(/^The correct answer to .*? is Option [A-D]:\s*/i, '');
    clean = clean.replace(/In cloud computing architectures:\s*/i, '');
    clean = clean.replace(/\bAWS\.\s*\./i, 'AWS.');
    return formatSentence(clean);
  }

  return null;
}

// 7. Pair patterns (MS Office, DevOps, Cybersecurity, DBMS FDs, Java, etc.)
function getPairPatternExplanation(category, stem, answerText) {
  // Excel cell #####
  if (stem.includes("##### in an Excel cell")) {
    return `In Microsoft Excel, a series of hash marks (#####) indicates that the column width is too narrow to display the complete numerical or date value.`;
  }

  // MS Word same layout different content
  if (stem.includes("same layout but different content") || stem.includes("Mail Merge")) {
    return `Mail Merge in Microsoft Word allows creating multiple documents with shared layout and formatting but individualized data for each recipient.`;
  }

  // VLOOKUP in Excel
  if (stem.includes("=VLOOKUP") || stem.includes("VLOOKUP")) {
    return `=VLOOKUP searches for a lookup value in the first column of a table range and retrieves a value in the same row from a specified column index.`;
  }

  // Insert slide in PowerPoint
  if (stem.includes("insert a new slide in a PowerPoint")) {
    return `In Microsoft PowerPoint, pressing Ctrl + M inserts a new blank slide immediately following the currently active slide.`;
  }

  // Out of Office in Outlook
  if (stem.includes("Out of Office")) {
    return `The Out of Office feature in Microsoft Outlook configures automated reply messages to incoming emails while you are away.`;
  }

  // Excel 2016 default file extension
  if (stem.includes("default file extension for an Excel")) {
    return `.xlsx is the default XML-based workbook file format introduced in Microsoft Excel 2007 and utilized in all subsequent versions.`;
  }

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

  // Linux command: What does the Linux command `<X>` do?
  m = stem.match(/What\s+does\s+the\s+Linux\s+command\s+`?([A-Za-z0-9\-\s_]+)`?\s+do\??$/i);
  if (m) {
    const cmd = m[1].trim();
    return `The \`${cmd}\` utility in Linux is used to ${answerText.toLowerCase().replace(/\.$/, '')}.`;
  }

  // Which Linux command is used to: <action>?
  m = stem.match(/Which\s+Linux\s+command\s+is\s+used\s+to:\s*(.*?)\??$/i);
  if (m) {
    const action = m[1].trim().replace(/\.$/, '');
    return `The \`${answerText}\` utility in Linux is used to ${action.toLowerCase()}.`;
  }

  // Docker command: What does the Docker command `<X>` do?
  m = stem.match(/What\s+does\s+the\s+Docker\s+command\s+`?([A-Za-z0-9\-\s_]+)`?\s+do\??$/i);
  if (m) {
    const cmd = m[1].trim();
    return `The command \`${cmd}\` in Docker is used to ${answerText.toLowerCase().replace(/\.$/, '')}.`;
  }

  // Which attack or threat is described as <action>?
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

  // Which protocol is commonly used for secure communication over a network?
  if (stem.includes("secure communication over a network")) {
    return `HTTPS encrypts web traffic over TLS/SSL (port 443) to guarantee confidentiality and integrity across networks.`;
  }

  // Firewall function
  if (stem.includes("primary function of a firewall in network security")) {
    return `Firewalls establish security perimeters by inspecting incoming and outgoing traffic and filtering unauthorized packets according to rules.`;
  }

  // Zero-day exploit
  if (stem.includes("zero-day exploit")) {
    return `A zero-day exploit targets an unknown software vulnerability for which no vendor patch or fix currently exists.`;
  }

  // 2FA prevention
  if (stem.includes("two-factor authentication") || stem.includes("preventing unauthorized access")) {
    return `Two-Factor Authentication (2FA) enforces two separate authentication factors, preventing unauthorized access even if passwords are leaked.`;
  }

  // DBMS Cartesian Product attributes: If R has X attributes and S has Y attributes, how many attributes does R × S have?
  let cartMatch = stem.match(/R has (\d+) attributes and S has (\d+) attributes.*?R × S/i);
  if (cartMatch) {
    const a = parseInt(cartMatch[1], 10);
    const b = parseInt(cartMatch[2], 10);
    return `The degree (number of attributes) of a Cartesian product R × S equals the sum of the degrees of the relations: ${a} + ${b} = ${answerText}.`;
  }

  // DBMS ER diagrams
  if (stem.includes("what shape represents an attribute")) {
    return `In Chen's ER diagram notation, an ellipse (oval) represents an attribute of an entity set.`;
  }
  if (stem.includes("what shape represents a relationship")) {
    return `In Chen's ER diagram notation, a diamond represents a relationship set between entity sets.`;
  }
  if (stem.includes("what shape represents an entity")) {
    return `In Chen's ER diagram notation, a rectangle represents an entity set.`;
  }

  // DBMS Three-schema architecture
  if (stem.includes("three-schema architecture")) {
    return `The ANSI-SPARC three-schema architecture comprises exactly three abstraction levels: external (view), conceptual (logical), and internal (physical).`;
  }

  // DBMS FDs: Consider the relation R... with FDs: ... What is the attribute closure ...
  if (stem.includes("attribute closure") || stem.includes("FDs:")) {
    return `Computing the attribute closure involves iteratively adding the right-hand attributes of functional dependencies whose determinants are in the current set, yielding ${answerText}.`;
  }

  // Java Primitives
  if (stem.includes("size of a char in Java")) {
    return `In Java, a char is 16 bits (2 bytes) unsigned because Java uses 16-bit Unicode character representation (UTF-16).`;
  }
  if (stem.includes("default value of a boolean instance variable")) {
    return `In Java, primitive boolean instance variables default to false upon object allocation.`;
  }
  if (stem.includes("default value of an object reference field")) {
    return `In Java, uninitialized instance reference variables default to null.`;
  }
  if (stem.includes("default value of an int array element")) {
    return `When an int array is instantiated in Java, all elements are initialized to the default value 0.`;
  }
  if (stem.includes("four pillars of OOP")) {
    return `The four foundational pillars of Object-Oriented Programming are Encapsulation (data hiding), Inheritance (code reuse), Polymorphism (dynamic behavior), and Abstraction (interface simplicity).`;
  }

  return null;
}

// 8. General concept mappings
function getGeneralConceptExplanation(stem, answerText) {
  if (stem.includes("belongs to which cloud provider")) {
    const m = stem.match(/(.*?) belongs to which cloud provider/i);
    const svc = m ? m[1].trim() : "This service";
    return `${svc} is an official cloud offering developed and managed by ${answerText}.`;
  }
  if (stem.includes("is the equivalent of")) {
    const m = stem.match(/(Which .*? service) is the equivalent of (.*?)\?/i);
    if (m) {
      return `${answerText} represents the direct cloud architectural equivalent of ${m[2]}, providing matched functionality and service tier.`;
    }
  }
  return null;
}

// 9. Existing explanation sanitizer for high-quality items
function getCleanExistingExplanation(raw, answerText) {
  if (!raw) return null;
  const cleaned = formatSentence(raw);
  if (
    cleaned.startsWith("The correct answer is") ||
    cleaned.startsWith("Correct Answer:") ||
    cleaned === answerText ||
    cleaned === `${answerText}.` ||
    cleaned.length < 15 ||
    cleaned.includes("Option Review") ||
    cleaned.includes("Option A") ||
    cleaned.includes("Option B") ||
    cleaned.includes("Option C") ||
    cleaned.includes("Option D") ||
    cleaned.includes("Analysis of") ||
    cleaned.includes("Does not satisfy") ||
    cleaned.includes("Does not provide") ||
    cleaned.includes("Does not represent") ||
    cleaned.includes("Detailed Technical Concept:")
  ) {
    return null;
  }
  return cleaned;
}

// Master resolver
function resolveQuestionExplanation(q) {
  let p = null;
  if (q.starterCode) {
    try { p = JSON.parse(q.starterCode); } catch {}
  }
  const stem = p?.stem || q.title;
  const answerText = p?.correctAnswerText || q.solution;
  const codeBlock = p?.codeBlock;
  const rawExp = q.explanation;

  // 1. Networking specialized rules (subnet masks, network address, broadcast, lengths, etc.)
  if (q.category === 'Networking') {
    const net = getNetworkingExplanation(stem, answerText);
    if (net) return { text: net, type: 'NETWORKING_RESOLVED' };
  }

  // 2. Bulky markdown extractor (Cloud & Networking ports)
  const bulky = getBulkyMarkdownExplanation(rawExp);
  if (bulky) return { text: bulky, type: 'BULKY_EXTRACTED' };

  // 3. Number conversions (Computer Fundamentals)
  const conv = getNumberConversionExplanation(stem, answerText);
  if (conv) return { text: conv, type: 'COMPUTED_CONVERSION' };

  // 4. Hardware / Acronyms (Computer Fundamentals)
  const comp = getComputerFundamentalsExplanation(stem, answerText);
  if (comp) return { text: comp, type: 'HARDWARE_CONCEPT' };

  // 5. Pseudocode execution
  const pseudo = getPseudocodeExplanation(codeBlock, answerText);
  if (pseudo) return { text: pseudo, type: 'COMPUTED_PSEUDOCODE' };

  // 6. SQL Queries
  const sql = getSqlExplanation(stem, codeBlock, answerText);
  if (sql) return { text: sql, type: 'SQL_QUERY_METRIC' };

  // 7. Paired pattern (MS Office, DevOps, Cybersecurity, DBMS FDs, Java, etc.)
  const pair = getPairPatternExplanation(q.category, stem, answerText);
  if (pair) return { text: pair, type: 'PAIR_PATTERN' };

  // 8. General concept
  const gen = getGeneralConceptExplanation(stem, answerText);
  if (gen) return { text: gen, type: 'GENERAL_CONCEPT' };

  // 9. Existing clean explanation
  const existing = getCleanExistingExplanation(rawExp, answerText);
  if (existing) return { text: existing, type: 'ALREADY_GOOD' };

  // 10. Semantic fallback: factual statement linking stem and answer
  const cleanStem = stem.replace(/\?$/, '').replace(/^[\[\(].*?[\]\)]\s*/, '').trim();
  return {
    text: `${answerText} directly fulfills the required technical specification for "${cleanStem}".`,
    type: 'SEMANTIC_FACTUAL'
  };
}

module.exports = {
  resolveQuestionExplanation,
  formatSentence
};
