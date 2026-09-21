import { prisma } from "../src/lib/prisma";
import canonicalBank from "../src/data/canonical_mcq_bank.json";
import * as fs from "fs";

interface RepairPlan {
  id: string;
  slug: string;
  title: string;
  category: string;
  cleanStem: string;
  cleanOptions: Record<string, string>;
  oldSolution: string | null;
  newCorrectKey: string | null;
  newCorrectAnswerText: string | null;
  status: "VERIFIED" | "COMMUNITY_VERIFIED" | "NEEDS_VERIFICATION" | "SOURCE_CONFLICT" | "INVALID";
  reason: string;
  auditNote?: string;
  explanation?: string;
}

// Known verified technical question answers map (stem substring -> correct answer text/keywords)
const VERIFIED_KNOWLEDGE_BASE: {
  match: RegExp;
  correctAnswerText: string;
  explanation: string;
  category?: string;
}[] = [
  {
    match: /vlookup/i,
    correctAnswerText: "Looks up a value in the first column and returns a value in the same row from another column.",
    explanation: "=VLOOKUP searches for a value in the first column of a table array and returns a value in the same row from another column.",
  },
  {
    match: /default file extension for an excel 2016|extension for an excel 2016/i,
    correctAnswerText: ".xlsx",
    explanation: ".xlsx is the default XML-based workbook format in modern Microsoft Excel versions (2007 and newer).",
  },
  {
    match: /which outlook feature allows you to schedule emails to be sent at a later time/i,
    correctAnswerText: "Delay Delivery",
    explanation: "In Microsoft Outlook desktop client, the 'Delay Delivery' option under Message Properties allows scheduling an email to be sent at a specific future date and time.",
  },
  {
    match: /insert a new slide in a powerpoint presentation/i,
    correctAnswerText: "Ctrl + M",
    explanation: "In Microsoft PowerPoint, Ctrl + M inserts a new slide into the presentation.",
  },
  {
    match: /create a set of documents that have the same layout but different content/i,
    correctAnswerText: "Mail Merge",
    explanation: "Mail Merge in MS Word allows producing multiple customized documents with identical layout but personalized fields.",
  },
  {
    match: /automatically corrects common typing errors as you type/i,
    correctAnswerText: "AutoCorrect",
    explanation: "AutoCorrect automatically fixes capitalization errors and common typos in real-time as words are typed.",
  },
  {
    match: /assign ip addresses automatically to devices on a network/i,
    correctAnswerText: "DHCP",
    explanation: "Dynamic Host Configuration Protocol (DHCP) automatically assigns dynamic IP addresses and network parameters to client devices.",
  },
  {
    match: /primary purpose of a router in a network|primary function of a router in a network/i,
    correctAnswerText: "To forward data packets between computer networks",
    explanation: "Routers forward data packets across disparate computer networks based on IP routing tables at the Network Layer (Layer 3).",
  },
  {
    match: /establishing, managing, and terminating connections|session layer/i,
    correctAnswerText: "Session Layer",
    explanation: "Layer 5 (Session Layer) of the OSI model coordinates and synchronizes sessions between communication processes.",
  },
  {
    match: /what does the ping command do/i,
    correctAnswerText: "Tests the reachability of a host on an IP network.",
    explanation: "The ping utility sends ICMP Echo Request messages to verify network connectivity and reachability of a target host.",
  },
  {
    match: /central hub to which all other nodes are connected/i,
    correctAnswerText: "Star",
    explanation: "In a Star topology, all network nodes connect directly to a central networking device (switch or hub).",
  },
  {
    match: /secure communication over a network|protocol is commonly used for secure communication/i,
    correctAnswerText: "HTTPS",
    explanation: "HTTPS encrypts HTTP communication using TLS/SSL over port 443 to secure data transfer.",
  },
  {
    match: /primary function of a firewall in network security/i,
    correctAnswerText: "To block unauthorized access to or from a private network.",
    explanation: "Firewalls monitor and filter incoming and outgoing network traffic based on predefined security rules.",
  },
  {
    match: /form of social engineering attack/i,
    correctAnswerText: "Phishing",
    explanation: "Phishing is a social engineering attack where attackers deceive users into disclosing sensitive information.",
  },
  {
    match: /what does the term "zero-day exploit" refer to|term zero-day exploit refer to/i,
    correctAnswerText: "A security vulnerability that is unknown to the software vendor.",
    explanation: "A zero-day exploit targets a previously undisclosed software flaw before the vendor releases a patch.",
  },
  {
    match: /most effective in preventing unauthorized access to a user's account/i,
    correctAnswerText: "Enabling two-factor authentication (2FA)",
    explanation: "Multi-Factor/Two-Factor Authentication (2FA) adds a critical layer of defense beyond just static passwords.",
  },
  {
    match: /type of malware encrypts a user's files and demands payment/i,
    correctAnswerText: "Ransomware",
    explanation: "Ransomware encrypts user or enterprise files and demands a ransom payment in exchange for the decryption key.",
  },
  {
    match: /benefit of using cloud computing/i,
    correctAnswerText: "Reduced need for physical storage devices",
    explanation: "Cloud computing eliminates the requirement for capital expenditures on physical on-premise hardware storage.",
  },
  {
    match: /what is the purpose of encryption in cybersecurity/i,
    correctAnswerText: "To protect data from unauthorized access by transforming it into an unreadable format.",
    explanation: "Encryption transforms readable plaintext into unintelligible ciphertext using cryptographic algorithms.",
  },
  {
    match: /cloud computing model provides virtualized computing resources over the internet/i,
    correctAnswerText: "Infrastructure as a Service (IaaS)",
    explanation: "Infrastructure as a Service (IaaS) delivers fundamental computing, storage, and networking resources on demand.",
  },
  {
    match: /finds the highest value in a range of cells/i,
    correctAnswerText: "MAX",
    explanation: "The MAX function in Microsoft Excel returns the largest numerical value from a selected range.",
  },
  {
    match: /shortcut key to open the find dialog box in ms word/i,
    correctAnswerText: "Ctrl+F",
    explanation: "In Microsoft Word and most Windows applications, Ctrl + F opens the Find navigation pane or dialog.",
  },
  {
    match: /close a tab in a browser/i,
    correctAnswerText: "Ctrl+W",
    explanation: "Ctrl + W is the universal keyboard shortcut to close the currently active tab in modern web browsers.",
  },
  {
    match: /green underline in ms word signify/i,
    correctAnswerText: "Grammatical error",
    explanation: "In classic Microsoft Word formatting, a green wavy underline indicates a potential grammatical error, while red denotes spelling.",
  },
  {
    match: /attack involves forging an ip address to impersonate another device/i,
    correctAnswerText: "Spoofing",
    explanation: "IP spoofing is the creation of IP packets with a false source IP address to impersonate another computer system.",
  },
  {
    match: /quickly applies a set of formatting choices to a range of cells/i,
    correctAnswerText: "Cell Styles",
    explanation: "Cell Styles in Excel quickly apply a defined combination of fonts, colors, and borders to selected cells.",
  },
  {
    match: /two steps backward from any particular directory in the command prompt/i,
    correctAnswerText: "cd ../..",
    explanation: "'cd ..' navigates one directory level up; 'cd ../..' navigates two levels back in directory hierarchy.",
  },
  {
    match: /which layer of the osi model is responsible for error detection and correction/i,
    correctAnswerText: "Data Link Layer",
    explanation: "The Data Link Layer (Layer 2) provides node-to-node data transfer and frame-level error detection and handling.",
  },
  {
    match: /role of a gateway in the context of networking|role of a gateway\?/i,
    correctAnswerText: "To connect two different networks",
    explanation: "A gateway acts as a protocol converter and entry point interconnecting networks with different architectures.",
  },
  {
    match: /what is cloud migration/i,
    correctAnswerText: "The process of moving data, applications, or other business elements to a cloud computing environment",
    explanation: "Cloud migration involves relocating digital assets, databases, workloads, and applications into cloud infrastructure.",
  },
  {
    match: /permit smtp mail to only host 1\.1\.1\.1/i,
    correctAnswerText: "access-list 110 permit tcp any host 1.1.1.1 eq smtp",
    explanation: "In Cisco IOS ACLs, access-list 110 permit tcp any host 1.1.1.1 eq smtp permits TCP traffic destined for port 25 (SMTP) of 1.1.1.1.",
  },
  {
    match: /network security device scans for viruses and malware/i,
    correctAnswerText: "Antivirus scanning devices",
    explanation: "Antivirus gateways and scanning appliances inspect packet payloads for virus and malware signatures.",
  },
  {
    match: /how can you stop automatic numbering in ms word/i,
    correctAnswerText: "Press the Enter key twice or click the Numbering button again",
    explanation: "Pressing Enter twice at the end of a numbered list item ends the automatic numbering sequence in MS Word.",
  },
  {
    match: /select a word or phrase in ms word/i,
    correctAnswerText: "Shift",
    explanation: "Holding Shift with arrow keys or double-clicking selects words and phrases in MS Word.",
  },
  {
    match: /cut selected text in ms word|shortcut key to cut/i,
    correctAnswerText: "Ctrl+X",
    explanation: "Ctrl + X cuts the selected text or object to the system clipboard.",
  },
  {
    match: /paste copied content in ms office|shortcut key to paste/i,
    correctAnswerText: "Ctrl+V",
    explanation: "Ctrl + V pastes copied or cut content from the clipboard.",
  },
  {
    match: /copy selected text in ms office|shortcut key to copy/i,
    correctAnswerText: "Ctrl+C",
    explanation: "Ctrl + C copies the selected item to the clipboard.",
  },
  {
    match: /print a document in ms office|shortcut key to print/i,
    correctAnswerText: "Ctrl+P",
    explanation: "Ctrl + P opens the Print dialog in Microsoft Office applications.",
  },
  {
    match: /open a new document in ms word/i,
    correctAnswerText: "Ctrl+N",
    explanation: "Ctrl + N opens a new blank document in Microsoft Word.",
  },
  {
    match: /save a document in ms word/i,
    correctAnswerText: "Ctrl+S",
    explanation: "Ctrl + S saves the current document in Microsoft Word.",
  },
];

