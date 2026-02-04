import { describe, it, expect } from "vitest";

describe("fenchurch CLI utilities", () => {
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

	it("should filter selected platforms correctly", () => {
		const platforms = [
			{ id: "claude", name: "Claude Code", selected: true },
			{ id: "cursor", name: "Cursor", selected: false },
			{ id: "aider", name: "Aider", selected: true },
		];

		const selected = platforms.filter((p) => p.selected);

		expect(selected).toHaveLength(2);
		expect(selected.map((p) => p.id)).toEqual(["claude", "aider"]);
	});

	it("should update configurations with selected field", () => {
		const aiConfigs = [
			{ id: "claude", name: "Claude Code" },
			{ id: "cursor", name: "Cursor" },
		];
		const selectedAIs = ["claude"];

		const updatedConfigs = aiConfigs.map((config) => ({
			...config,
			selected: selectedAIs.includes(config.id),
		}));

		expect(updatedConfigs[0].selected).toBe(true);
		expect(updatedConfigs[1].selected).toBe(false);
	});

	it("should extract selected IDs from existing config", () => {
		const existingConfig = [
			{ id: "claude", name: "Claude Code", selected: true },
			{ id: "cursor", name: "Cursor", selected: false },
			{ id: "aider", name: "Aider", selected: true },
		];

		const selectedAIs = existingConfig
			.filter((config) => config.selected)
			.map((config) => config.id);

		expect(selectedAIs).toEqual(["claude", "aider"]);
	});
});
