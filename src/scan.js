import fs from "fs";
import { analyzePackage } from "./index.js";

export async function scanProject() {
    const pkg = JSON.parse(fs.readFileSync("package.json"));

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
    };

    for (const dep of Object.keys(deps)) {
        await analyzePackage(dep);
    }
}