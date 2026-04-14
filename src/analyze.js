import chalk from "chalk";
import ora from "ora";
import { getPackageData } from "./npm.js";
import { calculateRisk } from "./score.js";

export async function analyze(pkgName) {
    const spinner = ora(`Analyzing ${pkgName}...`).start();

    try {
        const data = await getPackageData(pkgName);
        const { score, warnings } = calculateRisk(data);

        spinner.stop();

        console.log(chalk.bold(`\n📦 ${data.name}`));
        console.log(`Version: ${data.version}`);
        console.log(`Downloads (weekly): ${data.downloads.toLocaleString()}`);
        console.log(`Risk Score: ${score}/10`);

        if (score <= 3) {
            console.log(chalk.green("✅ Low risk"));
        } else if (score <= 6) {
            console.log(chalk.yellow("⚠ Medium risk"));
        } else {
            console.log(chalk.red("🚨 High risk"));
        }

        warnings.forEach((w) => {
            console.log(chalk.yellow(`⚠ ${w}`));
        });
    } catch (err) {
        spinner.fail("Failed to fetch package");
    }
}