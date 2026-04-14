/**
 * Detects recently published versions.
 * Supply chain attacks often use hot-off-the-press publishes.
 */
export function checkRecentPublish(ctx) {
  const findings = [];

  if (!ctx.publishedAt) {
    return { id: "recent-publish", findings };
  }

  const hoursAgo = (Date.now() - new Date(ctx.publishedAt).getTime()) / (1000 * 60 * 60);
  const daysAgo = hoursAgo / 24;

  if (hoursAgo < 24) {
    findings.push({
      severity: "critical",
      message: `Version ${ctx.version} was published ${Math.round(hoursAgo)} hours ago`,
      score: 5,
    });
  } else if (daysAgo < 7) {
    findings.push({
      severity: "high",
      message: `Version ${ctx.version} was published ${Math.round(daysAgo)} days ago`,
      score: 2,
    });
  } else {
    findings.push({
      severity: "info",
      message: `Published ${Math.round(daysAgo)} days ago`,
      score: 0,
    });
  }

  // Check for unusual version jumps
  if (ctx.previousVersion && ctx.version) {
    const cur = ctx.version.split(".").map(Number);
    const prev = ctx.previousVersion.split(".").map(Number);

    if (cur.length === 3 && prev.length === 3) {
      const majorJump = cur[0] - prev[0];
      const minorJump = cur[1] - prev[1];

      if (majorJump > 1 || (majorJump === 0 && minorJump > 5)) {
        findings.push({
          severity: "high",
          message: `Unusual version jump: ${ctx.previousVersion} → ${ctx.version}`,
          score: 3,
        });
      }
    }
  }

  // Rapid publish cadence — multiple versions in 24h is suspicious
  if (ctx.publishedAt && ctx.previousPublishedAt) {
    const gap =
      new Date(ctx.publishedAt).getTime() -
      new Date(ctx.previousPublishedAt).getTime();
    const gapHours = gap / (1000 * 60 * 60);
    if (gapHours > 0 && gapHours < 2) {
      findings.push({
        severity: "high",
        message: `Two versions published within ${Math.round(gapHours * 60)} minutes`,
        score: 3,
      });
    }
  }

  return { id: "recent-publish", findings };
}
