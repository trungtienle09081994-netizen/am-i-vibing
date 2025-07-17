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
- `demos/` - Demo applications that consume the library
- Root workspace coordinates builds, tests, and releases across all packages

### Library Architecture (am-i-vibing)
- **Core Detection**: `src/detector.ts` - Main detection logic and confidence scoring
- **Provider Definitions**: `src/providers.ts` - Configuration for each AI tool
- **Type System**: `src/types.ts` - TypeScript interfaces and types
- **Detection Methods**:
  - Environment variable detection (string and name/value tuples)
  - Process tree analysis
  - Custom filesystem-based detectors
  - Multi-layered confidence scoring

### Key Features
- **Provider Detection**: Supports 10+ major AI coding tools
- **Detection Categories**: Direct agents, embedded IDE features, hybrid tools
- **Evidence Classification**: Active usage vs installation vs environment
- **Confidence Scoring**: Weighted scoring based on evidence quality
- **Tuple-based Detection**: Validates both variable names and expected values

## Supported AI Tools

### Direct Agents (Full CLI control)
- **Claude Code**: `CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_SSE_PORT`
- **Replit AI**: `REPL_ID`, `REPL_OWNER`, `REPL_SLUG`, `REPL_LANGUAGE`, etc.
- **Aider**: `AIDER_API_KEY`, `AIDER_MODEL`, `AIDER_AUTO_COMMITS`, etc.

### Embedded IDE Features
- **Cursor**: `TERM_PROGRAM=cursor`, `EDITOR=cursor`
- **GitHub Copilot**: VS Code environment detection
- **Windsurf/Codeium**: Config file detection (`~/.codeium/windsurf/`)
- **Continue.dev**: Config file detection (`~/.continue/`)
- **Tabnine**: Process-based detection
- **JetBrains AI**: IDE environment detection

### Environment Variable Types
- **String**: Simple presence check (`'CLAUDECODE'`)
- **Tuple**: Name/value validation (`['TERM_PROGRAM', 'cursor']`)
- **Custom Detectors**: Complex filesystem/process checks

## Usage Examples

```typescript
import { detectAgenticEnvironment, isDirectAgent } from 'am-i-vibing';

// Full detection
const result = detectAgenticEnvironment();
console.log(`Detected: ${result.provider} (${result.type})`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Capabilities: ${result.capabilities.join(', ')}`);

// Quick checks
if (isDirectAgent()) {
  console.log('Running under direct AI agent control');
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
- Test confidence scoring across evidence types
- Test false positive scenarios
- Mock filesystem operations in custom detectors

### Evidence Quality Hierarchy
1. **Active Evidence**: Tuples, session variables, specific indicators
2. **Installation Evidence**: API keys, tokens, generic credentials
3. **Environment Evidence**: IDE processes, generic environment vars

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
- Demo packages: `@demo/package-name` (private)

### TypeScript Configuration
- ES2022 target with strict mode
- Module preservation for library packages
- Shared tsconfig.json at root with package-specific extensions

### Export Strategy
- ESM-only packages
- Explicit export maps in package.json
- Type-only imports/exports properly separated