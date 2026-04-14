![npm](https://img.shields.io/npm/v/install-guard)
![downloads](https://img.shields.io/npm/dw/install-guard)
![license](https://img.shields.io/npm/l/install-guard)

# 🚨 Should You Trust That npm Package Before Installing?

**install-guard** analyzes npm packages for security risks and tells you if they're safe — **before** you install them.

---

<details>
<summary>📦 See it in action</summary>

```bash
$ npx install-guard install some-random-lib
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 some-random-lib v0.1.3
  A random utility library
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Risk Score: 8/10  🚨 High Risk
  ████████░░

─────────────────────────────────────────────────

  📊 Package Info

  Downloads (weekly)    120
  Maintainers           1
  License               Unknown
  Last Published        3 days ago
  Dependencies          14
  Versions              2

─────────────────────────────────────────────────

  🔍 Security Checks

  ✘ Downloads:        Very low (120/week)
  ✔ Last Updated:     Recently updated
  ✘ Install Scripts:  Has install/postinstall scripts
  ⚠ Maintainers:      Single maintainer
  ✘ License:          No license specified
  ⚠ Repository:       No repository URL
  ✘ Package Age:      Published less than 30 days ago
  ✔ Dependencies:     14 direct dependencies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠ High risk package. Continue install? (y/n):
```

</details>

---

## 😬 The Problem

Installing npm packages blindly is risky.

- Malicious packages are published **daily**
- Popular packages get compromised
- `npm audit` only checks known vulnerabilities — **not trust**

You shouldn't have to guess if a package is safe.

---

## 🛡️ The Solution

install-guard gives you a **risk score before you install anything**, powered by 10+ security checks.

---

## ⚡ Quick Start

Analyze a package:

```bash
npx install-guard axios
```

Safely install with a risk check:

```bash
npx install-guard install axios
```

Scan your entire project:

```bash
npx install-guard scan
```

Scan with detailed output per package:

```bash
npx install-guard scan --verbose
```

---

## 🧠 How Risk Score Works

install-guard runs **10+ security checks** on every package:

| Check | What it detects |
|-------|----------------|
| 📉 **Downloads** | Low popularity = higher risk |
| 🕒 **Last Updated** | Abandoned packages |
| ⚠ **Install Scripts** | `preinstall` / `postinstall` hooks (common attack vector) |
| 👥 **Maintainers** | Single or no maintainers |
| 📜 **License** | Missing or non-permissive licenses |
| 🔗 **Repository** | No source code link |
| 📅 **Package Age** | Brand new packages (< 30 days) |
| 📦 **Dependencies** | High dependency count |
| 🚫 **Deprecated** | Flagged as deprecated on npm |
| 🧠 **Typosquatting** | Names suspiciously similar to popular packages |

Each factor contributes to a **risk score (0–10)**. Lower = safer.

---

## 📊 Example Results

### ✅ Safe package

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 axios v1.7.2

  Risk Score: 1/10  ✅ Low Risk
  █░░░░░░░░░

  🔍 Security Checks
  ✔ Downloads:       44,392,817/week
  ✔ Last Updated:    Recently updated
  ✔ Install Scripts: No install scripts
  ✔ Maintainers:     3 maintainers
  ✔ License:         MIT
  ✔ Repository:      Has repository link
  ✔ Package Age:     9+ year(s) old
  ✔ Dependencies:    8 direct dependencies
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🚨 Risky package

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 some-lib v0.1.0

  Risk Score: 8/10  🚨 High Risk
  ████████░░

  🔍 Security Checks
  ✘ Downloads:       Very low (83/week)
  ✘ Install Scripts: Has install/postinstall scripts
  ✘ License:         No license specified
  ⚠ Maintainers:     Single maintainer
  ⚠ Repository:      No repository URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 📋 Project scan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 Dependency Scan Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Package              Risk        Status
  ────────────────────────────────────────────
  some-lib             8/10        🚨 High Risk
  old-utils            5/10        ⚠  Medium
  express              0/10        ✅ Safe
  axios                1/10        ✅ Safe

─────────────────────────────────────────────────
  Summary: 2 safe · 1 medium · 1 high risk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✨ Features

- 🔍 **Deep analysis** — 10+ security checks per package
- 🧠 **Typosquatting detection** — catches lookalike package names
- ⚠ **Risk scoring (0–10)** — instant safety assessment
- 🛑 **Block risky installs** — prompts before installing medium/high risk packages
- 📋 **Project-wide scan** — audit all dependencies in one command
- 📊 **Summary table** — sorted by risk with safe/medium/high breakdown
- ⚡ **Zero setup** — works instantly with `npx`
- 🎨 **Beautiful CLI output** — color-coded, easy to read

---

## 🤔 Why not npm audit?

| Feature               | npm audit | install-guard |
|-----------------------|-----------|---------------|
| Known vulnerabilities | ✅        | ✅            |
| Trust analysis        | ❌        | ✅            |
| Pre-install check     | ❌        | ✅            |
| Install blocking      | ❌        | ✅            |
| Typosquatting check   | ❌        | ✅            |
| License analysis      | ❌        | ✅            |
| Maintainer check      | ❌        | ✅            |
| Package age check     | ❌        | ✅            |

---

## 📦 Install globally

```bash
npm install -g install-guard
```

---

## 🔮 Roadmap

- 🔍 GitHub activity analysis
- 🧠 Advanced typosquatting (permutations, homoglyphs)
- 📊 Dependency tree visualization
- 🔌 CI/CD integration (exit codes for pipelines)
- 🏷️ `.install-guardrc` config for custom thresholds
- 📝 JSON/CSV report export

---

## 🤝 Contributing

PRs welcome! Let's make npm safer together.

---

## ⭐ Support

If you find this useful, consider giving it a star ⭐
It helps others discover the project!

---

## 🤝 Contributing

PRs welcome! Let's make npm safer together.

---

## ⭐ Support

If you find this useful, consider giving it a star ⭐  
It helps others discover the project!
