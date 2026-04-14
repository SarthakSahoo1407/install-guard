import { execFileSync } from "child_process";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { runPipeline } from "./services/pipeline.js";
import { formatPipelineResult } from "./format.js";

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

    let result;
    try {
        result = await runPipeline(pkgName);
        spinner.stop();
    } catch (err) {
        spinner.fail(`Failed to analyze "${pkgName}": ${err.message}`);
        return;
    }

    console.log(formatPipelineResult(result));

    if (result.label === "CRITICAL") {
        const ans = await askQuestion(
            chalk.redBright.bold("  💀 CRITICAL risk. Are you absolutely sure? (y/n): ")
        );
        if (ans.toLowerCase() !== "y") {
            console.log(chalk.yellow("\n  Installation aborted.\n"));
            return;
        }
    } else if (result.label === "HIGH") {
        const ans = await askQuestion(
            chalk.red.bold("  🚨 HIGH risk package. Continue install? (y/n): ")
        );
        if (ans.toLowerCase() !== "y") {
            console.log(chalk.yellow("\n  Installation aborted.\n"));
            return;
        }
    } else if (result.label === "MEDIUM") {
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