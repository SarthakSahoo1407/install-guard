import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { runPipeline } from "./services/pipeline.js";
import { formatPipelineResult, formatScanSummary } from "./format.js";

export async function scanProject({ verbose, json, skipGithub } = {}) {
    const pkgPath = path.resolve("package.json");

    if (!fs.existsSync(pkgPath)) {
        console.log(chalk.red("\n  ✘ No package.json found in current directory\n"));
        process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
    };

    const depNames = Object.keys(deps);

    if (depNames.length === 0) {
        console.log(chalk.yellow("\n  No dependencies found.\n"));
        return;
    }

    console.log(chalk.bold(`\n  Scanning ${depNames.length} dependencies...\n`));

    const results = [];
    const spinner = ora();

    for (const dep of depNames) {
        spinner.start(`Analyzing ${dep}...`);
        try {
            const result = await runPipeline(dep, undefined, { skipGithub: skipGithub !== false });
            results.push(result);

            if (verbose) {
                spinner.stop();
                console.log(formatPipelineResult(result));
            } else {
                const icon =
                    result.label === "CRITICAL" || result.label === "HIGH"
                        ? "🚨"
                        : result.label === "MEDIUM"
                          ? "⚠"
                          : "✅";
                spinner.succeed(
                    `${dep} ${chalk.gray(`(${result.score}/10)`)} ${icon}`
                );
            }
        } catch {
            spinner.fail(`${dep} - failed to fetch`);
        }
    }

    if (json) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log(formatScanSummary(results));
    }
}