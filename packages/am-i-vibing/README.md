# am-i-vibing

Detect agentic coding environments and AI assistant tools. This library allows CLI tools and applications to detect when they're being executed by AI agents (like Claude Code) and adapt their behavior accordingly.

## Installation

Install as library:

```bash
npm install am-i-vibing
```

Run as CLI tool:

```bash
npx am-i-vibing
```

## Supported AI Tools

- **Claude Code**
- **GitHub Copilot Agent**
- **Replit AI**
- **Aider**
- **Bolt.new**
- **Cursor**
- **Windsurf/Codeium**
- **Zed**
- **Warp**
- **Jules**

## CLI Usage

Use the CLI to quickly check if you're running in an agentic environment:

```bash
# Basic detection
npx am-i-vibing
# ✓ Detected: Claude Code (agent)

# JSON output
npx am-i-vibing --format json
# {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}

# Check for specific environment type
npx am-i-vibing --check agent
# ✓ Running in agent environment: Claude Code

npx am-i-vibing --check interactive
# ✗ Not running in interactive environment

# Quiet mode (useful for scripts)
npx am-i-vibing --quiet
# Claude Code

# Debug mode (full diagnostic output)
npx am-i-vibing --debug
# {"detection": {"isAgentic": true, "id": "claude-code", "name": "Claude Code", "type": "agent"}, "environment": {...}, "processAncestry": [...]}
```

### CLI Options

- `-f, --format <json|text>` - Output format (default: text)
- `-c, --check <agent|interactive|hybrid>` - Check for specific environment type
- `-q, --quiet` - Only output result, no labels
- `-d, --debug` - Debug output with environment and process info
- `-h, --help` - Show help message

### Exit Codes

- `0` - Agentic environment detected (or specific check passed)
- `1` - No agentic environment detected (or specific check failed)

## Library Usage

```typescript
import {
  detectAgenticEnvironment,
  isAgent,
  isInteractive,
  isHybrid,
} from "am-i-vibing";

// Full detection
const result = detectAgenticEnvironment();
console.log(`Detected: ${result.name} (${result.type})`);
console.log(`ID: ${result.id}`);
console.log(`Is agentic: ${result.isAgentic}`);

// Quick checks
if (isAgent()) {
  console.log("Running under direct AI agent control");
}

if (isInteractive()) {
  console.log("Running in interactive AI environment");
}

if (isHybrid()) {
  console.log("Running in hybrid AI environment");
}

// Note: Hybrid environments return true for both isAgent() and isInteractive()
```

## Detection Result

The library returns a `DetectionResult` object with the following structure:

```typescript
interface DetectionResult {
  isAgentic: boolean; // Whether any agentic environment was detected
  id: string | null; // Provider ID (e.g., "claude-code")
  name: string | null; // Human-readable name (e.g., "Claude Code")
  type: AgenticType | null; // "agent" | "interactive" | "hybrid"
}
```

## Environment Types

The library detects three main types of environments:

- **Agent**: Command was run by an AI agent (e.g., Claude Code, GitHub Copilot Agent)
- **Interactive**: Interactive commands run inside an AI environment (e.g., Cursor Terminal)
- **Hybrid**: Environments that combine both agentic and interactive features in the same session (e.g., Warp)

## Debug Output

The `--debug` flag provides comprehensive diagnostic information including:

- **detection**: Standard detection result (same as `--format json`)
- **environment**: Complete dump of `process.env` variables
- **processAncestry**: Process tree showing parent processes up to the root

This is useful for troubleshooting detection issues and understanding the runtime environment.

```bash
npx am-i-vibing --debug
# {
#   "detection": { ... },
#   "environment": { ... },
#   "processAncestry": [...]
# }
```

## License

MIT

Copyright © 2025 Matt Kane
