# 🚨 Should You Trust That npm Package Before Installing?

**install-guard** analyzes npm packages and tells you if they are safe to install — before you install them.

---

<details>
<summary>Example</summary>

```bash
npx install-guard install some-random-lib
```

```
📦 Analyzing some-random-lib...

Downloads (weekly): 120
Risk Score: 8/10 🚨 High Risk

⚠ Very low downloads
⚠ Uses install scripts
⚠ Recently published

❓ Do you still want to install this package? (y/n)
```

</details>

---

## 😬 The Problem

Installing npm packages blindly is risky.

- Malicious packages are published daily
- Popular packages get compromised
- `npm audit` only checks known vulnerabilities — not trust

You shouldn't have to guess if a package is safe.

---

## 🛡️ The Solution

install-guard gives you a **risk score before you install anything**.

---

## ⚡ Quick Start

Check a package:

```bash
npx install-guard axios
```

Safely install a package:

```bash
npx install-guard install axios
```

Scan your project:

```bash
npx install-guard scan
```

---

## 🧠 How Risk Score Works

install-guard analyzes:

- 📉 Weekly downloads (popularity)
- 🕒 Last update time
- ⚠ Install/postinstall scripts
- 📦 Version activity

Each factor contributes to a **risk score (0–10)**.

Lower score = safer package.

---

## 📊 Example Results

### ✅ Safe package

```
axios
Downloads: 20,000,000+
Risk: 1/10
```

---

### 🚨 Risky package

```
some-lib
Downloads: 200
Risk: 8/10

⚠ Low downloads
⚠ Uses install scripts
```

---

## ✨ Features

- 🔍 Analyze any npm package instantly
- ⚠ Risk scoring (0–10)
- 🛑 Block risky installs
- 📦 Project-wide dependency scan
- ⚡ Zero setup (works with npx)

---

## 🤔 Why not npm audit?

| Feature               | npm audit | install-guard |
|-----------------------|-----------|------------|
| Known vulnerabilities | ✅        | ✅         |
| Trust analysis        | ❌        | ✅         |
| Pre-install check     | ❌        | ✅         |
| Install blocking      | ❌        | ✅         |

---

## 📦 Install globally

```bash
npm install -g install-guard
```

---

## 🔮 Roadmap

- 🔍 GitHub activity analysis
- 🧠 Typosquatting detection
- 📊 Dependency tree visualization
- 🔌 CI/CD integration

---

## 🤝 Contributing

PRs welcome! Let's make npm safer together.

---

## ⭐ Support

If you find this useful, consider giving it a star ⭐  
It helps others discover the project!
