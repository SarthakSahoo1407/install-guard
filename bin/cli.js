#!/usr/bin/env node

import { Command } from "commander";
import { analyzePackage } from "../src/index.js";
import { scanProject } from "../src/scan.js";

const program = new Command();

program
    .name("install-guard")
    .description("Analyze npm packages for security risks before installing")
    .version("2.0.0");

program
    .argument("[package]", "package name to analyze")
    .action(async (pkg) => {
        if (!pkg) {
            program.help();
            return;
        }
        await analyzePackage(pkg);
    });

program
    .command("scan")
    .description("Scan all project dependencies for risks")
    .option("-v, --verbose", "Show detailed analysis for each package")
    .action(async (opts) => {
        await scanProject({ verbose: opts.verbose });
    });

program
    .command("install <pkg>")
    .description("Analyze and safely install a package")
    .action(async (pkg) => {
        const { analyzeAndPrompt } = await import("../src/install.js");
        await analyzeAndPrompt(pkg);
    });

program.parse();