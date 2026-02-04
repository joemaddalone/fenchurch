#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const rootPath = process.cwd();
const sourcePath = path.join(rootPath, "prompts/instructions.md");
const configFile = path.join(rootPath, "ai-config.json");
const platforms = JSON.parse(await fs.readFile(configFile, "utf-8"));

interface Platform {
	id: string;
	name: string;
	dirPath: string;
	useSourceFilename: boolean;
	targetPath?: string;
	selected?: boolean;
}

const exists = async (p: string) => {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
};

const ensureDir = async (dir: string) => {
	await fs.mkdir(dir, { recursive: true });
};

const linkOrCopy = async (src: string, dest: string) => {
	try {
		await fs.link(src, dest);
	} catch (err: unknown) {
		// Cross-device link or other restrictions; fallback to copy
		const error = err as { code?: string };
		if (
			error.code === "EXDEV" ||
			error.code === "EPERM" ||
			error.code === "EACCES"
		) {
			await fs.copyFile(src, dest);
			return;
		}

		throw err;
	}
};

const formatTarget = (platform: Platform) => {
	if (platform.useSourceFilename)
		return path.join(platform.dirPath, path.basename(sourcePath));
	return platform.targetPath || `${platform.id.toUpperCase()}.MD`;
};

const syncPlatform = async (platform: Platform) => {
	const targetPath = formatTarget(platform);
	const targetFull = path.join(rootPath, targetPath);
	try {
		if (await exists(targetFull)) await fs.unlink(targetFull);
		if (platform.dirPath)
			await ensureDir(path.join(rootPath, platform.dirPath));
		await linkOrCopy(sourcePath, targetFull);
		return { ok: true, name: platform.name, target: targetPath };
	} catch (err) {
		return {
			ok: false,
			name: platform.name,
			target: targetPath,
			error: (err as Error).message,
		};
	}
};

interface SyncResult {
	ok: boolean;
	name: string;
	target: string;
	error?: string;
}

const showResults = (results: SyncResult[]) => {
	console.log("\n=== Results ===\n");
	for (const r of results) {
		if (r.ok) {
			console.log(`  ✅ ${r.name}: ${r.target}`);
		} else {
			// if the error is EEXIST, ignore it. Multiple tools use the same file (AGENTS.MD).
			if (r.error?.includes("EEXIST")) {
				console.log(`  ✅ ${r.name}: ${r.target}`);
			} else {
				console.log(`  ❌ ${r.name}: ${r.error}`);
			}
		}
	}
	console.log("");
};

const syncFiles = async () => {
	if (!(await exists(sourcePath))) {
		console.error(`[ERROR] Source file not found: prompts/instructions.md`);
		process.exit(1);
	}

	const selected = platforms.filter((p: Platform) => p.selected);
	if (selected.length === 0) {
		console.log("[!] No platforms selected. Exiting.");
		return;
	}

	const tasks = selected.map((p: Platform) => syncPlatform(p));
	const results = await Promise.all(tasks);
	showResults(results);
	const successCount = results.filter((r) => r.ok).length;
	console.log(`Synced to ${successCount}/${selected.length} platform(s)`);
};

const main = async () => {
	if (!(await exists(sourcePath))) {
		console.error(`[ERROR] Source file not found: prompts/instructions.md\n`);
		process.exit(1);
	}
	await syncFiles();
};

export { main, syncFiles, formatTarget };

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
