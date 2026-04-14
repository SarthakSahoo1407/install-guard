import chalk from "chalk";

const SEPARATOR = chalk.gray("━".repeat(50));
const THIN_SEP = chalk.gray("─".repeat(50));

function riskBar(score) {
  const filled = score;
  const empty = 10 - score;
  const color =
    score <= 3 ? chalk.green : score <= 6 ? chalk.yellow : chalk.red;
  return color("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

function riskLabel(level) {
  switch (level) {
    case "low":
      return chalk.green.bold("✅ Low Risk");
    case "medium":
      return chalk.yellow.bold("⚠  Medium Risk");
    case "high":
      return chalk.red.bold("🚨 High Risk");
  }
}

function checkIcon(status) {
  switch (status) {
    case "pass":
      return chalk.green("✔");
    case "warn":
      return chalk.yellow("⚠");
    case "fail":
      return chalk.red("✘");
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  if (years === 1) return "1 year ago";
  return `${years} years ago`;
}

export function formatAnalysis(data, result) {
  const lines = [];

  lines.push("");
  lines.push(SEPARATOR);
  lines.push(
    chalk.bold(`  📦 ${data.name} `) + chalk.gray(`v${data.version}`)
  );
  if (data.description) {
    lines.push(chalk.gray(`  ${data.description.slice(0, 70)}`));
  }
  lines.push(SEPARATOR);

  // Risk score
  lines.push("");
  lines.push(
    `  Risk Score: ${chalk.bold(`${result.score}/10`)}  ${riskLabel(result.level)}`
  );
  lines.push(`  ${riskBar(result.score)}`);

  lines.push("");
  lines.push(THIN_SEP);

  // Package info
  lines.push("");
  lines.push(chalk.bold("  📊 Package Info"));
  lines.push("");

  const info = [
    ["Downloads (weekly)", data.downloads.toLocaleString()],
    ["Maintainers", String(data.maintainers.length)],
    [
      "License",
      typeof data.license === "string"
        ? data.license
        : data.license?.type || "Unknown",
    ],
    ["Last Published", timeAgo(data.lastPublished)],
    ["Dependencies", String(data.dependencies)],
    ["Versions", String(data.totalVersions)],
  ];

  for (const [label, value] of info) {
    lines.push(
      `  ${chalk.gray(label.padEnd(22))} ${chalk.white(value)}`
    );
  }

  if (data.deprecated) {
    lines.push("");
    lines.push(
      chalk.red.bold(
        `  ⚠ DEPRECATED: ${typeof data.deprecated === "string" ? data.deprecated : "This package is deprecated"}`
      )
    );
  }

  lines.push("");
  lines.push(THIN_SEP);

  // Security checks
  lines.push("");
  lines.push(chalk.bold("  🔍 Security Checks"));
  lines.push("");

  for (const check of result.checks) {
    const icon = checkIcon(check.status);
    const detail =
      check.status === "pass"
        ? chalk.green(check.detail)
        : check.status === "warn"
          ? chalk.yellow(check.detail)
          : chalk.red(check.detail);
    lines.push(`  ${icon} ${chalk.gray(check.label + ":")} ${detail}`);
  }

  lines.push("");
  lines.push(SEPARATOR);
  lines.push("");

  return lines.join("\n");
}

export function formatScanSummary(results) {
  const lines = [];

  results.sort((a, b) => b.result.score - a.result.score);

  lines.push("");
  lines.push(SEPARATOR);
  lines.push(chalk.bold("  📋 Dependency Scan Summary"));
  lines.push(SEPARATOR);
  lines.push("");

  const nameWidth = Math.max(
    20,
    ...results.map((r) => r.data.name.length + 2)
  );

  lines.push(
    chalk.gray(
      "  " +
        "Package".padEnd(nameWidth) +
        "Risk".padEnd(12) +
        "Status"
    )
  );
  lines.push(chalk.gray("  " + "─".repeat(nameWidth + 26)));

  for (const { data, result } of results) {
    const name = data.name.padEnd(nameWidth);
    const risk = `${result.score}/10`.padEnd(12);
    let status;
    switch (result.level) {
      case "low":
        status = chalk.green("✅ Safe");
        break;
      case "medium":
        status = chalk.yellow("⚠  Medium");
        break;
      case "high":
        status = chalk.red("🚨 High Risk");
        break;
    }

    const colorFn =
      result.level === "high"
        ? chalk.red
        : result.level === "medium"
          ? chalk.yellow
          : chalk.white;
    lines.push(`  ${colorFn(name)}${risk}${status}`);
  }

  lines.push("");
  lines.push(THIN_SEP);

  const safe = results.filter((r) => r.result.level === "low").length;
  const medium = results.filter(
    (r) => r.result.level === "medium"
  ).length;
  const high = results.filter((r) => r.result.level === "high").length;

  lines.push(
    `  ${chalk.bold("Summary:")} ${chalk.green(`${safe} safe`)} · ${chalk.yellow(`${medium} medium`)} · ${chalk.red(`${high} high risk`)}`
  );
  lines.push("");
  lines.push(SEPARATOR);
  lines.push("");

  return lines.join("\n");
}
