/**
 * Utility functions for cleaning and standardizing MCQ explanations.
 * Eliminates raw markdown headers (###), bold syntax (**), bullet points (-),
 * per-option breakdown filler ("Incorrect layer for this duty"), and extracts
 * clean, concise, 1-3 sentence technical reasoning focused purely on the correct answer.
 */

export function cleanExplanationText(raw?: string | null): string {
  if (!raw) return "";
  let text = raw.trim();

  // If text contains the bulky multi-section format from screenshot 1:
  // e.g. "### Correct Answer: Option C (Session Layer) **Detailed Architectural Explanation:** Session Layer ... ### Analysis of OSI Layers: ..."
  if (
    text.includes("### Correct Answer:") ||
    text.includes("Detailed Technical Explanation:") ||
    text.includes("Detailed Architectural Explanation:")
  ) {
    const match = text.match(
      /(?:Detailed (?:Technical|Architectural) Explanation:\s*)([\s\S]*?)(?:### Analysis|\n\n-|\n-|$)/i
    );
    if (match && match[1]) {
      text = match[1].trim();
    }
  }

  // Strip markdown headers (###)
  text = text.replace(/^###+\s*/gm, "");

  // Strip bold/italic markdown marks (**word** -> word, *word* -> word)
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");

  // Strip markdown bullet points (- bullet or * bullet or • bullet)
  text = text.replace(/^[-*•]\s+/gm, "");

  // Strip duplicate or leading "Explanation:" or "Explanation & Key Concept:" prefixes
  text = text.replace(/^(?:Explanation(?:\s*&\s*Key Concept)?:\s*)+/i, "");

  // Strip "The correct answer is Option X:" prefix if it exists
  text = text.replace(/^The correct answer is Option [A-D]:\s*/i, "");

  // Strip any trailing per-option bullet breakdown if it survived
  if (text.includes("Analysis of")) {
    text = text.split(/Analysis of/i)[0].trim();
  }

  // Normalize multi-line or redundant spacing into clean flowing prose
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
