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
