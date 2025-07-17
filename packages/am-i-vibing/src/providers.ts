import type { ProviderConfig } from "./types.js";

/**
 * Provider configurations for major AI coding tools
 */
export const providers: ProviderConfig[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    type: "agent",
    envVars: ["CLAUDECODE"],
  },
  {
    id: "cursor-agent",
    name: "Cursor Agent",
    type: "agent",
    envVars: [],
    envVarGroups: [
      {
        all: ["CURSOR_TRACE_ID", ["PAGER", "head -n 10000 | cat"]],
      },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    type: "interactive",
    envVars: ["CURSOR_TRACE_ID"],
  },
  {
    id: "gemini-agent",
    name: "Gemini Agent",
    type: "agent",
    envVars: [],
    processChecks: ["gemini"],
  },
  {
    id: "replit",
    name: "Replit",
    type: "agent",
    envVars: ["REPL_ID"],
  },
  {
    id: "aider",
    name: "Aider",
    type: "agent",
    envVars: ["AIDER_API_KEY"],
    processChecks: ["aider"],
  },
  {
    id: "bolt-agent",
    name: "Bolt.new Agent",
    type: "agent",
    envVars: [],
    envVarGroups: [
      {
        all: [["SHELL", "/bin/jsh"], "npm_config_yes"],
      },
    ],
  },
  {
    id: "bolt",
    name: "Bolt.new",
    type: "interactive",
    envVars: [],
    envVarGroups: [
      {
        all: [["SHELL", "/bin/jsh"]],
        none: ["npm_config_yes"],
      },
    ],
  },
  {
    id: "zed-agent",
    name: "Zed Agent",
    type: "agent",
    envVars: [],
    envVarGroups: [
      {
        all: [
          ["TERM_PROGRAM", "zed"],
          ["PAGER", "cat"],
        ],
      },
    ],
  },
  {
    id: "zed",
    name: "Zed",
    type: "interactive",
    envVars: [],
    envVarGroups: [
      {
        all: [["TERM_PROGRAM", "zed"]],
        none: [["PAGER", "cat"]],
      },
    ],
  },
  {
    id: "replit-assistant",
    name: "Replit Assistant",
    type: "agent",
    envVars: [],
    envVarGroups: [
      {
        all: ["REPL_ID", ["REPLIT_MODE", "assistant"]],
      },
    ],
  },
  {
    id: "replit",
    name: "Replit",
    type: "interactive",
    envVars: [],
    envVarGroups: [
      {
        all: ["REPL_ID"],
        none: [["REPLIT_MODE", "assistant"]],
      },
    ],
  },
  {
    id: "github-copilot-agent",
    name: "VS Code Copilot",
    type: "agent",
    envVars: [],
    envVarGroups: [
      {
        all: [
          ["TERM_PROGRAM", "vscode"],
          ["GIT_PAGER", "cat"],
        ],
      },
    ],
  },
];

/**
 * Get provider configuration by name
 */
export function getProvider(name: string): ProviderConfig | undefined {
  return providers.find((p) => p.name === name);
}

/**
 * Get all providers of a specific type
 */
export function getProvidersByType(
  type: "agent" | "interactive",
): ProviderConfig[] {
  return providers.filter((p) => p.type === type);
}
