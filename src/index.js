import { analyze } from "./analyze.js";

export async function analyzePackage(pkg, version, opts) {
    return await analyze(pkg, version, opts);
}