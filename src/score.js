export function calculateRisk(pkg) {
    let score = 0;
    const warnings = [];

    // 🟢 Popularity (VERY IMPORTANT)
    if (pkg.downloads < 1000) {
        score += 3;
        warnings.push("Very low downloads");
    } else if (pkg.downloads < 10000) {
        score += 2;
        warnings.push("Low downloads");
    }

    // 🟡 Update recency
    const lastUpdate = new Date(pkg.lastPublished);
    const now = new Date();
    const diffMonths = (now - lastUpdate) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths > 12) {
        score += 3;
        warnings.push("Not updated in over a year");
    } else if (diffMonths > 6) {
        score += 1;
        warnings.push("Not updated recently");
    }

    // 🔴 Install scripts (HIGH RISK)
    if (pkg.hasInstallScript) {
        score += 3;
        warnings.push("Uses install/postinstall scripts");
    }

    // 🟢 High trust signal
    if (pkg.downloads > 1000000) {
        score -= 2; // reduce risk
    }

    if (pkg.downloads > 5000000) {
        score -= 2;
    }

    // Normalize
    if (score < 0) score = 0;
    if (score > 10) score = 10;

    return { score, warnings };
}