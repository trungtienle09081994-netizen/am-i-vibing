import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  detectAgenticEnvironment,
  isProvider,
  isAgent,
  isInteractive,
} from "../src/detector.js";

describe("detectAgenticEnvironment", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment and clear AI-related variables
    process.env = { ...originalEnv };

    // Clear common AI-related environment variables
    const aiEnvVars = [
      "CLAUDECODE",
      "CURSOR_TRACE_ID",
      "PAGER",
      "TERM_PROGRAM",
      "VSCODE_GIT_ASKPASS_NODE",
      "GIT_PAGER",
      "REPL_ID",
      "AIDER_API_KEY",
    ];

    for (const envVar of aiEnvVars) {
      delete process.env[envVar];
    }
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should detect no agentic environment by default", () => {
    const result = detectAgenticEnvironment();

    expect(result.isAgentic).toBe(false);
    expect(result.id).toBeNull();
    expect(result.name).toBeNull();
    expect(result.type).toBeNull();
  });

  it("should detect Claude Code environment", () => {
    const testEnv = { CLAUDECODE: "true" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("claude-code");
    expect(result.name).toBe("Claude Code");
    expect(result.type).toBe("agent");
  });

  it("should detect Cursor environment", () => {
    const testEnv = { CURSOR_TRACE_ID: "cursor-trace-123" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("cursor");
    expect(result.name).toBe("Cursor");
    expect(result.type).toBe("interactive");
  });

  it("should detect GitHub Copilot Agent environment", () => {
    const testEnv = {
      TERM_PROGRAM: "vscode",
      GIT_PAGER: "cat",
    };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("github-copilot-agent");
    expect(result.name).toBe("VS Code Copilot");
    expect(result.type).toBe("agent");
  });

  it("should detect GitHub Copilot (interactive) environment", () => {
    const testEnv = {
      CURSOR_TRACE_ID: "trace-123",
    };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("cursor");
    expect(result.name).toBe("Cursor");
    expect(result.type).toBe("interactive");
  });

  it("should detect Cursor Agent environment", () => {
    const testEnv = {
      CURSOR_TRACE_ID: "cursor-trace-123",
      PAGER: "head -n 10000 | cat",
    };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("cursor-agent");
    expect(result.name).toBe("Cursor Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Replit AI environment", () => {
    const testEnv = { REPL_ID: "repl-123" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("replit");
    expect(result.name).toBe("Replit");
    expect(result.type).toBe("agent");
  });

  it("should detect Aider environment", () => {
    const testEnv = { AIDER_API_KEY: "aider-key" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("aider");
    expect(result.name).toBe("Aider");
    expect(result.type).toBe("agent");
  });

  it("should detect Bolt.new Agent environment", () => {
    const testEnv = {
      SHELL: "/bin/jsh",
      npm_config_yes: "true",
    };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("bolt-agent");
    expect(result.name).toBe("Bolt.new Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Bolt.new interactive environment", () => {
    const testEnv = { SHELL: "/bin/jsh" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("bolt");
    expect(result.name).toBe("Bolt.new");
    expect(result.type).toBe("interactive");
  });

  it("should detect Zed Agent environment", () => {
    const testEnv = {
      TERM_PROGRAM: "zed",
      PAGER: "cat",
    };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("zed-agent");
    expect(result.name).toBe("Zed Agent");
    expect(result.type).toBe("agent");
  });

  it("should detect Zed interactive environment", () => {
    const testEnv = { TERM_PROGRAM: "zed" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(true);
    expect(result.id).toBe("zed");
    expect(result.name).toBe("Zed");
    expect(result.type).toBe("interactive");
  });

  it("should handle false positive scenarios", () => {
    const testEnv = { RANDOM_VARIABLE: "some-value" };
    const result = detectAgenticEnvironment(testEnv);

    expect(result.isAgentic).toBe(false);
  });

  it("should distinguish between agent and interactive variants", () => {
    // Test that Cursor Agent is detected before regular Cursor
    const agentEnv = {
      CURSOR_TRACE_ID: "cursor-trace-123",
      PAGER: "head -n 10000 | cat",
    };
    const result = detectAgenticEnvironment(agentEnv);

    expect(result.id).toBe("cursor-agent");
    expect(result.name).toBe("Cursor Agent");
    expect(result.type).toBe("agent");

    // Test regular Cursor
    const interactiveEnv = { CURSOR_TRACE_ID: "cursor-trace-123" };
    const result2 = detectAgenticEnvironment(interactiveEnv);

    expect(result2.id).toBe("cursor");
    expect(result2.name).toBe("Cursor");
    expect(result2.type).toBe("interactive");
  });

  it("should distinguish between Zed agent and interactive variants", () => {
    // Test that Zed Agent is detected before regular Zed
    const agentEnv = {
      TERM_PROGRAM: "zed",
      PAGER: "cat",
    };
    const result = detectAgenticEnvironment(agentEnv);

    expect(result.id).toBe("zed-agent");
    expect(result.name).toBe("Zed Agent");
    expect(result.type).toBe("agent");

    // Test regular Zed
    const interactiveEnv = { TERM_PROGRAM: "zed" };
    const result2 = detectAgenticEnvironment(interactiveEnv);

    expect(result2.id).toBe("zed");
    expect(result2.name).toBe("Zed");
    expect(result2.type).toBe("interactive");
  });
});

describe("convenience functions", () => {
  it("isAgent should identify agent environments", () => {
    const agentEnv = { CLAUDECODE: "true" };
    expect(isAgent(agentEnv)).toBe(true);

    const interactiveEnv = { CURSOR_TRACE_ID: "trace-123" };
    expect(isAgent(interactiveEnv)).toBe(false); // This should be interactive, not agent

    const cursorAgentEnv = {
      CURSOR_TRACE_ID: "trace-123",
      PAGER: "head -n 10000 | cat",
    };
    expect(isAgent(cursorAgentEnv)).toBe(true); // Now it's Cursor Agent
  });

  it("isInteractive should identify interactive environments", () => {
    const interactiveEnv = { CURSOR_TRACE_ID: "trace-123" };
    expect(isInteractive(interactiveEnv)).toBe(true);

    const copilotEnv = {
      CURSOR_TRACE_ID: "trace-123",
    };
    expect(isInteractive(copilotEnv)).toBe(true);
  });
});
