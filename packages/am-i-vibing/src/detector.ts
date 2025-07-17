import type {
  DetectionResult,
  ProviderConfig,
  EnvVarDefinition,
  EnvVarGroup,
} from "./types.js";
import { providers } from "./providers.js";
import { getProcessAncestry } from "process-ancestry";

/**
 * Check if a specific environment variable exists (handles both strings and tuples)
 */
function checkEnvVar(
  envVarDef: EnvVarDefinition,
  env: Record<string, string | undefined> = process.env,
): boolean {
  let envVar: string;
  let expectedValue: string | undefined;

  // Handle both string and tuple formats
  if (typeof envVarDef === "string") {
    envVar = envVarDef;
    expectedValue = undefined;
  } else {
    [envVar, expectedValue] = envVarDef;
  }

  const actualValue = env[envVar];

  // Check if environment variable exists
  if (!actualValue) {
    return false;
  }

  // If we have an expected value, check if it matches
  if (expectedValue && actualValue !== expectedValue) {
    return false;
  }

  return true;
}

/**
 * Check if a process is running in the process tree
 */
function checkProcess(processName: string): boolean {
  try {
    // Check the current process first
    if (
      process.argv0?.includes(processName) ||
      process.title?.includes(processName) ||
      process.env.npm_lifecycle_script?.includes(processName)
    ) {
      return true;
    }

    // Use process-ancestry to check the process tree
    const ancestry = getProcessAncestry();
    for (const ancestorProcess of ancestry) {
      if (ancestorProcess.command?.includes(processName)) {
        return true;
      }
    }
  } catch (error) {
    // Ignore process check errors
  }
  return false;
}

/**
 * Check if an environment variable group matches based on its properties
 */
function checkEnvVarGroup(
  group: EnvVarGroup,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const results: { type: string; passed: boolean }[] = [];

  // Check ANY conditions (OR logic)
  if (group.any && group.any.length > 0) {
    let anyPassed = false;

    for (const envVarDef of group.any) {
      if (checkEnvVar(envVarDef, env)) {
        anyPassed = true;
        break; // Only need one to pass for ANY
      }
    }

    results.push({
      type: "any",
      passed: anyPassed,
    });
  }

  // Check ALL conditions (AND logic)
  if (group.all && group.all.length > 0) {
    let allPassed = true;

    for (const envVarDef of group.all) {
      if (!checkEnvVar(envVarDef, env)) {
        allPassed = false;
        break;
      }
    }

    results.push({
      type: "all",
      passed: allPassed,
    });
  }

  // Check NONE conditions (NOT logic)
  if (group.none && group.none.length > 0) {
    let nonePassed = true;

    for (const envVarDef of group.none) {
      if (checkEnvVar(envVarDef, env)) {
        nonePassed = false;
        break;
      }
    }

    results.push({
      type: "none",
      passed: nonePassed,
    });
  }

  // Check if all required conditions passed
  return results.every((result) => result.passed);
}

/**
 * Run custom detectors for a provider
 */
function runCustomDetectors(provider: ProviderConfig): boolean {
  if (!provider.customDetectors) return false;

  for (const detector of provider.customDetectors) {
    try {
      if (detector()) {
        return true;
      }
    } catch (error) {
      // Ignore custom detector errors
    }
  }

  return false;
}

/**
 * Detect agentic coding environment
 */
export function detectAgenticEnvironment(
  env: Record<string, string | undefined> = process.env,
): DetectionResult {
  // Test each provider in order of specificity
  for (const provider of providers) {
    // Check environment variables (legacy - treated as ANY)
    for (const envVar of provider.envVars) {
      if (checkEnvVar(envVar, env)) {
        return {
          isAgentic: true,
          provider: provider.name,
          type: provider.type,
        };
      }
    }
    // Check environment variable groups
    if (provider.envVarGroups) {
      for (const group of provider.envVarGroups) {
        if (checkEnvVarGroup(group, env)) {
          return {
            isAgentic: true,
            provider: provider.name,
            type: provider.type,
          };
        }
      }
    }

    // Check processes
    if (provider.processChecks) {
      for (const processName of provider.processChecks) {
        if (checkProcess(processName)) {
          return {
            isAgentic: true,
            provider: provider.name,
            type: provider.type,
          };
        }
      }
    }

    // Run custom detectors
    if (runCustomDetectors(provider)) {
      return {
        isAgentic: true,
        provider: provider.name,
        type: provider.type,
      };
    }
  }

  // No provider detected
  return {
    isAgentic: false,
    provider: null,
    type: null,
  };
}

/**
 * Check if currently running in a specific provider
 */
export function isProvider(
  providerName: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const result = detectAgenticEnvironment(env);
  return result.provider === providerName;
}

/**
 * Check if currently running in any agent environment
 */
export function isAgent(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const result = detectAgenticEnvironment(env);
  return result.type === "agent";
}

/**
 * Check if currently running in any interactive AI environment
 */
export function isInteractive(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const result = detectAgenticEnvironment(env);
  return result.type === "interactive";
}

/**
 * Get available capabilities in current environment
 */
