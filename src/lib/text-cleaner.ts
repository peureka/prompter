/**
 * Clean pasted text: normalize quotes, whitespace, and punctuation.
 * Never changes words — only hygiene.
 */
export function cleanText(raw: string): string {
  let text = raw;

  // Smart quotes → straight quotes
  text = text.replace(/[\u2018\u2019\u201A]/g, "'");
  text = text.replace(/[\u201C\u201D\u201E]/g, '"');

  // Em/en dashes → regular dash
  text = text.replace(/[\u2013\u2014]/g, "—");

  // Remove zero-width characters
  text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

  // Collapse multiple spaces (but not newlines) to single space
  text = text.replace(/[^\S\n]+/g, " ");

  // Collapse 3+ consecutive newlines to 2
  text = text.replace(/\n{3,}/g, "\n\n");

  // Fix double periods
  text = text.replace(/\.{2}(?!\.)/g, ".");

  // Add space after period/comma/colon/semicolon if missing (but not in numbers like 3.14)
  text = text.replace(/([.,:;!?])([A-Za-z])/g, "$1 $2");

  // Trim each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // Trim overall
  text = text.trim();

  return text;
}
