import { describe, it, expect } from "vitest";
import { providers, getProvider, getProvidersByType } from "../src/providers.js";

describe("providers", () => {
  it("should export provider configurations", () => {
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it("should include Claude Code provider", () => {
    const claudeCode = providers.find(p => p.name === "Claude Code");
    expect(claudeCode).toBeDefined();
    expect(claudeCode?.type).toBe("direct");
    expect(claudeCode?.envVars).toContain("ANTHROPIC_API_KEY");
  });

  it("should include Cursor provider", () => {
    const cursor = providers.find(p => p.name === "Cursor");
    expect(cursor).toBeDefined();
    expect(cursor?.type).toBe("embedded");
    expect(cursor?.capabilities).toContain("code_completion");
  });

  it("getProvider should return correct provider", () => {
    const claudeCode = getProvider("Claude Code");
    expect(claudeCode).toBeDefined();
    expect(claudeCode?.name).toBe("Claude Code");
    
    const nonExistent = getProvider("NonExistent");
    expect(nonExistent).toBeUndefined();
  });

  it("getProvidersByType should filter providers correctly", () => {
    const directProviders = getProvidersByType("direct");
    const embeddedProviders = getProvidersByType("embedded");
    
    expect(directProviders.length).toBeGreaterThan(0);
    expect(embeddedProviders.length).toBeGreaterThan(0);
    
    expect(directProviders.every(p => p.type === "direct")).toBe(true);
    expect(embeddedProviders.every(p => p.type === "embedded")).toBe(true);
  });
});
