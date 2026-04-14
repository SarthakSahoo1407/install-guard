/**
 * Detects lifecycle scripts that are common attack vectors.
 */
export function checkScripts(ctx) {
  const findings = [];
  const scripts = ctx.scripts || {};

  const dangerous = ["preinstall", "install", "postinstall"];
  const found = dangerous.filter((s) => scripts[s]);

  if (found.length > 0) {
    findings.push({
      severity: "critical",
      message: `Lifecycle scripts found: ${found.join(", ")}`,
      score: 5,
    });

    // Inspect script content for red flags
    for (const name of found) {
      const cmd = scripts[name];
      if (
        cmd.includes("curl ") ||
        cmd.includes("wget ") ||
        cmd.includes("eval(") ||
        cmd.includes("base64") ||
        cmd.includes("exec(") ||
        cmd.includes("child_process")
      ) {
        findings.push({
          severity: "critical",
          message: `Script "${name}" contains suspicious command: ${cmd.slice(0, 80)}`,
          score: 5,
        });
      }
    }
  } else {
    findings.push({
      severity: "info",
      message: "No lifecycle scripts",
      score: 0,
    });
  }

  return { id: "scripts", findings };
}
