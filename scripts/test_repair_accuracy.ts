import { prisma } from "../src/lib/prisma";
import canonicalBank from "../src/data/canonical_mcq_bank.json";
import * as fs from "fs";

// Comprehensive verified question repository
interface VerifiedEntry {
  patterns: (string | RegExp)[];
  answerText: string;
  explanation: string;
  section: string;
}

const VERIFIED_ENTRIES: VerifiedEntry[] = [
  {
    patterns: [/vlookup/i],
    answerText: "Looks up a value in the first column and returns a value in the same row from another column.",
    explanation: "=VLOOKUP searches for a value in the first column of a table array and returns a value in the same row from another column.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/default file extension for an excel 2016/i, /extension for an excel 2016/i],
    answerText: ".xlsx",
    explanation: ".xlsx is the default XML-based workbook format in modern Microsoft Excel versions.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/schedule emails to be sent at a later time/i],
    answerText: "Delay Delivery",
    explanation: "In Microsoft Outlook desktop client, the 'Delay Delivery' option under Message Properties allows scheduling an email to be sent at a specific future date and time.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/insert a new slide in a powerpoint presentation/i],
    answerText: "Ctrl + M",
    explanation: "In Microsoft PowerPoint, Ctrl + M inserts a new slide into the presentation.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/create a set of documents that have the same layout but different content/i],
    answerText: "Mail Merge",
    explanation: "Mail Merge in MS Word allows producing multiple customized documents with identical layout but personalized fields.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/transition effect between slides that matches the previous slide/i],
    answerText: "Slide Sorter",
    explanation: "Slide Sorter view displays thumbnails of slides to organize transitions and slide order.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/automatically corrects common typing errors as you type/i],
    answerText: "AutoCorrect",
    explanation: "AutoCorrect automatically fixes capitalization errors and common typos in real-time as words are typed.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/assign ip addresses automatically to devices on a network/i],
    answerText: "DHCP",
    explanation: "Dynamic Host Configuration Protocol (DHCP) automatically assigns dynamic IP addresses and network parameters to client devices.",
    section: "Networking",
  },
  {
    patterns: [/primary purpose of a router in a network/i, /primary function of a router in a network/i],
    answerText: "To forward data packets between computer networks",
    explanation: "Routers forward data packets across disparate computer networks based on IP routing tables at Layer 3.",
    section: "Networking",
  },
  {
    patterns: [/establishing, managing, and terminating connections/i, /session layer/i],
    answerText: "Session Layer",
    explanation: "Layer 5 (Session Layer) of the OSI model coordinates and synchronizes sessions between communication processes.",
    section: "Networking",
  },
  {
    patterns: [/what does the ping command do/i],
    answerText: "Tests the reachability of a host on an IP network.",
    explanation: "The ping utility sends ICMP Echo Request messages to verify network connectivity and reachability of a target host.",
    section: "Networking",
  },
  {
    patterns: [/central hub to which all other nodes are connected/i],
    answerText: "Star",
    explanation: "In a Star topology, all network nodes connect directly to a central networking device (switch or hub).",
    section: "Networking",
  },
  {
    patterns: [/secure communication over a network/i, /protocol is commonly used for secure communication/i],
    answerText: "HTTPS",
    explanation: "HTTPS encrypts HTTP communication using TLS/SSL over port 443 to secure data transfer.",
    section: "Networking",
  },
  {
    patterns: [/primary function of a firewall in network security/i],
    answerText: "To block unauthorized access to or from a private network.",
    explanation: "Firewalls monitor and filter incoming and outgoing network traffic based on predefined security rules.",
    section: "Networking",
  },
  {
    patterns: [/form of social engineering attack/i],
    answerText: "Phishing",
    explanation: "Phishing is a social engineering attack where attackers deceive users into disclosing sensitive information.",
    section: "Cybersecurity",
  },
  {
    patterns: [/what does the term "zero-day exploit" refer to/i, /term zero-day exploit refer to/i],
    answerText: "A security vulnerability that is unknown to the software vendor.",
    explanation: "A zero-day exploit targets a previously undisclosed software flaw before the vendor releases a patch.",
    section: "Cybersecurity",
  },
  {
    patterns: [/most effective in preventing unauthorized access to a user's account/i],
    answerText: "Enabling two-factor authentication (2FA)",
    explanation: "Multi-Factor/Two-Factor Authentication (2FA) adds a critical layer of defense beyond just static passwords.",
    section: "Cybersecurity",
  },
  {
    patterns: [/type of malware encrypts a user's files and demands payment/i],
    answerText: "Ransomware",
    explanation: "Ransomware encrypts user or enterprise files and demands a ransom payment in exchange for the decryption key.",
    section: "Cybersecurity",
  },
  {
    patterns: [/benefit of using cloud computing/i],
    answerText: "Reduced need for physical storage devices",
    explanation: "Cloud computing eliminates the requirement for capital expenditures on physical on-premise hardware storage.",
    section: "Cloud Computing",
  },
  {
    patterns: [/what is the purpose of encryption in cybersecurity/i],
    answerText: "To protect data from unauthorized access by transforming it into an unreadable format.",
    explanation: "Encryption transforms readable plaintext into unintelligible ciphertext using cryptographic algorithms.",
    section: "Cybersecurity",
  },
  {
    patterns: [/cloud computing model provides virtualized computing resources over the internet/i],
    answerText: "Infrastructure as a Service (IaaS)",
    explanation: "Infrastructure as a Service (IaaS) delivers fundamental computing, storage, and networking resources on demand.",
    section: "Cloud Computing",
  },
  {
    patterns: [/what does "saas" stand for in cloud computing/i, /what does saas stand for/i],
    answerText: "Software as a Service",
    explanation: "SaaS stands for Software as a Service, where applications are hosted by a vendor and provided over the internet.",
    section: "Cloud Computing",
  },
  {
    patterns: [/not a characteristic of cloud computing/i],
    answerText: "Fixed pricing",
    explanation: "NIST defines cloud computing by measured service / pay-as-you-go pricing, on-demand self-service, broad network access, resource pooling, and rapid elasticity. Fixed pricing is NOT a characteristic.",
    section: "Cloud Computing",
  },
  {
    patterns: [/purpose of a virtual private cloud \(vpc\)/i, /purpose of a virtual private cloud/i],
    answerText: "To create an isolated section of the cloud for security",
    explanation: "A Virtual Private Cloud (VPC) provisions a logically isolated section of the cloud where resources run in a virtual network defined by the user.",
    section: "Cloud Computing",
  },
  {
    patterns: [/cloud deployment model is used by a single organization/i],
    answerText: "Private Cloud",
    explanation: "A Private Cloud is provisioned for exclusive use by a single organization comprising multiple consumers.",
    section: "Cloud Computing",
  },
  {
    patterns: [/in word, what happens when you press 'ctrl \+ shift \+ f'/i, /ctrl \+ shift \+ f/i],
    answerText: "Opens the Font dialog box",
    explanation: "In Microsoft Word, Ctrl + Shift + F opens the Font dialog box to modify font style, size, and effects.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/default paper size in ms word/i],
    answerText: "Letter",
    explanation: "The default paper size in standard Microsoft Word templates is Letter (8.5 x 11 inches).",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/excel functions can be used to combine the text from multiple cells/i],
    answerText: "CONCATENATE",
    explanation: "CONCATENATE (and CONCAT / TEXTJOIN in newer versions) joins two or more text strings into one string.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/primary function of a vlan/i],
    answerText: "To allow multiple networks on a single switch",
    explanation: "A Virtual LAN (VLAN) partitions a physical switch into multiple logical broadcast domains.",
    section: "Networking",
  },
  {
    patterns: [/protocol is used to securely transmit data over a vpn/i],
    answerText: "IPSec",
    explanation: "IPsec (Internet Protocol Security) is the standard suite of protocols used to authenticate and encrypt IP packets in VPN tunnels.",
    section: "Networking",
  },
  {
    patterns: [/purpose of the arp \(address resolution protocol\)/i, /purpose of the arp/i],
    answerText: "To map IP addresses to MAC addresses",
    explanation: "Address Resolution Protocol (ARP) translates 32-bit logical IPv4 addresses to 48-bit physical MAC addresses.",
    section: "Networking",
  },
  {
    patterns: [/view the routing table in a network device/i],
    answerText: "route",
    explanation: "The 'route print' or 'route' command displays the IP routing table on Windows and network devices.",
    section: "Networking",
  },
  {
    patterns: [/intercepting and altering communication between two parties/i],
    answerText: "Man-in-the-Middle (MITM)",
    explanation: "A Man-in-the-Middle (MitM) attack occurs when an attacker intercepts and relays messages between two parties who believe they are communicating directly.",
    section: "Cybersecurity",
  },
  {
    patterns: [/identify vulnerabilities in a system by simulating an attack/i],
    answerText: "Penetration Testing",
    explanation: "Penetration testing (pen testing) simulates cyberattacks against computer systems to identify exploitable security flaws.",
    section: "Cybersecurity",
  },
  {
    patterns: [/primary purpose of a honeypot in cybersecurity/i],
    answerText: "To act as a decoy to lure attackers",
    explanation: "A honeypot is an intentionally vulnerable decoy system deployed to detect, deflect, or study cyberattacks.",
    section: "Cybersecurity",
  },
  {
    patterns: [/security protocol is used to ensure secure communication over a wireless network/i],
    answerText: "WPA3",
    explanation: "Wi-Fi Protected Access 3 (WPA3) provides the latest cryptographic security standards for wireless networks.",
    section: "Networking",
  },
  {
    patterns: [/finds the highest value in a range of cells/i],
    answerText: "MAX",
    explanation: "The MAX function in Microsoft Excel returns the largest numerical value from a selected range.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/shortcut key to open the find dialog box in ms word/i],
    answerText: "Ctrl+F",
    explanation: "Ctrl + F opens the Find navigation pane in Microsoft Word.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/close a tab in a browser/i],
    answerText: "Ctrl+W",
    explanation: "Ctrl + W closes the currently active tab across modern web browsers.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/green underline in ms word signify/i],
    answerText: "Grammatical error",
    explanation: "In Microsoft Word, a wavy green underline marks grammatical inconsistencies.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/attack involves forging an ip address to impersonate another device/i],
    answerText: "Spoofing",
    explanation: "IP spoofing creates packets with a forged source IP address to impersonate another trusted system.",
    section: "Networking",
  },
  {
    patterns: [/quickly applies a set of formatting choices to a range of cells/i],
    answerText: "Cell Styles",
    explanation: "Cell Styles in Excel quickly format cells using predefined combinations of fonts, borders, and fills.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/two steps backward from any particular directory in the command prompt/i],
    answerText: "cd ../..",
    explanation: "'cd ..' goes up one level; 'cd ../..' navigates two levels up in directory hierarchy.",
    section: "Networking",
  },
  {
    patterns: [/which layer of the osi model is responsible for error detection and correction/i],
    answerText: "Data Link Layer",
    explanation: "The Data Link Layer (Layer 2) provides frame synchronization and error detection through CRC.",
    section: "Networking",
  },
  {
    patterns: [/role of a gateway in the context of networking|role of a gateway\?/i],
    answerText: "To connect two different networks",
    explanation: "A gateway interconnects two different networks running disparate network protocols.",
    section: "Networking",
  },
  {
    patterns: [/what is cloud migration/i],
    answerText: "The process of moving data, applications, or other business elements to a cloud computing environment",
    explanation: "Cloud migration is the strategic process of moving digital assets and workloads to cloud environments.",
    section: "Cloud Computing",
  },
  {
    patterns: [/permit smtp mail to only host 1\.1\.1\.1/i],
    answerText: "access-list 110 permit tcp any host 1.1.1.1 eq smtp",
    explanation: "In Cisco IOS extended ACLs, access-list 110 permit tcp any host 1.1.1.1 eq smtp explicitly permits SMTP traffic to host 1.1.1.1.",
    section: "Networking",
  },
  {
    patterns: [/network security device scans for viruses and malware/i],
    answerText: "Antivirus scanning devices",
    explanation: "Antivirus appliances and gateway security scanners inspect payloads for malware and virus signatures.",
    section: "Networking",
  },
  {
    patterns: [/how can you stop automatic numbering in ms word/i],
    answerText: "Press the Enter key twice or click the Numbering button again",
    explanation: "Pressing Enter twice after an automatic list item cancels automatic numbering in MS Word.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/select a word or phrase in ms word/i],
    answerText: "Shift",
    explanation: "Holding Shift while pressing navigation arrow keys selects text in Microsoft Word.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/shortcut key to cut/i, /cut selected text in ms word/i],
    answerText: "Ctrl+X",
    explanation: "Ctrl + X cuts the currently selected text to the clipboard.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/shortcut key to paste/i, /paste copied content in ms office/i],
    answerText: "Ctrl+V",
    explanation: "Ctrl + V pastes copied or cut text from the clipboard.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/shortcut key to copy/i, /copy selected text in ms office/i],
    answerText: "Ctrl+C",
    explanation: "Ctrl + C copies the selected content to the clipboard.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/shortcut key to print/i, /print a document in ms office/i],
    answerText: "Ctrl+P",
    explanation: "Ctrl + P opens the Print dialog box in Microsoft Office.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/open a new document in ms word/i],
    answerText: "Ctrl+N",
    explanation: "Ctrl + N creates and opens a new blank document in Microsoft Word.",
    section: "Common Applications & MS Office",
  },
  {
    patterns: [/save a document in ms word/i],
    answerText: "Ctrl+S",
    explanation: "Ctrl + S saves the current document in Microsoft Word.",
    section: "Common Applications & MS Office",
  },
];

async function testMatch() {
  const qs = await prisma.question.findMany({
    where: { questionType: "MCQ" },
    select: { id: true, slug: true, title: true, description: true, solution: true, starterCode: true, category: true, verificationStatus: true },
  });

  let verifiedCount = 0;
  let needsVerificationCount = 0;
  let sourceConflictCount = 0;

  for (const q of qs) {
    if (q.starterCode) {
      try {
        const p = JSON.parse(q.starterCode);
        if (p.verificationStatus === "SOURCE_CONFLICT") {
          sourceConflictCount++;
          continue;
        }
        if (p.options && p.correctOptionId && p.correctAnswerText) {
          verifiedCount++;
          continue;
        }
      } catch (e) {}
    }

    if (q.solution) {
      verifiedCount++;
      continue;
    }

    // Check knowledge base
    const text = (q.title + " " + q.description).toLowerCase();
    let found = false;
    for (const entry of VERIFIED_ENTRIES) {
      for (const pat of entry.patterns) {
        if (typeof pat === "string" ? text.includes(pat) : pat.test(text)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (found) {
      verifiedCount++;
    } else if (q.verificationStatus === "SOURCE_INCONSISTENT" || q.title.toLowerCase() === "question") {
      sourceConflictCount++;
    } else {
      needsVerificationCount++;
    }
  }

  console.log({ total: qs.length, verifiedCount, needsVerificationCount, sourceConflictCount });
}

testMatch().catch(console.error);
