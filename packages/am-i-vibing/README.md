# am-i-vibing

Detect agentic coding environments and AI assistant tools. This library allows CLI tools and applications to detect when they're being executed by AI agents (like Claude Code) and adapt their behavior accordingly.

## Installation

```bash
npm install am-i-vibing
```

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
```

### CLI Options

- `-f, --format <json|text>` - Output format (default: text)
- `-c, --check <agent|interactive>` - Check for specific environment type
- `-q, --quiet` - Only output result, no labels
- `-h, --help` - Show help message

### Exit Codes

- `0` - Agentic environment detected (or specific check passed)
- `1` - No agentic environment detected (or specific check failed)

## Library Usage

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

## Detection Result

The library returns a `DetectionResult` object with the following structure:

```typescript
interface DetectionResult {
  isAgentic: boolean;    // Whether any agentic environment was detected
  id: string | null;     // Provider ID (e.g., "claude-code")
  name: string | null;   // Human-readable name (e.g., "Claude Code")
  type: AgenticType | null; // "agent" | "interactive" | "hybrid"
}
```

## Supported AI Tools

### Direct Agents (Full CLI control)
- **Claude Code** - Anthropic's official CLI tool
- **Replit AI** - Replit's AI assistant
- **Aider** - AI pair programming tool
- **Bolt.new** - AI-powered development environment

### Embedded IDE Features
- **Cursor** - AI-powered code editor
- **GitHub Copilot** - AI code completion
- **Windsurf/Codeium** - AI coding assistant
- **Continue.dev** - Open-source AI code assistant
- **Tabnine** - AI code completion
- **Zed** - High-performance editor with AI features

## Environment Types

- **Agent**: Full autonomous control over the terminal/CLI
- **Interactive**: AI assistance within an IDE or editor environment
- **Hybrid**: Tools that can operate in both modes

## Use Cases

- **CLI Tools**: Adapt behavior when running under AI control (e.g., provide more detailed output)
- **Development Scripts**: Skip interactive prompts when detected as automated
- **Testing**: Detect test environments vs. human usage
- **Analytics**: Track usage patterns across different AI tools
- **Documentation**: Generate context-aware help and examples

## Contributing

This project uses a monorepo structure with pnpm workspaces. See the main repository for contribution guidelines.

## License

MIT