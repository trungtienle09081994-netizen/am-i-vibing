# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for the "am-i-vibing" library - a tool for detecting agentic coding environments and AI assistant tools. The library allows CLI tools and applications to detect when they're being executed by AI agents (like Claude Code) and adapt their behavior accordingly.

## Technology Stack

- **Language**: TypeScript (ES2022 target)
- **Package Manager**: pnpm (v10.13.1) - required for workspace support
- **Build System**: tsup for TypeScript compilation
- **Testing**: Vitest
- **Monorepo**: pnpm workspaces
- **Release Management**: Changesets

## Common Development Commands

### Root-level commands (run from repository root):
```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests across all packages
pnpm run test

# Type check all packages
pnpm run check
```

### Package-specific commands (run from package directory):
```bash
# Build single package
pnpm run build

# Run tests for single package
pnpm run test

# Validate package exports and types
pnpm run check

# Run development build with watch mode
pnpm run dev
```

## Architecture Overview

### Monorepo Structure
- `packages/am-i-vibing/` - Main library package for agentic environment detection
- Root workspace coordinates builds, tests, and releases

### Library Architecture (am-i-vibing)
- **Core Detection**: `src/detector.ts` - Main detection logic with simplified implementation
- **Provider Definitions**: `src/providers.ts` - Configuration for each AI tool
- **Type System**: `src/types.ts` - TypeScript interfaces and types
- **CLI Interface**: `src/cli.ts` - Command-line interface for npx execution
- **Detection Methods**:
  - Environment variable detection (string and name/value tuples)
  - Process tree analysis using process-ancestry
  - Custom filesystem-based detectors
  - Logical operators (ANY/ALL/NONE) for complex conditions

### Key Features
- **Provider Detection**: Supports 10+ major AI coding tools
- **Detection Categories**: Direct agents, embedded IDE features, hybrid tools
- **CLI Tool**: Available via `npx am-i-vibing` with multiple output formats
- **Tuple-based Detection**: Validates both variable names and expected values
- **Simplified API**: Returns `id`, `name`, and `type` for detected providers

## Supported AI Tools

### Direct Agents (Full CLI control)
- **Claude Code**: `CLAUDECODE`
- **Replit AI**: `REPL_ID` with various modes
- **Aider**: `AIDER_API_KEY` with process detection
- **Bolt.new**: `SHELL=/bin/jsh` with specific npm config
- **Zed Agent**: `TERM_PROGRAM=zed` + `PAGER=cat`

### Embedded IDE Features
- **Cursor**: `CURSOR_TRACE_ID` (interactive and agent variants)
- **GitHub Copilot**: `TERM_PROGRAM=vscode` + `GIT_PAGER=cat`
- **Zed**: `TERM_PROGRAM=zed` (interactive mode)
- **Gemini Agent**: Process-based detection
- **OpenAI Codex**: Process-based detection

### Environment Variable Types
- **String**: Simple presence check (`'CLAUDECODE'`)
- **Tuple**: Name/value validation (`['TERM_PROGRAM', 'cursor']`)
- **Custom Detectors**: Complex filesystem/process checks

## Usage Examples

### CLI Usage
```bash
# Basic detection
npx am-i-vibing
# ✓ Detected: Claude Code (agent)

# JSON output
npx am-i-vibing --format json
# {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}

# Check specific environment type
npx am-i-vibing --check agent
# ✓ Running in agent environment: Claude Code

# Quiet mode (useful for scripts)
npx am-i-vibing --quiet
# Claude Code
```

### Library Usage
```typescript
import { detectAgenticEnvironment, isAgent, isInteractive } from 'am-i-vibing';

// Full detection
const result = detectAgenticEnvironment();
console.log(`Detected: ${result.name} (${result.type})`);
console.log(`ID: ${result.id}`);
console.log(`Is agentic: ${result.isAgentic}`);

// Quick checks
if (isAgent()) {
  console.log('Running under direct AI agent control');
}

if (isInteractive()) {
  console.log('Running in interactive AI environment');
}
```

## Development Guidelines

### Adding New Providers
1. Research actual environment variables (don't guess)
2. Use real variables over speculative ones
3. Prefer environment variables over custom detectors
4. Use tuples for value-specific detection
5. Only use custom detectors for filesystem/process checks

### Testing Strategy
- Test environment variable detection (strings and tuples)
- Test logical operators (ANY/ALL/NONE) combinations
- Test false positive scenarios
- Test CLI functionality with different arguments
- Mock filesystem operations in custom detectors

### Build and Packaging
- Build targets both library (`src/index.ts`) and CLI (`src/cli.ts`)
- CLI is executable via `npx am-i-vibing` after npm publication
- ESM-only with proper shebang preservation for CLI

## Release Process

This project uses Changesets for automated releases:

1. Create changes in packages
2. Run `pnpm changeset` to document changes
3. Commit changeset files
4. CI will automatically create release PR when changes are merged
5. Merge release PR to publish to npm

## CI/CD Pipeline

Three GitHub Actions workflows:
- **Test**: Runs on PRs and main branch (build + test + type check)
- **Release**: Automated publishing via Changesets
- **Semantic PRs**: Enforces conventional commit format for PR titles

## Key Conventions

### Package Naming
- Main library: `am-i-vibing`

### TypeScript Configuration
- ES2022 target with strict mode
- Module preservation for library packages
- Shared tsconfig.json at root with package-specific extensions

### Export Strategy
- ESM-only packages
- Explicit export maps in package.json
- Type-only imports/exports properly separated