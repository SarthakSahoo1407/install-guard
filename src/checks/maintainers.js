/**
 * Analyzes maintainer signals.
 */
export function checkMaintainers(ctx) {
  const findings = [];
  const maintainers = ctx.currentMaintainers || [];
  const count = maintainers.length;

  if (count === 0) {
    findings.push({
      severity: "high",
      message: "No maintainers listed",
      score: 3,
    });
  } else if (count === 1) {
    findings.push({
      severity: "medium",
      message: `Single maintainer: ${maintainers[0].name || maintainers[0].email || "unknown"}`,
      score: 1,
    });
  } else {
    findings.push({
      severity: "info",
      message: `${count} maintainers`,
      score: 0,
    });
  }

  return { id: "maintainers", findings };
}
