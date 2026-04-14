/**
 * Weighted risk scorer.
 * Takes raw check results and computes a normalized 0-10 score with label.
 */

// Max raw score (theoretical) — used to normalize
const MAX_RAW = 50;

export function computeScore(checkResults) {
  let rawScore = 0;
  const allFindings = [];
  let hasCritical = false;

  for (const check of checkResults) {
    for (const f of check.findings) {
      allFindings.push({ ...f, checkId: check.id });
      rawScore += f.score;
      if (f.severity === "critical") hasCritical = true;
    }
  }

  // Normalize to 0-10
  let score = Math.round((rawScore / MAX_RAW) * 10);
  score = Math.max(0, Math.min(10, score));

  // Critical findings floor at 7
  if (hasCritical && score < 7) score = 7;

  let label;
  if (score <= 2) label = "LOW";
  else if (score <= 5) label = "MEDIUM";
  else if (score <= 7) label = "HIGH";
  else label = "CRITICAL";

  return { score, label, rawScore, findings: allFindings };
}
