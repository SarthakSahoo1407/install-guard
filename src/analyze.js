import ora from "ora";
import { runPipeline } from "./services/pipeline.js";
import { formatPipelineResult } from "./format.js";

/**
 * Analyze a package and print results to stdout.
 * Returns the structured result.
 */
export async function analyze(pkgName, version, opts = {}) {
    const spinner = ora(`Analyzing ${pkgName}${version ? `@${version}` : ""}...`).start();

    try {
        const result = await runPipeline(pkgName, version, opts);
        spinner.stop();

        if (opts.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(formatPipelineResult(result));
        }

        return result;
    } catch (err) {
        spinner.fail(`Failed to analyze "${pkgName}": ${err.message}`);
        return null;
    }
}