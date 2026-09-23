const { CLOUD_SERVICES, SERVICE_MODELS } = require('./cloud_knowledge_base');

function generateExplanation(question) {
  const parsed = JSON.parse(question.starterCode);
  const stem = parsed.stem.trim();
  const options = parsed.options;
  const correctId = parsed.correctOptionId;
  const correctText = parsed.correctAnswerText.trim();

  // 1. Cross-provider equivalent: "Which [Provider] service is the equivalent of [Service]?"
  const equivMatch = stem.match(/equivalent of ([^?]+)/i);
  if (equivMatch) {
    const targetService = equivMatch[1].trim();
    const sourceInfo = CLOUD_SERVICES[targetService];
    const matchInfo = CLOUD_SERVICES[correctText];

    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const s = CLOUD_SERVICES[o.text.trim()];
        return s ? `- **Option ${o.id} (${o.text})**: Provides ${s.category} (${s.desc}).` : `- **Option ${o.id} (${o.text})**: Not the direct architectural equivalent of ${targetService}.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Architectural Mapping:**
In cloud engineering architectures, **${correctText}** is the direct equivalent of **${targetService}**.
${matchInfo ? `- **Category**: ${matchInfo.category}\n- **Operational Role**: ${matchInfo.desc}` : ''}
${sourceInfo ? `- **Reference Service (${targetService})**: ${sourceInfo.desc}` : ''}

### Multi-Cloud Cross-Comparison:
- **Option ${correctId} (${correctText}) [CORRECT]**: Directly matches the functionality, architectural layer, and service model of ${targetService}.
${otherDistractors}`;
  }

  // 2. Service capability: "Which [Provider] service provides [capability]?"
  const capabilityMatch = stem.match(/Which (AWS|Azure|Google Cloud) service provides ([^?]+)/i);
  if (capabilityMatch) {
    const provider = capabilityMatch[1];
    const capability = capabilityMatch[2].trim();
    const serviceInfo = CLOUD_SERVICES[correctText];

    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const s = CLOUD_SERVICES[o.text.trim()];
        return s ? `- **Option ${o.id} (${o.text})**: ${s.provider} service for **${s.category}** (${s.desc}).` : `- **Option ${o.id} (${o.text})**: Does not provide ${capability}.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Technical Explanation:**
Under **${provider}**, the service dedicated to **${capability}** is **${correctText}**.
${serviceInfo ? `- **Primary Domain**: ${serviceInfo.category}\n- **Key Functionality**: ${serviceInfo.desc}` : ''}

### Analysis of All Options:
- **Option ${correctId} (${correctText}) [CORRECT]**: Officially designated cloud service providing ${capability}.
${otherDistractors}`;
  }

  // 3. Service Models (IaaS, PaaS, SaaS, FaaS)
  if (/IaaS|PaaS|SaaS|FaaS|Infrastructure as a Service|Platform as a Service|Software as a Service/i.test(stem)) {
    let otherDistractors = options
      .filter(o => o.id !== correctId)
      .map(o => {
        const m = SERVICE_MODELS[o.text.trim()];
        return m ? `- **Option ${o.id} (${o.text})**: **${m.name}** — ${m.role}` : `- **Option ${o.id} (${o.text})**: Not the model described in the problem statement.`;
      }).join('\n');

    return `### Correct Answer: Option ${correctId} (${correctText})

**Cloud Service Model Breakdown:**
The cloud model described in the question is **${correctText}**.

In modern cloud computing:
${SERVICE_MODELS[correctText] ? `- **${correctText} (${SERVICE_MODELS[correctText].name})**: ${SERVICE_MODELS[correctText].role}` : `- **${correctText}**: Establishes this exact division of responsibility between cloud consumer and provider.`}

### Comparison of Service Models:
- **Option ${correctId} (${correctText}) [CORRECT]**: Matches the exact boundary of management and abstraction specified.
${otherDistractors}`;
  }

  // 4. Core Concepts (Vendor lock-in, Scalability, Elasticity, Shared Responsibility, Capex/Opex, Hybrid/Multi-cloud)
  let otherDistractors = options
    .filter(o => o.id !== correctId)
    .map(o => `- **Option ${o.id} (${o.text})**: Does not represent this cloud architecture concept.`)
    .join('\n');

  return `### Correct Answer: Option ${correctId} (${correctText})

**Detailed Cloud Architecture Principle:**
The correct answer to *"**${stem}**"* is **Option ${correctId}: ${correctText}**.

In cloud computing architectures:
- **${correctText}** represents the industry-standard definition and best practice framework established by leading cloud providers (AWS, Microsoft Azure, Google Cloud).
- This principle governs cost efficiency (OpEx vs. CapEx), operational reliability, high availability across Availability Zones, or governance boundaries in enterprise deployments.

### Option Review:
- **Option ${correctId} (${correctText}) [CORRECT]**: Accurately defines the technical principle or requirement specified in the question.
${otherDistractors}`;
}

module.exports = { generateExplanation };
