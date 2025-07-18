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
- **Process Detection**: process-ancestry package for process tree analysis

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

# Test the CLI interface
pnpm run cli

# Run whoami script for debugging
pnpm run whoami
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

# Test package before publishing
pnpm run prepublishOnly
```

## Architecture Overview

### Monorepo Structure
- `packages/am-i-vibing/` - Main library package for agentic environment detection
- Root workspace coordinates builds, tests, and releases

### Library Architecture (am-i-vibing)
- **Core Detection**: `src/detector.ts` - Main detection logic with clean implementation
- **Provider Definitions**: `src/providers.ts` - Configuration for each AI tool
- **Type System**: `src/types.ts` - TypeScript interfaces and types
- **CLI Interface**: `src/cli.ts` - Command-line interface for npx execution
- **Public API**: `src/index.ts` - Exports for library consumers

### Detection Methods
1. **Environment Variables**: String presence or name/value tuple validation
2. **Process Tree Analysis**: Using process-ancestry to check running processes  
3. **Custom Detectors**: Functions for complex filesystem or configuration checks
4. **Logical Operators**: ANY/ALL/NONE conditions for sophisticated detection rules

### Key Features
- **15+ Provider Support**: Major AI coding tools across different categories
- **Type Safety**: Full TypeScript support with proper type definitions
- **CLI Tool**: Available via `npx am-i-vibing` with multiple output formats
- **Tuple Detection**: Validates both environment variable names AND expected values
- **Simple API**: Clean detection results with `id`, `name`, `type`, and `isAgentic`

## Supported AI Tools

### Direct Agents (Full CLI control)
- **Claude Code**: `CLAUDECODE` environment variable
- **Cursor Agent**: `CURSOR_TRACE_ID` + specific `PAGER` setting
- **Replit Assistant**: `REPL_ID` + `REPLIT_MODE=assistant`
- **Aider**: `AIDER_API_KEY` environment variable + process detection
- **Bolt.new Agent**: `SHELL=/bin/jsh` + `npm_config_yes`
- **Zed Agent**: `TERM_PROGRAM=zed` + `PAGER=cat`
- **Windsurf**: `CODEIUM_EDITOR_APP_ROOT` environment variable
- **VS Code Copilot Agent**: `TERM_PROGRAM=vscode` + `GIT_PAGER=cat`
- **Gemini Agent**: Process-based detection
- **OpenAI Codex**: Process-based detection

### Interactive IDE Features
- **Cursor**: `CURSOR_TRACE_ID` (without agent-specific pager)
- **Replit**: `REPL_ID` (without assistant mode)
- **Bolt.new**: `SHELL=/bin/jsh` (without npm_config_yes)
- **Zed**: `TERM_PROGRAM=zed` (without cat pager)

### Hybrid Tools
- **Warp Terminal**: `TERM_PROGRAM=WarpTerminal` (both interactive and agentic features)

### Detection Types
- **String**: Simple presence check (`"CLAUDECODE"`)
- **Tuple**: Name/value validation (`["TERM_PROGRAM", "zed"]`)
- **Complex Rules**: Logical operators with multiple conditions
  ```typescript
  {
    all: [["SHELL", "/bin/jsh"], "npm_config_yes"],  // All must match
    none: ["SOME_VAR"]                               // None should be present
  }
  ```

## Usage Examples

### CLI Usage
```bash
# Basic detection
npx am-i-vibing
# ✓ Detected: [claude-code] Claude Code (agent)

# JSON output
npx am-i-vibing --format json
# {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}

# Check specific environment type
npx am-i-vibing --check agent
# ✓ Running in agent environment: Claude Code

# Quiet mode (useful for scripts)
npx am-i-vibing --quiet
# Claude Code

# Debug mode with full environment info
npx am-i-vibing --debug
# Outputs full JSON with detection result, environment vars, and process ancestry

# All CLI options
npx am-i-vibing --help
```

### Library Usage
```typescript
import { 
  detectAgenticEnvironment, 
  isAgent, 
  isInteractive, 
  isHybrid,
  getProvider,
  getProvidersByType 
} from 'am-i-vibing';

// Full detection
const result = detectAgenticEnvironment();
if (result.isAgentic) {
  console.log(`Detected: ${result.name} (${result.type})`);
  console.log(`ID: ${result.id}`);
}

// Quick type checks
if (isAgent()) {
  console.log('Running under direct AI agent control');
  // Adapt behavior for full agent environment
}

if (isInteractive()) {
  console.log('Running in interactive AI environment');
  // Adapt behavior for IDE with AI features
}

