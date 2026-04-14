import ora from "ora";
import { getPackageData } from "./npm.js";
import { calculateRisk } from "./score.js";
import { formatAnalysis } from "./format.js";

export async function analyze(pkgName) {
    const spinner = ora(`Analyzing ${pkgName}...`).start();

    try {
        const data = await getPackageData(pkgName);
        const result = calculateRisk(data);

        spinner.stop();
        console.log(formatAnalysis(data, result));

        return { data, result };
    } catch (err) {
        spinner.fail(`Failed to analyze "${pkgName}": ${err.message}`);
        return null;
    }
}