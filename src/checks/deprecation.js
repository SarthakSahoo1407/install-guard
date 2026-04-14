/**
 * Checks for deprecation.
 */
export function checkDeprecation(ctx) {
  const findings = [];

  if (ctx.deprecated) {
    findings.push({
      severity: "high",
      message: typeof ctx.deprecated === "string"
        ? `Deprecated: ${ctx.deprecated}`
        : "Package is deprecated",
      score: 3,
    });
  } else {
    findings.push({
      severity: "info",
      message: "Not deprecated",
      score: 0,
    });
  }

  return { id: "deprecation", findings };
}
