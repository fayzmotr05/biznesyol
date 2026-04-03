/**
 * Extract and parse JSON from AI response text.
 * Handles common issues: trailing commas, markdown fences, broken strings.
 */
export function parseAIJson(text: string): unknown {
  // Strip markdown code fences
  let clean = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find the outermost JSON object
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  let jsonStr = clean.slice(start, end + 1);

  // Fix trailing commas before } or ]
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

  // Fix single quotes used as string delimiters (rare but happens)
  // Only do this if standard parse fails
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try more aggressive cleanup
  }

  // Remove control characters that break JSON
  jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (ch) =>
    ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
  );

  // Fix unescaped newlines inside strings
  jsonStr = jsonStr.replace(
    /"([^"]*?)"/g,
    (match) => match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
  );

  // Remove trailing commas again after cleanup
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Last resort: try to fix common number formatting issues
    // e.g., "estimated_startup_mln": 2,5 → "estimated_startup_mln": 2.5
    jsonStr = jsonStr.replace(
      /:\s*(\d+),(\d+)\s*([,}\]])/g,
      ": $1.$2$3"
    );

    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }
}
