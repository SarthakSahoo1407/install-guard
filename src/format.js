import chalk from "chalk";

const W = 58;
const SEPARATOR = chalk.gray("━".repeat(W));
const THIN_SEP = chalk.gray("─".repeat(W));

function riskBar(score) {
  const filled = score;
  const empty = 10 - score;
  const color =
    score <= 2 ? chalk.green : score <= 5 ? chalk.yellow : score <= 7 ? chalk.red : chalk.redBright;
  return color("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

function riskLabel(label) {
  switch (label) {
    case "LOW":
      return chalk.green.bold("✅ LOW");
    case "MEDIUM":
      return chalk.yellow.bold("⚠  MEDIUM");
    case "HIGH":
      return chalk.red.bold("🚨 HIGH");
    case "CRITICAL":
      return chalk.redBright.bold("💀 CRITICAL");
    default:
      return label;
  }
}

function severityIcon(severity) {
  switch (severity) {
    case "critical":
      return chalk.redBright("✘");
    case "high":
      return chalk.red("✘");
    case "medium":
      return chalk.yellow("⚠");
    case "info":
      return chalk.green("✔");
    default:
      return chalk.gray("·");
  }
}

function severityColor(severity) {
  switch (severity) {
    case "critical":
      return chalk.redBright;
    case "high":
      return chalk.red;
    case "medium":
      return chalk.yellow;
    case "info":
      return chalk.green;
    default:
      return chalk.white;
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour(s) ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month(s) ago`;
  const years = Math.floor(days / 365);
  return `${years} year(s) ago`;
}

/**
 * Formats the full pipeline result for CLI display.
 */
export function formatPipelineResult(result) {
  const lines = [];

  lines.push("");
  lines.push(SEPARATOR);
  lines.push(
    chalk.bold(`  📦 ${result.package} `) + chalk.gray(`v${result.version}`)
  );
  if (result.description) {
    lines.push(chalk.gray(`  ${result.description.slice(0, W - 4)}`));
  }
  lines.push(SEPARATOR);

  // ── Risk Score ──────────────────────────────
  lines.push("");
  lines.push(
    `  Risk Level: ${riskLabel(result.label)}  ${chalk.bold(`(${result.score}/10)`)}`
  );
  lines.push(`  ${riskBar(result.score)}`);

  lines.push("");
  lines.push(THIN_SEP);

  // ── Package Info ────────────────────────────
  lines.push("");
  lines.push(chalk.bold("  📊 Package Info"));
  lines.push("");

  const info = [
    ["Downloads (weekly)", result.downloads.toLocaleString()],
    ["Maintainers", result.maintainers.join(", ") || "None"],
    ["License", typeof result.license === "string" ? result.license : result.license?.type || "Unknown"],
    ["Published", timeAgo(result.publishedAt)],
    ["Dependencies", String(result.dependencyCount)],
    ["Total Versions", String(result.totalVersions)],
    ["Repository", result.repository ? "✔" : "✘ None"],
  ];

  for (const [label, value] of info) {
    lines.push(`  ${chalk.gray(label.padEnd(22))} ${chalk.white(value)}`);
  }

  if (result.deprecated) {
    lines.push("");
    lines.push(
      chalk.red.bold(
        `  ⚠ DEPRECATED: ${typeof result.deprecated === "string" ? result.deprecated : "This package is deprecated"}`
      )
    );
  }

  lines.push("");
  lines.push(THIN_SEP);

  // ── Findings ────────────────────────────────
  lines.push("");
  lines.push(chalk.bold("  🔍 Findings"));
  lines.push("");

  // Group by severity
  const critical = result.findings.filter((f) => f.severity === "critical");
  const high = result.findings.filter((f) => f.severity === "high");
  const medium = result.findings.filter((f) => f.severity === "medium");
  const info2 = result.findings.filter((f) => f.severity === "info");

  for (const group of [critical, high, medium, info2]) {
    for (const f of group) {
      const icon = severityIcon(f.severity);
      const color = severityColor(f.severity);
      lines.push(`  ${icon} ${color(f.message)}`);
    }
  }

  // ── Recommendation ──────────────────────────
  if (result.recommendation) {
    lines.push("");
    lines.push(THIN_SEP);
    lines.push("");
    lines.push(chalk.bold("  💡 Recommendation"));
    lines.push("");
    if (result.label === "CRITICAL" || result.label === "HIGH") {
      lines.push(chalk.red(`  ⛔ Avoid installing ${result.package}@${result.version}`));
    }
    lines.push(
      chalk.green(
        `  ✔ Safe alternative: ${result.package}@${chalk.bold(result.recommendation.version)}`
      )
    );
    lines.push(
      chalk.gray(`    ${result.recommendation.reason}`)
    );
  } else if (result.label === "CRITICAL" || result.label === "HIGH") {
    lines.push("");
    lines.push(THIN_SEP);
    lines.push("");
    lines.push(chalk.bold("  💡 Recommendation"));
    lines.push("");
    lines.push(chalk.red(`  ⛔ Avoid installing this version`));
    lines.push(chalk.gray("    No safe alternative version found"));
  }

  lines.push("");
  lines.push(SEPARATOR);
  lines.push("");

  return lines.join("\n");
}

/**
 * Formats a summary table for scan results.
 */
export function formatScanSummary(results) {
  const lines = [];

  results.sort((a, b) => b.score - a.score);

  lines.push("");
  lines.push(SEPARATOR);
  lines.push(chalk.bold("  📋 Dependency Scan Summary"));
  lines.push(SEPARATOR);
  lines.push("");

  const nameWidth = Math.max(20, ...results.map((r) => r.package.length + 2));

  lines.push(
    chalk.gray(
      "  " +
        "Package".padEnd(nameWidth) +
        "Score".padEnd(10) +
        "Level"
    )
  );
  lines.push(chalk.gray("  " + "─".repeat(nameWidth + 24)));

  for (const r of results) {
    const name = r.package.padEnd(nameWidth);
    const score = `${r.score}/10`.padEnd(10);
    let level;
    switch (r.label) {
      case "LOW":
        level = chalk.green("✅ Low");
        break;
      case "MEDIUM":
        level = chalk.yellow("⚠  Medium");
        break;
      case "HIGH":
        level = chalk.red("🚨 High");
        break;
      case "CRITICAL":
        level = chalk.redBright("💀 Critical");
        break;
    }

    const colorFn =
      r.label === "CRITICAL" || r.label === "HIGH"
        ? chalk.red
        : r.label === "MEDIUM"
          ? chalk.yellow
          : chalk.white;
    lines.push(`  ${colorFn(name)}${score}${level}`);
  }

  lines.push("");
  lines.push(THIN_SEP);

  const low = results.filter((r) => r.label === "LOW").length;
  const med = results.filter((r) => r.label === "MEDIUM").length;
  const high = results.filter((r) => r.label === "HIGH").length;
  const crit = results.filter((r) => r.label === "CRITICAL").length;

  lines.push(
    `  ${chalk.bold("Total:")} ${results.length} packages  ` +
    `${chalk.green(`${low} low`)} · ${chalk.yellow(`${med} medium`)} · ` +
    `${chalk.red(`${high} high`)} · ${chalk.redBright(`${crit} critical`)}`
  );
  lines.push("");
  lines.push(SEPARATOR);
  lines.push("");

  return lines.join("\n");
}
