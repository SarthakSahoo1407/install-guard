const PERMISSIVE = [
  "MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "Unlicense",
  "CC0-1.0", "BlueOak-1.0.0",
];

/**
 * Checks license status.
 */
export function checkLicense(ctx) {
  const findings = [];
  const raw = ctx.license;
  const license = typeof raw === "string" ? raw : raw?.type || "Unknown";

  if (license === "Unknown" || license === "UNLICENSED") {
    findings.push({
      severity: "high",
      message: "No license specified",
      score: 3,
    });
  } else if (PERMISSIVE.includes(license)) {
    findings.push({
      severity: "info",
      message: `License: ${license}`,
      score: 0,
    });
  } else {
    findings.push({
      severity: "medium",
      message: `Non-standard license: ${license}`,
      score: 1,
    });
  }

  return { id: "license", findings };
}
