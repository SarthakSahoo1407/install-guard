import { analyze } from "./analyze.js";

export async function analyzePackage(pkg) {
    await analyze(pkg);
}