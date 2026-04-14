import { buildContext } from "../utils/registry.js";
import {
  checkRecentPublish,
  checkDependencyDiff,
  checkScripts,
  checkTyposquat,
  checkMaintainers,
  checkLicense,
  checkGithubVerify,
  checkDeprecation,
} from "../checks/index.js";
import { computeScore } from "./scorer.js";

/**
 * Runs the full detection pipeline on a package+version.
 * Returns structured results consumable by CLI or JSON output.
 */
export async function runPipeline(packageName, version, opts = {}) {
  const ctx = await buildContext(packageName, version);

  // Run sync checks immediately
  const syncResults = [
    checkRecentPublish(ctx),
    checkScripts(ctx),
    checkTyposquat(ctx),
    checkMaintainers(ctx),
    checkLicense(ctx),
    checkDeprecation(ctx),
  ];

  // Run async checks in parallel
  const asyncChecks = [checkDependencyDiff(ctx)];

  if (!opts.skipGithub) {
    asyncChecks.push(checkGithubVerify(ctx));
  }

  const asyncResults = await Promise.all(asyncChecks);
  const allChecks = [...syncResults, ...asyncResults];

  const { score, label, findings } = computeScore(allChecks);

  // Find a safe version recommendation
  const safeVersion = findSafeVersion(ctx, score);

  return {
    package: ctx.name,
    version: ctx.version,
    previousVersion: ctx.previousVersion,
    description: ctx.description,
    downloads: ctx.downloads,
    maintainers: ctx.currentMaintainers.map((m) => m.name || m.email),
    license: ctx.license,
    publishedAt: ctx.publishedAt,
    repository: ctx.repository,
    deprecated: ctx.deprecated,
    totalVersions: ctx.totalVersions,
    dependencyCount: Object.keys(ctx.dependencies).length,

    score,
    label,
    findings,
    checks: allChecks,

    recommendation: safeVersion,
  };
}

/**
 * Suggests the latest safe version — one that is older, with no install scripts,
 * and published more than 7 days ago.
 */
function findSafeVersion(ctx, currentScore) {
  if (currentScore <= 3) return null; // current version is fine

  const registry = ctx._registry;
  const timeData = registry.time || {};
  const versions = ctx.allVersions.slice().reverse(); // newest first
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const v of versions) {
    if (v === ctx.version) continue;

    const vData = registry.versions[v];
    if (!vData) continue;
    if (vData.deprecated) continue;
    if (
      vData.scripts?.postinstall ||
      vData.scripts?.preinstall ||
      vData.scripts?.install
    )
      continue;

    const publishTime = new Date(timeData[v] || 0).getTime();
    if (publishTime > sevenDaysAgo) continue;

    return {
      version: v,
      publishedAt: timeData[v],
      reason: "No install scripts, published > 7 days ago",
    };
  }

  return null;
}
