import { analyze } from "./analyze.js";

export async function analyzePackage(pkg) {
    return await analyze(pkg);
}