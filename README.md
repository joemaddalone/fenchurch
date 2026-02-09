# fenchurch

A CLI tool to initialize projects with AI tooling and prompts. This is very much ME opinionated and always changing, but you are welcome to use it.

## Usage

Run fenchurch in any directory where you want to set up AI tooling:

```bash
# Interactive mode
npx fenchurch

# Skip prompts by passing tool IDs as flags
npx fenchurch --claude --cursor --antigravity
```

The tool will:

1. Show a list of available AI tools
2. Let you select which ones to enable
3. Copy prompts and configuration files to your project
4. Set up the selected AI tools

## Supported AI Tools

- Antigravity
- Aider
- Claude Code
- Cline
- ChatGPT Codex
- Continue
- GitHub Copilot
- Cursor
- Kiro
- OpenCode
- Windsurf

## Re-running

If you run fenchurch again in a directory that already has an `ai-config.json` file, it will ask if you want to use the existing settings or start fresh.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```