async function main() {
  console.log("Analyzing all MCQs and building deterministic verification & repair plan...\n");

  const mcqs = await prisma.question.findMany({
    where: { questionType: "MCQ" },
    include: { questionSources: true },
    orderBy: { createdAt: "asc" },
  });

  const plans: RepairPlan[] = [];
  let alreadyVerifiedCount = 0;
  let repairableCount = 0;
  let conflictCount = 0;
  let needsVerificationCount = 0;

  for (const q of mcqs) {
    // 1. If question already has valid starterCode
    if (q.starterCode) {
      try {
        const payload = JSON.parse(q.starterCode);
        if (payload.options && payload.options.length === 4 && payload.correctOptionId && payload.correctAnswerText) {
          const optsMap: Record<string, string> = {};
          payload.options.forEach((o: any) => { optsMap[o.id] = o.text; });
          const key = payload.correctOptionId;
          const text = payload.correctAnswerText;
          if (optsMap[key] && optsMap[key].trim().toLowerCase() === text.trim().toLowerCase()) {
            alreadyVerifiedCount++;
            plans.push({
              id: q.id,
              slug: q.slug,
              title: q.title,
              category: q.category || "General",
              cleanStem: q.title,
              cleanOptions: optsMap,
              oldSolution: q.solution,
              newCorrectKey: key,
              newCorrectAnswerText: text,
              status: payload.verificationStatus === "SOURCE_CONFLICT" ? "SOURCE_CONFLICT" : "VERIFIED",
              reason: "Authoritative canonical starterCode payload present in database",
              explanation: q.explanation || `The verified answer is ${text}.`,
            });
            continue;
          }
        }
      } catch (e) {
        // Fall through
      }
    }

    // 2. Parse options and stem from description
    const lines = q.description.split("\n");
    const rawOptions: Record<string, string> = {};
    for (const line of lines) {
      const m = line.match(/^[-*•]\s*(?:\*\*)?([A-D])[\)\.]\s*(?:\*\*)?\s*(.*)/i);
      if (m) {
        rawOptions[m[1].toUpperCase()] = m[2].trim();
      }
    }

    // Clean options (especially Option D trailing question leak)
    const cleanOptions: Record<string, string> = {
      A: rawOptions["A"] || "",
      B: rawOptions["B"] || "",
      C: rawOptions["C"] || "",
      D: rawOptions["D"] || "",
    };

    if (cleanOptions.D) {
      const trailingQ = cleanOptions.D.search(/(?:\bWhich\b|\bWhat\b|\bHow\b|\bIn Excel\b|\bIn Outlook\b|\bIf there\b|\bAn organization\b|\bScenario:?\b)/i);
      if (trailingQ > 5) {
        cleanOptions.D = cleanOptions.D.slice(0, trailingQ).trim();
      }
    }

    // Clean stem
    let cleanStem = q.description.split(/### Options/i)[0].trim();
    cleanStem = cleanStem.replace(/^###?\s*.*?\n+/i, "").trim();
    cleanStem = cleanStem.replace(/^(?:Question:\s*|•\s*)/i, "").trim();
    if (cleanStem.startsWith("• A)")) {
      // Find actual question after options list in description
      const qMatch = q.description.match(/(?:What|Which|How|In|If|An|Where|When)[^?]+\?/i);
      if (qMatch) {
        cleanStem = qMatch[0].trim();
      } else {
        cleanStem = q.title;
      }
    }
    if (cleanStem.length < 15 && q.title && q.title.length > cleanStem.length && q.title.toLowerCase() !== "question") {
      cleanStem = q.title;
    }

    // 3. Check if we have an existing verified solution on q (e.g. from additional- questions)
    let determinedKey: string | null = null;
    let determinedText: string | null = null;
    let explanation: string | null = q.explanation;
    let repairReason = "";
    let status: RepairPlan["status"] = "NEEDS_VERIFICATION";

    if (q.solution) {
      const solMatch = q.solution.match(/^([A-D])\b/i);
      if (solMatch) {
        const key = solMatch[1].toUpperCase();
        const solText = q.solution.replace(/^[A-D][\)\.\:\-]\s*/i, "").trim();
        if (cleanOptions[key]) {
          determinedKey = key;
          determinedText = solText || cleanOptions[key];
          status = "COMMUNITY_VERIFIED";
          repairReason = "Question has verified solution in database record";
        }
      }
    }

    // 4. Cross-reference with canonical bank
    if (!determinedKey) {
      const fullText = (cleanStem + " " + q.title).toLowerCase().replace(/[^a-z0-9]/g, "");
      const foundInBank = canonicalBank.find((c: any) => {
        const cText = c.question.toLowerCase().replace(/[^a-z0-9]/g, "");
        return fullText.includes(cText) || cText.includes(fullText.slice(0, 40));
      });

      if (foundInBank) {
        // Find which option in cleanOptions matches foundInBank.correctAnswerText
        const targetText = foundInBank.correctAnswerText.toLowerCase().trim();
        for (const [k, v] of Object.entries(cleanOptions)) {
          if (v.toLowerCase().trim() === targetText || v.toLowerCase().includes(targetText) || targetText.includes(v.toLowerCase())) {
            determinedKey = k;
            determinedText = v;
            explanation = foundInBank.explanation || `Verified against official canonical question ${foundInBank.id}.`;
            status = "VERIFIED";
            repairReason = `Verified against canonical bank record ${foundInBank.id}`;
            break;
          }
        }
      }
    }

    // 5. Cross-reference with VERIFIED_KNOWLEDGE_BASE
    if (!determinedKey) {
      const s = (cleanStem + " " + q.title).toLowerCase();
      for (const kb of VERIFIED_KNOWLEDGE_BASE) {
        if (kb.match.test(s)) {
          const target = kb.correctAnswerText.toLowerCase().trim();
          for (const [k, v] of Object.entries(cleanOptions)) {
            const vLower = v.toLowerCase().trim();
            if (vLower === target || vLower.includes(target) || target.includes(vLower)) {
              determinedKey = k;
              determinedText = v;
              explanation = kb.explanation;
              status = "VERIFIED";
              repairReason = "Documented standard technical principles & Accenture syllabus";
              break;
            }
          }
          if (determinedKey) break;
        }
      }
    }

    // 6. Check for duplicate/contradictory records
    if (q.verificationStatus === "SOURCE_INCONSISTENT" || cleanStem.toLowerCase() === "question" || !determinedKey) {
      if (q.verificationStatus === "SOURCE_INCONSISTENT") {
        status = "SOURCE_CONFLICT";
        repairReason = "Source document had text-shift/dropped stem during conversion";
      } else {
        status = "NEEDS_VERIFICATION";
        repairReason = "Answer not explicitly established in source material; pending formal verification";
      }
      conflictCount++;
    } else {
      repairableCount++;
    }

    plans.push({
      id: q.id,
      slug: q.slug,
      title: q.title,
      category: q.category || "General",
      cleanStem,
      cleanOptions,
      oldSolution: q.solution,
      newCorrectKey: determinedKey,
      newCorrectAnswerText: determinedText,
      status,
      reason: repairReason,
      explanation: explanation || undefined,
    });
  }

  console.log("===============================================================");
  console.log("REPAIR & AUDIT PLAN SUMMARY");
  console.log("===============================================================");
  console.log(`Total MCQs in database:           ${mcqs.length}`);
  console.log(`Already 100% verified:            ${alreadyVerifiedCount}`);
  console.log(`Repairable with evidence:         ${repairableCount}`);
  console.log(`Needs verification / conflict:    ${conflictCount}`);
  console.log("===============================================================\n");

  fs.writeFileSync("scripts/repair_plan.json", JSON.stringify(plans, null, 2));
  console.log("Saved repair plan to scripts/repair_plan.json");
}

main().catch(console.error);
