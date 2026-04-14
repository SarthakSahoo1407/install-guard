![npm](https://img.shields.io/npm/v/install-guard)
![downloads](https://img.shields.io/npm/dw/install-guard)
![license](https://img.shields.io/npm/l/install-guard)

# 🚨 Should You Trust That npm Package Before Installing?

**install-guard** is a supply chain security tool that analyzes npm packages for risks **before** you install them. It detects compromised versions, typosquatting, suspicious dependencies, and more.

---

<details>
<summary>📦 See it in action</summary>

```bash
$ npx install-guard install some-random-lib
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 some-random-lib v0.1.3
  A random utility library
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Risk Level: 💀 CRITICAL  (9/10)
  █████████░

──────────────────────────────────────────────────────────

  📊 Package Info

  Downloads (weekly)     120
  Maintainers            unknown-person
  License                Unknown
  Published              6 hours ago
  Dependencies           3
  Total Versions         2
  Repository             ✘ None

──────────────────────────────────────────────────────────

  🔍 Findings

  ✘ Version 0.1.3 was published 6 hours ago
  ✘ Lifecycle scripts found: postinstall
  ✘ New dep "plain-crypto-js" looks like typosquat of "crypto-js"
  ✘ New dep "plain-crypto-js" has very low downloads (12/week)
  ✘ No GitHub tag found for version 0.1.3
  ✘ No license specified
  ⚠ Single maintainer: unknown-person
  ⚠ No recent commits in the last 90 days

──────────────────────────────────────────────────────────

  💡 Recommendation

  ⛔ Avoid installing some-random-lib@0.1.3
  ✔ Safe alternative: some-random-lib@0.1.1
    No install scripts, published > 7 days ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  💀 CRITICAL risk. Are you absolutely sure? (y/n):
```

</details>

---

## 😬 The Problem

Supply chain attacks on npm are increasing:

- Malicious packages are published **daily**
- Popular packages get compromised (e.g., event-stream, ua-parser-js, colors)
- Attackers inject postinstall scripts, add typosquatted dependencies, or hijack maintainer accounts
- `npm audit` only checks **known CVEs** — it can't detect a new attack in progress

You shouldn't have to guess if a package is safe.

---

## 🛡️ The Solution

install-guard runs a **modular detection pipeline** with 8 specialized security checks, GitHub verification, dependency diffing, and a weighted risk scorer — all before a single file is downloaded.

---

## ⚡ Quick Start

Analyze any package:

```bash
npx install-guard axios
```

Analyze a specific version:

```bash
npx install-guard axios@1.14.0
```

Safely install with pre-check:

```bash
npx install-guard install axios
```

Scan your entire project:

```bash
npx install-guard scan
```

Scan with full details per package:

```bash
npx install-guard scan --verbose
```

Get JSON output (for CI/CD):

```bash
npx install-guard axios --json
```

Skip GitHub checks (faster):

```bash
npx install-guard axios --skip-github
```

---

## 🧠 Detection Pipeline

install-guard runs **8 isolated checks** through a security pipeline:

| # | Check | What it detects | Risk Weight |
|---|-------|----------------|-------------|
| 1 | **Recent Publish** | Version published <24h ago, unusual version jumps, rapid publish cadence | +2 to +5 |
| 2 | **Dependency Diff** | New/removed deps between versions, deep analysis of each new dep | +3 to +5 |
| 3 | **Script Analysis** | `preinstall`/`postinstall` hooks, suspicious commands (curl, eval, base64) | +5 |
| 4 | **Typosquatting** | Package name similar to popular packages (Levenshtein distance) | +5 |
| 5 | **Maintainer Analysis** | No maintainers, single maintainer | +1 to +3 |
| 6 | **License Check** | Missing, unknown, or non-permissive licenses | +1 to +3 |
| 7 | **GitHub Verification** | No matching tag/release, no recent commits in repo | +2 to +4 |
| 8 | **Deprecation** | Package flagged as deprecated on npm | +3 |

Results are scored and normalized to **0–10** with labels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

### Dependency Diff Engine

When you check a specific version, install-guard compares its dependencies against the previous version. For each **newly added** dependency, it runs sub-analysis:

- Download count check
- Publish age check
- Typosquatting detection
- Install script detection

This catches the exact pattern used in real supply chain attacks (e.g., injecting a malicious dependency in a patch release).

### Safe Version Recommendation

If a version is flagged as risky, install-guard scans all previous versions and suggests the latest safe one — no install scripts, published more than 7 days ago.

---

## 📊 Example Output

### ✅ Safe package

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 axios v1.15.0
  Promise based HTTP client for the browser and node.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Risk Level: ✅ LOW  (1/10)
  █░░░░░░░░░

  🔍 Findings
  ✔ Published 6 days ago
  ✔ No lifecycle scripts
  ✔ No typosquatting detected
  ✔ License: MIT
  ✔ Not deprecated
  ✔ No dependency changes from previous version
  ✔ GitHub tag found for v1.15.0
  ✔ Repository has recent activity
  ⚠ Single maintainer: jasonsaayman
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🚨 Compromised package (simulated)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 evil-lib v2.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Risk Level: 💀 CRITICAL  (9/10)
  █████████░

  🔍 Findings
  ✘ Version 2.0.0 was published 3 hours ago
  ✘ Lifecycle scripts found: postinstall
  ✘ Script "postinstall" contains suspicious command: curl http://...
  ✘ New dependencies added: plain-crypto-js
  ✘ New dep "plain-crypto-js" looks like typosquat of "crypto-js"
  ✘ New dep "plain-crypto-js" has very low downloads (0/week)
  ✘ No GitHub tag found for version 2.0.0

  💡 Recommendation
  ⛔ Avoid installing evil-lib@2.0.0
  ✔ Safe alternative: evil-lib@1.9.2
    No install scripts, published > 7 days ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 📋 Project scan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 Dependency Scan Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Package              Score     Level
  ────────────────────────────────────────────
  evil-lib             9/10      💀 Critical
  old-utils            5/10      ⚠  Medium
  express              0/10      ✅ Low
  axios                1/10      ✅ Low

──────────────────────────────────────────────────────────
  Total: 4 packages  2 low · 1 medium · 0 high · 1 critical
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏗️ Architecture

```
src/
├── checks/               # Isolated security checks
│   ├── recentPublish.js  # Publish timing analysis
│   ├── dependencyDiff.js # Version-to-version dep comparison
│   ├── scripts.js        # Lifecycle script detection
│   ├── typosquat.js      # Name similarity analysis
│   ├── maintainers.js    # Maintainer signals
│   ├── license.js        # License validation
│   ├── githubVerify.js   # GitHub tag/release verification
│   └── deprecation.js    # Deprecation detection
├── services/
│   ├── pipeline.js       # Orchestrates all checks
│   └── scorer.js         # Weighted risk scoring
├── utils/
│   ├── registry.js       # npm registry API + caching
│   ├── github.js         # GitHub API integration
│   └── cache.js          # File-based cache (15min TTL)
├── format.js             # CLI output formatter
├── scan.js               # Project-wide scanner
├── install.js            # Safe install with prompts
└── index.js              # Entry point
```

Each check is **fully isolated** — returns a standardized `{ id, findings[] }` structure. The pipeline runs sync checks immediately and async checks (GitHub, dependency deep-analysis) in parallel.

---

## ✨ Features

- 🔍 **8 security checks** — modular detection pipeline
- 🔄 **Dependency diff engine** — compares deps between versions
- 🧠 **Typosquatting detection** — Levenshtein distance against 80+ popular packages
- 🏷️ **GitHub verification** — checks for matching tags and recent activity
- ⚠ **Script analysis** — detects dangerous commands in lifecycle scripts
- 💡 **Safe version suggestions** — recommends the latest clean version
- 📊 **Weighted risk scoring** — 0–10 with LOW/MEDIUM/HIGH/CRITICAL labels
- 🛑 **Install blocking** — prompts before installing risky packages
- 📋 **Project scan** — audit all deps with summary table
- 🗄️ **File-based caching** — avoids redundant API calls (15min TTL)
- 📤 **JSON output** — pipe results into CI/CD pipelines
- ⚡ **Zero config** — works with `npx`, no setup required

---

## 🤔 Why not npm audit?

| Feature                    | npm audit | install-guard |
|----------------------------|-----------|---------------|
| Known CVE vulnerabilities  | ✅        | —             |
| Supply chain attack detection | ❌     | ✅            |
| Pre-install analysis       | ❌        | ✅            |
| Dependency diff            | ❌        | ✅            |
| Typosquatting detection    | ❌        | ✅            |
| Script analysis            | ❌        | ✅            |
| GitHub verification        | ❌        | ✅            |
| Install blocking           | ❌        | ✅            |
| Safe version suggestions   | ❌        | ✅            |
| JSON output for CI         | ✅        | ✅            |

**Use both together** — `npm audit` for known vulnerabilities, `install-guard` for everything else.

---

## 📦 Install globally

```bash
npm install -g install-guard
```

---

## 🔮 Roadmap

- 📊 Dependency tree visualization
- 🔌 CI/CD integration (exit codes for pipelines)
- 🏷️ `.install-guardrc` config for custom risk thresholds
- 📝 HTML/CSV report export
- 🧠 Advanced typosquatting (permutations, homoglyphs, scope confusion)
- 🔔 Webhook notifications for risky dependencies

---

## 🤝 Contributing

PRs welcome! Let's make npm safer together.

---

## ⭐ Support

If you find this useful, consider giving it a star ⭐
It helps others discover the project!
