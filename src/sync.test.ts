import { describe, it, expect } from "vitest";

describe("sync functionality", () => {
	it("should format target paths correctly for useSourceFilename=false", () => {
		const platform = {
			id: "claude",
			name: "Claude Code",
			dirPath: "",
			useSourceFilename: false,
			targetPath: "CLAUDE.MD",
		};

		const formatTarget = (platform: any) => {
			if (platform.useSourceFilename)
				return `${platform.dirPath}/instructions.md`;
			return platform.targetPath || `${platform.id.toUpperCase()}.MD`;
		};

		expect(formatTarget(platform)).toBe("CLAUDE.MD");
	});

	it("should format target paths correctly for useSourceFilename=true", () => {
		const platform = {
			id: "cursor",
			name: "Cursor",
			dirPath: ".cursor/rules",
			useSourceFilename: true,
		};

		const formatTarget = (platform: any) => {
			if (platform.useSourceFilename)
				return `${platform.dirPath}/instructions.md`;
			return platform.targetPath || `${platform.id.toUpperCase()}.MD`;
		};

		expect(formatTarget(platform)).toBe(".cursor/rules/instructions.md");
	});

	it("should handle platforms without targetPath", () => {
		const platform = {
			id: "test",
			name: "Test Platform",
			dirPath: "",
			useSourceFilename: false,
		};

		const formatTarget = (platform: any) => {
			if (platform.useSourceFilename)
				return `${platform.dirPath}/instructions.md`;
			return platform.targetPath || `${platform.id.toUpperCase()}.MD`;
		};

		expect(formatTarget(platform)).toBe("TEST.MD");
	});
});

import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { ensureGitignoreIncludes } from "./sync";

describe(".gitignore updates", () => {
	it("creates .gitignore and adds entries when missing", async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "fench-"));
		const giPath = path.join(tmp, ".gitignore");

		await ensureGitignoreIncludes([".agent", "CLAUDE.MD"], giPath);

		const content = await fs.readFile(giPath, "utf-8");
		expect(content.split(/\r?\n/).filter(Boolean)).toEqual(
			expect.arrayContaining([".agent", "CLAUDE.MD"])
		);
	});

	it("does not duplicate existing entries", async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "fench-"));
		const giPath = path.join(tmp, ".gitignore");
		await fs.writeFile(giPath, ".agent\n", "utf-8");

		await ensureGitignoreIncludes([".agent", ".aider"], giPath);

		const content = await fs.readFile(giPath, "utf-8");
		const lines = content.split(/\r?\n/).filter(Boolean);
		expect(lines).toEqual([".agent", ".aider"]);
	});
});
