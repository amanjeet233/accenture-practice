const { PORTS, PROTOCOL_NAMES, OSI_LAYERS } = require('./net_knowledge_base');

function generateExplanation(question) {
  const parsed = JSON.parse(question.starterCode);
  const stem = parsed.stem.trim();
  const options = parsed.options;
  const correctId = parsed.correctOptionId;
  const correctText = parsed.correctAnswerText.trim();

  // 1. Port Number Questions: "What is the default port number of X?"
  const portOfProtocolMatch = stem.match(/default port number of ([^?]+)/i);
  if (portOfProtocolMatch) {
    const protoRaw = portOfProtocolMatch[1].trim();
    const portInfo = PORTS[correctText] || {};
    
    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const p = PORTS[o.text.trim()];
        return p ? `- **Option ${o.id} (${o.text})**: Assigned port for **${p.protocol}** (${p.desc}).` : `- **Option ${o.id} (${o.text})**: Not the standard port for ${protoRaw}.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Technical Explanation:**
The standard default port for **${protoRaw}** is **${correctText}**.
${portInfo.desc ? `**${portInfo.protocol || protoRaw}** is used for ${portInfo.desc}, operating primarily over transport protocol **${portInfo.transport || 'TCP'}**.` : ''}

### Analysis of All Options:
- **Option ${correctId} (${correctText}) [CORRECT]**: Standard registered/well-known port assigned by IANA for ${protoRaw}.
${otherDistractors}`;
  }

  // 2. Protocol for Port Questions: "Which protocol uses default port X?"
  const protocolForPortMatch = stem.match(/default port (\d+)/i);
  if (protocolForPortMatch) {
    const portNum = protocolForPortMatch[1];
    const portInfo = PORTS[portNum] || {};

    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const protoKey = o.text.trim().toUpperCase();
        const p = PROTOCOL_NAMES[protoKey];
        return p ? `- **Option ${o.id} (${o.text})**: Operates by default on port **${p.port}** (${p.desc}).` : `- **Option ${o.id} (${o.text})**: Does not use port ${portNum}.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Technical Explanation:**
Port **${portNum}** is the well-known port assigned by IANA to **${correctText}**.
${portInfo.desc ? `It handles ${portInfo.desc} using transport layer **${portInfo.transport || 'TCP'}**.` : ''}

### Analysis of All Options:
- **Option ${correctId} (${correctText}) [CORRECT]**: Default protocol listener on port ${portNum}.
${otherDistractors}`;
  }

  // 3. OSI Layer Questions: "At which OSI layer does the following operate or belong: X?"
  const osiBelongMatch = stem.match(/At which OSI layer does the following operate or belong:\s*([^?]+)/i);
  if (osiBelongMatch) {
    const item = osiBelongMatch[1].trim();
    let layerNum = "";
    for (const [num, l] of Object.entries(OSI_LAYERS)) {
      if (l.name.toLowerCase() === correctText.toLowerCase()) {
        layerNum = `Layer ${num}`;
        break;
      }
    }

    const layerData = Object.values(OSI_LAYERS).find(l => l.name.toLowerCase() === correctText.toLowerCase());

    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const l = Object.values(OSI_LAYERS).find(layer => layer.name.toLowerCase() === o.text.trim().toLowerCase());
        return l ? `- **Option ${o.id} (${o.text})**: Deals with **${l.pdu}** and functions such as ${l.desc}` : `- **Option ${o.id} (${o.text})**: Incorrect layer for ${item}.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Technical Explanation:**
**${item}** operates at the **${correctText}** (${layerNum || 'OSI Model'}).
${layerData ? `- **Protocol Data Unit (PDU)**: ${layerData.pdu}\n- **Core Responsibility**: ${layerData.desc}\n- **Associated Devices / Technologies**: ${layerData.devices}` : ''}

### OSI Layer Breakdown:
- **Option ${correctId} (${correctText}) [CORRECT]**: Directly responsible for ${item}'s network functionality.
${otherDistractors}`;
  }

  // 4. Subnet division: "dividing /X into /Y subnets"
  const subnetDivMatch = stem.match(/dividing [^/]*\/(\d+) into \/(\d+) subnets/i);
  if (subnetDivMatch) {
    const p1 = parseInt(subnetDivMatch[1], 10);
    const p2 = parseInt(subnetDivMatch[2], 10);
    const borrowed = p2 - p1;
    const numSubnets = Math.pow(2, borrowed);

    return `### Correct Answer: Option ${correctId} (${correctText})

**Subnetting Calculation Walkthrough:**
1. **Initial Network Prefix**: \`/${p1}\`
2. **New Subnet Prefix**: \`/${p2}\`
3. **Borrowed Subnet Bits ($n$)**: 
   $$n = ${p2} - ${p1} = ${borrowed} \\text{ bits}$$
4. **Number of Subnets Created ($2^n$)**: 
   $$2^{${borrowed}} = ${numSubnets} \\text{ subnets}$$

Each resulting \`/${p2}\` subnet contains $2^{32 - ${p2}} = ${Math.pow(2, 32 - p2)}$ total IP addresses ($${Math.pow(2, 32 - p2) - 2}$ usable host addresses).

### Option Analysis:
- **Option ${correctId} (${correctText}) [CORRECT]**: Matches the mathematical derivation of $2^{${borrowed}} = ${numSubnets}$.
- Distractors reflect incorrect powers of 2 or confusing host capacity with subnet count.`;
  }

  // 5. Subnetting / Usable Host Questions: "How many usable host addresses are available in a /X IPv4 network?"
  const usableHostMatch = stem.match(/(\/\d+)/);
  if (/usable host/i.test(stem) && usableHostMatch) {
    const prefix = parseInt(usableHostMatch[1].replace('/', ''), 10);
    const hostBits = 32 - prefix;
    const totalAddresses = Math.pow(2, hostBits);
    const usableHosts = totalAddresses >= 2 ? totalAddresses - 2 : 0;

    return `### Correct Answer: Option ${correctId} (${correctText})

**Mathematical Derivation & Subnetting Logic:**
1. **Total Bits in an IPv4 Address**: 32 bits.
2. **Network Prefix**: \`/${prefix}\` gives ${prefix} network bits.
3. **Host Bits available ($H$)**: 
   $$H = 32 - ${prefix} = ${hostBits} \\text{ bits}$$
4. **Total Addresses ($2^H$)**: 
   $$2^{${hostBits}} = ${totalAddresses} \\text{ total IP addresses}$$
5. **Usable Host Addresses ($2^H - 2$)**: 
   $$${totalAddresses} - 2 = ${usableHosts} \\text{ usable host IPs}$$

*(Note: We subtract 2 reserved addresses: the **Network ID** with all host bits set to 0, and the **Directed Broadcast Address** with all host bits set to 1).*

### Option Analysis:
- **Option ${correctId} (${correctText}) [CORRECT]**: Matches the calculated usable host capacity ($2^{${hostBits}} - 2 = ${usableHosts}$).
- Distractor options represent either total addresses (${totalAddresses}), adjacent prefix sizes, or incorrect host bit calculations.`;
  }

  // 6. OSI Layer Responsibility Question
  if (/OSI/i.test(stem) && /layer/i.test(stem)) {
    const layerData = Object.values(OSI_LAYERS).find(l => l.name.toLowerCase() === correctText.toLowerCase());
    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const l = Object.values(OSI_LAYERS).find(layer => layer.name.toLowerCase() === o.text.trim().toLowerCase());
        return l ? `- **Option ${o.id} (${o.text})**: Primarily responsible for ${l.desc.toLowerCase()}` : `- **Option ${o.id} (${o.text})**: Incorrect layer for this duty.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Architectural Explanation:**
${correctText} in the OSI 7-Layer Reference Model is specifically tasked with this functionality.
${layerData ? `- **Layer Name & Role**: ${layerData.name} layer (${layerData.desc})\n- **PDU (Protocol Data Unit)**: ${layerData.pdu}\n- **Standard Devices/Protocols**: ${layerData.devices}` : ''}

### Analysis of OSI Layers:
- **Option ${correctId} (${correctText}) [CORRECT]**: Directly fulfills the responsibility described in the problem statement.
${otherDistractors}`;
  }

  // 7. General Networking Concepts
  let otherDistractors = options
    .filter(o => o.id !== correctId)
    .map(o => `- **Option ${o.id} (${o.text})**: Does not satisfy the definition or technical requirement specified in the question.`)
    .join('\n');

  return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Technical Concept:**
The correct answer to *"**${stem}**"* is **Option ${correctId}: ${correctText}**.

In enterprise computer networking and data communications:
- **${correctText}** constitutes the established standard, correct protocol mechanism, or architectural principle defined in IEEE / IETF RFC standards.
- This design ensures reliable transmission, deterministic routing, protocol compatibility, and efficient network operation across heterogeneous systems.

### Option Review:
- **Option ${correctId} (${correctText}) [CORRECT]**: Accurately addresses the network engineering condition or definition.
${otherDistractors}`;
}

module.exports = { generateExplanation };
