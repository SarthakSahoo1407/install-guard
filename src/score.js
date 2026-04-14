import { checkTyposquat } from "./typosquat.js";

export function calculateRisk(pkg) {
    let score = 0;
    const checks = [];
    const now = new Date();

    // ── Downloads ──────────────────────────────────
    if (pkg.downloads < 100) {
        score += 3;
        checks.push({ label: "Downloads", status: "fail", detail: `Very low (${pkg.downloads.toLocaleString()}/week)` });
    } else if (pkg.downloads < 1_000) {
        score += 2;
        checks.push({ label: "Downloads", status: "warn", detail: `Low (${pkg.downloads.toLocaleString()}/week)` });
    } else if (pkg.downloads < 10_000) {
        score += 1;
        checks.push({ label: "Downloads", status: "warn", detail: `Moderate (${pkg.downloads.toLocaleString()}/week)` });
    } else {
        checks.push({ label: "Downloads", status: "pass", detail: `${pkg.downloads.toLocaleString()}/week` });
    }

    if (pkg.downloads > 1_000_000) score -= 2;
    if (pkg.downloads > 5_000_000) score -= 1;

    // ── Update recency ────────────────────────────
    if (pkg.lastPublished) {
        const diffMonths = (now - new Date(pkg.lastPublished)) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths > 24) {
            score += 3;
            checks.push({ label: "Last Updated", status: "fail", detail: "Not updated in over 2 years" });
        } else if (diffMonths > 12) {
            score += 2;
            checks.push({ label: "Last Updated", status: "warn", detail: "Not updated in over a year" });
        } else if (diffMonths > 6) {
            score += 1;
            checks.push({ label: "Last Updated", status: "warn", detail: "Not updated in 6+ months" });
        } else {
            checks.push({ label: "Last Updated", status: "pass", detail: "Recently updated" });
        }
    }

    // ── Install scripts ───────────────────────────
    if (pkg.hasInstallScript) {
        score += 3;
        checks.push({ label: "Install Scripts", status: "fail", detail: "Has install/postinstall scripts" });
    } else {
        checks.push({ label: "Install Scripts", status: "pass", detail: "No install scripts" });
    }

    // ── Maintainers ───────────────────────────────
    const maintainerCount = pkg.maintainers?.length || 0;
    if (maintainerCount === 0) {
        score += 2;
        checks.push({ label: "Maintainers", status: "fail", detail: "No maintainers listed" });
    } else if (maintainerCount === 1) {
        score += 1;
        checks.push({ label: "Maintainers", status: "warn", detail: "Single maintainer" });
    } else {
        checks.push({ label: "Maintainers", status: "pass", detail: `${maintainerCount} maintainers` });
    }

    // ── License ───────────────────────────────────
    const license = (typeof pkg.license === "string" ? pkg.license : pkg.license?.type) || "Unknown";
    const permissive = ["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "Unlicense"];
    if (license === "Unknown" || license === "UNLICENSED") {
        score += 2;
        checks.push({ label: "License", status: "fail", detail: "No license specified" });
    } else if (permissive.includes(license)) {
        checks.push({ label: "License", status: "pass", detail: license });
    } else {
        score += 1;
        checks.push({ label: "License", status: "warn", detail: `${license} (review recommended)` });
    }

    // ── Repository ────────────────────────────────
    if (!pkg.repository) {
        score += 1;
        checks.push({ label: "Repository", status: "warn", detail: "No repository URL" });
    } else {
        checks.push({ label: "Repository", status: "pass", detail: "Has repository link" });
    }

    // ── Package age ───────────────────────────────
    if (pkg.firstPublished) {
        const ageDays = (now - new Date(pkg.firstPublished)) / (1000 * 60 * 60 * 24);
        if (ageDays < 30) {
            score += 2;
            checks.push({ label: "Package Age", status: "fail", detail: "Published less than 30 days ago" });
        } else if (ageDays < 180) {
            score += 1;
            checks.push({ label: "Package Age", status: "warn", detail: "Published less than 6 months ago" });
        } else {
            const years = Math.floor(ageDays / 365);
            checks.push({ label: "Package Age", status: "pass", detail: years > 0 ? `${years}+ year(s) old` : "6+ months old" });
        }
    }

    // ── Dependency count ──────────────────────────
    if (pkg.dependencies > 20) {
        score += 1;
        checks.push({ label: "Dependencies", status: "warn", detail: `${pkg.dependencies} direct dependencies (high)` });
    } else {
        checks.push({ label: "Dependencies", status: "pass", detail: `${pkg.dependencies} direct dependencies` });
    }

    // ── Deprecated ────────────────────────────────
    if (pkg.deprecated) {
        score += 3;
        checks.push({
            label: "Deprecated",
            status: "fail",
            detail: typeof pkg.deprecated === "string" ? pkg.deprecated : "Package is deprecated",
        });
    }

    // ── Typosquatting ─────────────────────────────
    const typosquatMatch = checkTyposquat(pkg.name);
    if (typosquatMatch) {
        score += 3;
        checks.push({ label: "Typosquatting", status: "fail", detail: `Name is suspiciously similar to "${typosquatMatch}"` });
    }

    // Normalize
    score = Math.max(0, Math.min(10, score));
    const level = score <= 3 ? "low" : score <= 6 ? "medium" : "high";

    return { score, checks, level };
}