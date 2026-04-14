#!/usr/bin/env node

import { Command } from "commander";
import { analyzePackage } from "../src/index.js";
import { scanProject } from "../src/scan.js";

const program = new Command();

program
    .name("install-guard")
    .description("Detect supply chain attacks in npm packages before installing")
    .version("3.0.0");

program
    .argument("[package]", "package name to analyze (e.g., axios or axios@1.14.1)")
    .option("--json", "Output results as JSON")
    .option("--skip-github", "Skip GitHub verification (faster)")
    .action(async (pkg, opts) => {
        if (!pkg) {
            program.help();
            return;
        }

        // Support package@version syntax
        let name = pkg;
        let version;
        const atIndex = pkg.lastIndexOf("@");
        if (atIndex > 0) {
            name = pkg.slice(0, atIndex);
            version = pkg.slice(atIndex + 1);
        }

        await analyzePackage(name, version, {
            json: opts.json,
            skipGithub: opts.skipGithub,
        });
    });

program
    .command("scan")
    .description("Scan all project dependencies for supply chain risks")
    .option("-v, --verbose", "Show detailed analysis for each package")
    .option("--json", "Output results as JSON")
    .option("--skip-github", "Skip GitHub verification (faster)")
    .action(async (opts) => {
        await scanProject({
            verbose: opts.verbose,
            json: opts.json,
            skipGithub: opts.skipGithub,
        });
    });

program
    .command("install <pkg>")
    .description("Analyze and safely install a package")
    .action(async (pkg) => {
        const { analyzeAndPrompt } = await import("../src/install.js");
        await analyzeAndPrompt(pkg);
    });

program.parse();