if (isHybrid()) {
  console.log('Running in hybrid AI environment');
  // Handle both interactive and agent capabilities
}

// Provider utilities
const claudeConfig = getProvider('Claude Code');
const allAgents = getProvidersByType('agent');
```

### Default Export Usage
```typescript
import detectEnvironment from 'am-i-vibing';

const result = detectEnvironment();
if (result.isAgentic) {
  console.log(`Running in ${result.name}`);
}
```

## Development Guidelines

### Adding New Providers
1. **Research First**: Find actual environment variables from official docs (don't guess)
2. **Use Real Variables**: Prefer documented environment variables over speculative ones
3. **Environment Over Custom**: Prefer environment variables over custom detectors
4. **Use Tuples**: Use tuples for value-specific detection to avoid false positives
5. **Custom Detectors**: Only use for filesystem/process checks when env vars aren't available
6. **Type Classification**: Choose correct type (agent/interactive/hybrid) based on tool capabilities

### Provider Configuration Structure
```typescript
{
  id: "tool-id",                    // Unique kebab-case identifier
  name: "Tool Name",                // Human-readable name
  type: "agent" | "interactive" | "hybrid",
  envVars: [                        // Environment variable conditions
    "SIMPLE_VAR",                   // String: simple presence check
    ["VAR_NAME", "expected_value"], // Tuple: name + value validation
    {                               // Complex conditions
      all: ["VAR1", ["VAR2", "value"]],  // All must match (AND)
      any: ["VAR3", "VAR4"],             // Any can match (OR)  
      none: ["VAR5"]                     // None should match (NOT)
    }
  ],
  processChecks: ["process-name"],  // Process names to check
  customDetectors: [() => boolean]  // Custom detection functions
}
```

### Testing Strategy
- **Environment Variables**: Test both string and tuple detection
- **Logical Operators**: Test ANY/ALL/NONE combinations thoroughly
- **False Positives**: Ensure specific tools don't trigger others
- **CLI Functionality**: Test all CLI flags and output formats
- **Error Handling**: Mock failures in process checks and custom detectors

### Build and Packaging
- **Dual Build**: Targets both library (`src/index.ts`) and CLI (`src/cli.ts`)
- **ESM Only**: Modern ESM-only package with proper module resolution
- **CLI Executable**: Available via `npx am-i-vibing` with shebang preservation
- **Type Definitions**: Includes .d.ts files for TypeScript consumers
- **Package Validation**: Uses publint and @arethetypeswrong/cli for validation

## Release Process

This project uses Changesets for automated releases:

1. **Make Changes**: Create features/fixes in packages
2. **Document Changes**: Run `pnpm changeset` to create changeset files
3. **Commit**: Commit changeset files with your changes
4. **Automated Release**: CI creates release PR when changes are merged to main
5. **Publish**: Merge release PR to automatically publish to npm

### Changeset Types
- `patch`: Bug fixes and small improvements
- `minor`: New features and enhancements  
- `major`: Breaking changes

## CI/CD Pipeline

### GitHub Actions Workflows
- **Test Workflow**: Runs on PRs and main branch
  - Installs dependencies with pnpm
  - Builds all packages
  - Runs test suite
  - Performs type checking
- **Release Workflow**: Automated publishing via Changesets
  - Creates release PRs automatically
  - Publishes to npm when release PR is merged
- **Semantic PRs**: Enforces conventional commit format for PR titles

### Current Package Version
- **am-i-vibing**: v0.0.2 (published to npm)

## Key Conventions

### Package Configuration
- **Main Library**: `am-i-vibing` 
- **Repository**: https://github.com/ascorbic/am-i-vibing
- **Author**: Matt Kane
- **License**: MIT

### TypeScript Configuration
- **Target**: ES2022 with strict mode enabled
- **Module Type**: ESM-only with proper module resolution
- **Build Output**: Preserves ESM imports and includes type definitions
- **Shared Config**: Root `tsconfig.json` with package-specific extensions

### Export Strategy
- **ESM Only**: Modern module format, no CommonJS support
- **Explicit Exports**: Clear export maps in package.json
- **CLI Binary**: Executable via `npx am-i-vibing` with proper shebang
- **Type Safety**: Full TypeScript definitions included

### File Structure
```
packages/am-i-vibing/
├── src/
│   ├── types.ts      # TypeScript interfaces
│   ├── providers.ts  # Provider configurations  
│   ├── detector.ts   # Core detection logic
│   ├── index.ts      # Public API exports
│   └── cli.ts        # CLI interface
├── test/             # Test suite
├── dist/             # Built output (gitignored)
└── package.json      # Package configuration
```