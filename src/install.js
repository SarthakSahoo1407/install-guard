import { execFileSync } from "child_process";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { getPackageData } from "./npm.js";
import { calculateRisk } from "./score.js";
import { formatAnalysis } from "./format.js";

const VALID_PKG_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[a-z0-9._^~>=<|-]+)?$/i;

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
    if (!VALID_PKG_NAME.test(pkgName)) {
        console.log(chalk.red("\n  ✘ Invalid package name.\n"));
        return;
    }

    const spinner = ora(`Analyzing ${pkgName}...`).start();

    let data, result;
    try {
        data = await getPackageData(pkgName);
        result = calculateRisk(data);
        spinner.stop();
    } catch (err) {
        spinner.fail(`Failed to analyze "${pkgName}": ${err.message}`);
        return;
    }

    console.log(formatAnalysis(data, result));

    if (result.level === "high") {
        const ans = await askQuestion(
            chalk.red.bold("  ⚠ High risk package. Continue install? (y/n): ")
        );
        if (ans.toLowerCase() !== "y") {
            console.log(chalk.yellow("\n  Installation aborted.\n"));
            return;
        }
    } else if (result.level === "medium") {
        const ans = await askQuestion(
            chalk.yellow("  ⚠ Medium risk. Continue install? (y/n): ")
        );
        if (ans.toLowerCase() !== "y") {
            console.log(chalk.yellow("\n  Installation aborted.\n"));
            return;
        }
    }

    console.log(chalk.green("\n  Installing...\n"));
    execFileSync("npm", ["install", pkgName], { stdio: "inherit" });
    console.log(chalk.green(`\n  ✔ ${pkgName} installed successfully.\n`));
}