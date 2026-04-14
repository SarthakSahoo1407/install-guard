import { getCached, setCache } from "./cache.js";

/**
 * Extracts owner/repo from a repository URL.
 */
function parseRepoUrl(url) {
  if (!url) return null;
  // Handles: git+https://github.com/owner/repo.git, https://github.com/owner/repo, etc.
  const match = url.match(
    /github\.com[/:]([^/]+)\/([^/.#]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function ghFetch(path) {
  const headers = { "User-Agent": "install-guard-cli" };
  // Use token if available to avoid rate limits
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Checks if a given version tag exists on GitHub.
 * Tries both `v1.2.3` and `1.2.3` tag formats.
 */
export async function checkGitHubTag(repoUrl, version) {
  const repo = parseRepoUrl(repoUrl);
  if (!repo) return { hasRepo: false, tagFound: false, recentCommits: false };

  const key = `gh-tag:${repo.owner}/${repo.repo}:${version}`;
  const cached = getCached(key);
  if (cached) return cached;

  // Try v-prefixed and plain tag
  const tags = await ghFetch(`/repos/${repo.owner}/${repo.repo}/tags?per_page=100`);
  if (!tags) {
    const result = { hasRepo: true, tagFound: false, recentCommits: false, error: "rate-limited or private" };
    setCache(key, result);
    return result;
  }

  const tagNames = tags.map((t) => t.name);
  const tagFound = tagNames.includes(`v${version}`) || tagNames.includes(version);

  // Check recent commits
  const commits = await ghFetch(
    `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`
  );
  let recentCommits = false;
  if (commits && commits.length > 0) {
    const lastCommitDate = new Date(commits[0].commit?.committer?.date || 0);
    const daysSinceCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    recentCommits = daysSinceCommit < 90;
  }

  const result = { hasRepo: true, tagFound, recentCommits };
  setCache(key, result);
  return result;
}
