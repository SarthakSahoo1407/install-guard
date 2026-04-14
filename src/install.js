import { execSync } from "child_process";
import readline from "readline";
import { getPackageData } from "./npm.js";
import { calculateRisk } from "./score.js";

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

export async function analyzeAndPrompt(pkgName) {
    console.log(`\nAnalyzing ${pkgName}...\n`);

    const data = await getPackageData(pkgName);
    const { score, warnings } = calculateRisk(data);

    console.log(`Risk Score: ${score}/10`);

    warnings.forEach((w) => console.log(`⚠ ${w}`));

    if (score >= 6) {
        const ans = await askQuestion(
            "\nHigh risk package. Continue install? (y/n): "
        );

        if (ans.toLowerCase() !== "y") {
            console.log("Installation aborted.");
            return;
        }
    }

    console.log("\nInstalling...\n");

    execSync(`npm install ${pkgName}`, { stdio: "inherit" });
}