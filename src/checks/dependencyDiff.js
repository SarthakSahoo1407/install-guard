import { getDownloads, getRegistryData } from "../utils/registry.js";
import { checkTyposquatName } from "./typosquat.js";

/**
 * Compares dependencies between the current and previous version.
 * Flags newly added dependencies and analyzes them for suspiciousness.
 */
export async function checkDependencyDiff(ctx) {
  const findings = [];

  const current = ctx.dependencies;
  const previous = ctx.previousDependencies;

  const added = Object.keys(current).filter((d) => !(d in previous));
  const removed = Object.keys(previous).filter((d) => !(d in current));

  if (added.length === 0 && removed.length === 0) {
    findings.push({
      severity: "info",
      message: "No dependency changes from previous version",
      score: 0,
    });
    return { id: "dependency-diff", findings };
  }

  if (removed.length > 0) {
    findings.push({
      severity: "info",
      message: `Removed dependencies: ${removed.join(", ")}`,
      score: 0,
    });
  }

  if (added.length > 0) {
    findings.push({
      severity: "high",
      message: `New dependencies added: ${added.join(", ")}`,
      score: 3,
    });

    // Deep-analyze each newly added dependency
    for (const dep of added) {
      const subFindings = await analyzeSuspiciousDep(dep);
      findings.push(...subFindings);
    }
  }

  return { id: "dependency-diff", findings };
}

async function analyzeSuspiciousDep(name) {
  const findings = [];

  // Typosquatting check
  const typo = checkTyposquatName(name);
  if (typo) {
    findings.push({
      severity: "critical",
      message: `New dep "${name}" looks like typosquat of "${typo}"`,
      score: 5,
    });
  }

  try {
    const registry = await getRegistryData(name);
    const downloads = await getDownloads(name);
    const latest = registry["dist-tags"]?.latest;
    const publishTime = registry.time?.[latest];

    // Low downloads
    if (downloads.downloads < 500) {
      findings.push({
        severity: "high",
        message: `New dep "${name}" has very low downloads (${downloads.downloads}/week)`,
        score: 4,
      });
    }

    // Very new package
    if (publishTime) {
      const ageDays =
        (Date.now() - new Date(publishTime).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 30) {
        findings.push({
          severity: "high",
          message: `New dep "${name}" is less than 30 days old`,
          score: 4,
        });
      }
    }

    // Has install scripts
    const versionData = registry.versions?.[latest];
    if (
      versionData?.scripts?.postinstall ||
      versionData?.scripts?.preinstall ||
      versionData?.scripts?.install
    ) {
      findings.push({
        severity: "critical",
        message: `New dep "${name}" has install scripts`,
        score: 5,
      });
    }
  } catch {
    findings.push({
      severity: "high",
      message: `New dep "${name}" could not be resolved on npm`,
      score: 4,
    });
  }

  return findings;
}
