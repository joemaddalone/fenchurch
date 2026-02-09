#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import inquirer from "inquirer";
import ora from "ora";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AIConfig {
	id: string;
	name: string;
	dirPath: string;
	useSourceFilename: boolean;
	targetPath?: string;
	selected?: boolean;
}

const copyDirectory = async (src: string, dest: string) => {
	await fs.mkdir(dest, { recursive: true });
	const entries = await fs.readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			await fs.copyFile(srcPath, destPath);
		}
	}
};

const main = async () => {
	try {
		// Load AI configurations
		const configPath = path.join(__dirname, "ai-config.json");
		const aiConfigs: AIConfig[] = JSON.parse(
			await fs.readFile(configPath, "utf-8"),
		);

		let selectedAIs: string[] = [];

		// Check for manually passed in flags
		const argFlags = process.argv
			.slice(2)
			.filter((arg) => arg.startsWith("--"))
			.map((arg) => arg.slice(2));

		const validIds = aiConfigs.map((config) => config.id);
		selectedAIs = argFlags.filter((flag) => validIds.includes(flag));

		if (selectedAIs.length === 0) {
			// Check for existing config in current directory
			const existingConfigPath = path.join(process.cwd(), "ai-config.json");

			try {
				await fs.access(existingConfigPath);
				const { useExisting } = await inquirer.prompt([
					{
						type: "confirm",
						name: "useExisting",
						message: "Found existing ai-config.json. Use existing settings?",
						default: true,
					},
				]);

				if (useExisting) {
					const existingConfig: AIConfig[] = JSON.parse(
						await fs.readFile(existingConfigPath, "utf-8"),
					);
					selectedAIs = existingConfig
						.filter((config) => config.selected)
						.map((config) => config.id);
				}
			} catch {
				// No existing config, continue normally
			}
		}

		// If no existing config or user chose to start fresh, prompt for selection
		if (selectedAIs.length === 0) {
			const result = await inquirer.prompt([
				{
					type: "checkbox",
					name: "selectedAIs",
					message: "Select AI tools to enable:",
					choices: aiConfigs.map((config) => ({
						name: config.name,
						value: config.id,
					})),
				},
			]);
			selectedAIs = result.selectedAIs;
		}

		if (selectedAIs.length === 0) {
			console.log("No AI tools selected. Exiting.");
			return;
		}

		const spinner = ora("Setting up project...").start();

		// Update configurations with selected field
		const updatedConfigs = aiConfigs.map((config) => ({
			...config,
			selected: selectedAIs.includes(config.id),
		}));

		// Copy prompts directory to current directory
		const sourcePromptsPath = path.join(__dirname, "prompts");
		const destPromptsPath = path.join(process.cwd(), "prompts");
		await copyDirectory(sourcePromptsPath, destPromptsPath);

		// Write updated ai-config.json to current directory
		const destConfigPath = path.join(process.cwd(), "ai-config.json");
		await fs.writeFile(destConfigPath, JSON.stringify(updatedConfigs, null, 2));

		spinner.text = "Running sync...";

		// Run sync.ts with the new configuration
		const syncPath = path.join(__dirname, "../dist/sync.js");
		execSync(`node ${syncPath}`, {
			cwd: process.cwd(),
			stdio: "inherit",
		});

		spinner.succeed("Project initialized successfully!");
	} catch (error) {
		console.error("Error:", (error as Error).message);
		process.exit(1);
	}
};

export { main, copyDirectory };

main();
