import { checkGitHubTag } from "../utils/github.js";

/**
 * Verifies the published version against GitHub releases/tags.
 */
export async function checkGithubVerify(ctx) {
  const findings = [];

  if (!ctx.repository) {
    findings.push({
      severity: "high",
      message: "No repository URL in package metadata",
      score: 4,
    });
    return { id: "github-verify", findings };
  }

  if (!ctx.repository.includes("github.com")) {
    findings.push({
      severity: "medium",
      message: "Repository is not on GitHub — cannot verify tags",
      score: 1,
    });
    return { id: "github-verify", findings };
  }

  const result = await checkGitHubTag(ctx.repository, ctx.version);

  if (result.error) {
    findings.push({
      severity: "medium",
      message: `GitHub API: ${result.error}`,
      score: 1,
    });
    return { id: "github-verify", findings };
  }

  if (!result.tagFound) {
    findings.push({
      severity: "high",
      message: `No GitHub tag found for version ${ctx.version}`,
      score: 4,
    });
  } else {
    findings.push({
      severity: "info",
      message: `GitHub tag found for v${ctx.version}`,
      score: 0,
    });
  }

  if (!result.recentCommits) {
    findings.push({
      severity: "medium",
      message: "No recent commits in the last 90 days",
      score: 2,
    });
  } else {
    findings.push({
      severity: "info",
      message: "Repository has recent activity",
      score: 0,
    });
  }

  return { id: "github-verify", findings };
}
