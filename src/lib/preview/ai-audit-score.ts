export type AiVisibilityBand = "Critical / Low" | "Weak / At Risk" | "Moderate / Needs Boost";

export function computeAiVisibilityScore(seed: string): {
  score: number;
  band: AiVisibilityBand;
} {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const score = 7 + (hash % 18);

  let band: AiVisibilityBand = "Moderate / Needs Boost";
  if (score <= 12) {
    band = "Critical / Low";
  } else if (score <= 18) {
    band = "Weak / At Risk";
  }

  return { score, band };
}

export const AI_AUDIT_STATUS_ITEMS = [
  {
    icon: "❌" as const,
    text: "ChatGPT: UAE competitors recommended ahead of your business",
  },
  {
    icon: "❌" as const,
    text: "Gemini: Missing from Dubai & Abu Dhabi local knowledge graph",
  },
  {
    icon: "⚠️" as const,
    text: "Claude: Incomplete citation coverage across UAE emirates",
  },
] as const;
