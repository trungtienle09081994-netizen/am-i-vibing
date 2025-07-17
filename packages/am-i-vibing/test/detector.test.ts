import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectAgenticEnvironment, isProvider, isDirectAgent, isEmbeddedAgent, getCapabilities } from "../src/detector.js";

describe("detectAgenticEnvironment", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment and clear AI-related variables
    process.env = { ...originalEnv };
    
    // Clear common AI-related environment variables
    const aiEnvVars = [
      'CLAUDE_CODE_ENABLE_TELEMETRY', 'ANTHROPIC_API_KEY', 'OTEL_METRICS_EXPORTER',
      'CURSOR_API_KEY', 'CURSOR_USER_ID', 'CURSOR_SESSION_ID',
      'GITHUB_COPILOT_TOKEN', 'GITHUB_TOKEN', 'COPILOT_API_KEY',
      'REPLIT_AI_TOKEN', 'REPLIT_DB_URL', 'REPLIT_ENVIRONMENT', 'REPLIT',
      'REPL_SLUG', 'REPL_OWNER',
      'CODEIUM_API_KEY', 'DEBUG_CODEIUM', 'WINDSURF_API_KEY',
      'CONTINUE_API_KEY', 'CONTINUE_MODEL_API_KEY',
      'OPENAI_API_KEY', 'DEEPSEEK_API_KEY', 'OPENROUTER_API_KEY',
      'AIDER_API_KEY', 'AIDER_SESSION', 'AIDER_GIT_DIFFS',
      'TABNINE_API_KEY', 'TABNINE_TOKEN', 'TABNINE_ENABLED',
      'BOLT_API_KEY', 'STACKBLITZ_API_KEY', 'WEBCONTAINER', 'STACKBLITZ_ENV',
      'JETBRAINS_AI_TOKEN', 'IDEA_AI_ASSISTANT_TOKEN', 'JETBRAINS_IDE', 'IDEA_PROPERTIES',
      'TERM_PROGRAM', 'VSCODE_GIT_ASKPASS_NODE', 'VSCODE_GIT_ASKPASS_EXTRA_ARGS',
      'EDITOR', 'CODEIUM_ENABLED'
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
    // Clear all potential AI-related env vars
    delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CURSOR_API_KEY;
    delete process.env.GITHUB_COPILOT_TOKEN;
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(false);
    expect(result.provider).toBeNull();
    expect(result.type).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.evidence).toHaveLength(0);
    expect(result.capabilities).toHaveLength(0);
  });

  it("should detect Claude Code environment", () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "true";
    process.env.ANTHROPIC_API_KEY = "sk-test-key";
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(true);
    expect(result.provider).toBe("Claude Code");
    expect(result.type).toBe("direct");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.capabilities).toContain("file_editing");
    expect(result.capabilities).toContain("mcp_servers");
  });

  it("should detect Cursor environment", () => {
    process.env.CURSOR_API_KEY = "cursor-key";
    process.env.TERM_PROGRAM = "cursor";
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(true);
    expect(result.provider).toBe("Cursor");
    expect(result.type).toBe("embedded");
    expect(result.capabilities).toContain("code_completion");
    expect(result.capabilities).toContain("chat");
    
    // Should have evidence for TERM_PROGRAM=cursor tuple
    const termProgramEvidence = result.evidence.find(e => e.description.includes("TERM_PROGRAM is set to cursor"));
    expect(termProgramEvidence).toBeDefined();
    expect(termProgramEvidence?.indicates).toBe("active");
  });

  it("should detect GitHub Copilot environment", () => {
    process.env.GITHUB_COPILOT_TOKEN = "gho_token";
    process.env.GITHUB_COPILOT_CHAT_ENABLED = "true";
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(true);
    expect(result.provider).toBe("GitHub Copilot");
    expect(result.type).toBe("embedded");
    expect(result.capabilities).toContain("agent_mode");
    
    // Should have evidence for GITHUB_COPILOT_CHAT_ENABLED=true tuple
    const chatEnabledEvidence = result.evidence.find(e => e.description.includes("GITHUB_COPILOT_CHAT_ENABLED is set to true"));
    expect(chatEnabledEvidence).toBeDefined();
    expect(chatEnabledEvidence?.indicates).toBe("active");
  });

  it("should detect Replit AI environment", () => {
    process.env.REPLIT = "true";
    process.env.REPL_SLUG = "my-repl";
    process.env.REPL_OWNER = "username";
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(true);
    expect(result.provider).toBe("Replit AI");
    expect(result.type).toBe("direct");
    expect(result.capabilities).toContain("cloud_execution");
    
    // Should have evidence for REPLIT=true tuple
    const replitEvidence = result.evidence.find(e => e.description.includes("REPLIT is set to true"));
    expect(replitEvidence).toBeDefined();
    expect(replitEvidence?.indicates).toBe("active");
  });

  it("should detect Aider environment", () => {
    process.env.AIDER_SESSION = "true";
    
    const result = detectAgenticEnvironment();
    
    expect(result.isAgentic).toBe(true);
    expect(result.provider).toBe("Aider");
    expect(result.type).toBe("direct");
    expect(result.capabilities).toContain("git_integration");
    expect(result.capabilities).toContain("auto_commits");
    
    // Should have evidence for AIDER_SESSION=true tuple
    const sessionEvidence = result.evidence.find(e => e.description.includes("AIDER_SESSION is set to true"));
    expect(sessionEvidence).toBeDefined();
    expect(sessionEvidence?.indicates).toBe("active");
  });

  it("should redact sensitive environment variables", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-sensitive-key";
    
    const result = detectAgenticEnvironment();
    
    const envEvidence = result.evidence.find(e => e.type === "env_var");
    expect(envEvidence?.value).toBe("[REDACTED]");
    expect(envEvidence?.indicates).toBe("installed"); // API keys indicate installation, not active usage
  });

  it("should calculate confidence scores correctly", () => {
    // Single environment variable (active indicator)
    process.env.CURSOR_ENABLED = "true";
    let result = detectAgenticEnvironment();
    expect(result.confidence).toBeGreaterThan(0.4); // Should get bonus for active evidence
    
    // Multiple evidence sources
    process.env.CURSOR_API_KEY = "cursor-key";
    result = detectAgenticEnvironment();
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("should handle false positive scenarios", () => {
    // Generic GitHub token shouldn't detect Copilot
    process.env.GITHUB_TOKEN = "ghp_generic_token";
    
    const result = detectAgenticEnvironment();
    
    // Should not detect GitHub Copilot without specific Copilot indicators
    expect(result.provider).not.toBe("GitHub Copilot");
    expect(result.isAgentic).toBe(false);
  });

  it("should distinguish between installed and active tools", () => {
    // API key alone without enabled flag shouldn't be enough
    process.env.TABNINE_API_KEY = "tabnine-key";
    
    const result = detectAgenticEnvironment();
    
    // Should have low confidence or not detect without enabled flag
    if (result.provider === "Tabnine") {
      expect(result.confidence).toBeLessThan(0.5);
    } else {
      expect(result.isAgentic).toBe(false);
    }
  });

  it("should properly validate tuple environment variables", () => {
    // Setting TERM_PROGRAM to wrong value should have lower confidence
    process.env.TERM_PROGRAM = "vscode";
    process.env.CURSOR_API_KEY = "cursor-key";
    
    const result = detectAgenticEnvironment();
    
    // Should detect Cursor but with low confidence (API key only)
    expect(result.provider).toBe("Cursor");
    expect(result.confidence).toBeLessThan(0.2); // Low confidence
    
    // Now set it to correct value
    process.env.TERM_PROGRAM = "cursor";
    const result2 = detectAgenticEnvironment();
    
    // Should now have higher confidence with tuple match
    expect(result2.provider).toBe("Cursor");
    expect(result2.confidence).toBeGreaterThan(0.4); // Higher confidence
    expect(result2.isAgentic).toBe(true);
  });

  it("should include metadata in results", () => {
    const result = detectAgenticEnvironment();
    
    expect(result.metadata).toHaveProperty("totalProvidersChecked");
    expect(result.metadata).toHaveProperty("providersWithEvidence");
    expect(result.metadata).toHaveProperty("detectionTimestamp");
    expect(typeof result.metadata.totalProvidersChecked).toBe("number");
    expect(typeof result.metadata.providersWithEvidence).toBe("number");
    expect(typeof result.metadata.detectionTimestamp).toBe("string");
  });
});

describe("convenience functions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isProvider should correctly identify specific providers", () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "true";
    
    expect(isProvider("Claude Code")).toBe(true);
    expect(isProvider("Cursor")).toBe(false);
    expect(isProvider("NonExistent")).toBe(false);
  });

  it("isDirectAgent should identify direct agents", () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "true";
    expect(isDirectAgent()).toBe(true);
    
    delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
    process.env.CURSOR_API_KEY = "cursor-key";
    expect(isDirectAgent()).toBe(false);
  });

  it("isEmbeddedAgent should identify embedded agents", () => {
    process.env.CURSOR_API_KEY = "cursor-key";
    expect(isEmbeddedAgent()).toBe(true);
    
    delete process.env.CURSOR_API_KEY;
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "true";
    expect(isEmbeddedAgent()).toBe(false);
  });

  it("getCapabilities should return current environment capabilities", () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "true";
    const capabilities = getCapabilities();
    
    expect(capabilities).toContain("file_editing");
    expect(capabilities).toContain("mcp_servers");
    expect(capabilities).toContain("command_execution");
  });
});