#!/usr/bin/env node

import { Command } from "commander";
import { analyzePackage } from "../src/index.js";
import { scanProject } from "../src/scan.js";

const program = new Command();

program
    .name("install-guard")
    .description("Check npm package risk before installing");

program
    .argument("[package]", "package name to analyze")
    .action(async (pkg) => {
        if (!pkg) {
            console.log("Please provide a package name");
            return;
        }
        await analyzePackage(pkg);
    });

program
    .command("scan")
    .description("Scan current project dependencies")
    .action(scanProject);
    
program
  .command("install <pkg>")
  .description("Analyze and install package safely")
  .action(async (pkg) => {
    const { analyzeAndPrompt } = await import("../src/install.js");
    await analyzeAndPrompt(pkg);
  });
program.parse();