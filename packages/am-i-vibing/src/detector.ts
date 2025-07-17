import type {
  DetectionResult,
  DetectionEvidence,
  ProviderConfig,
  EnvVarDefinition,
  EnvVarGroup,
} from "./types.js";
import { providers } from "./providers.js";

/**
 * Check if a specific environment variable exists (handles both strings and tuples)
 */
function checkEnvVar(
  envVarDef: EnvVarDefinition,
  env: Record<string, string | undefined> = process.env,
): DetectionEvidence | null {
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
    return null;
  }

  // If we have an expected value, check if it matches
  if (expectedValue && actualValue !== expectedValue) {
    return null;
  }

  const displayValue = expectedValue
    ? `${envVar}=${expectedValue}`
    : envVar.toLowerCase().includes("key") ||
        envVar.toLowerCase().includes("token")
      ? "[REDACTED]"
      : actualValue;

  return {
    type: "env_var",
    description: expectedValue
      ? `Environment variable ${envVar} is set to ${expectedValue}`
      : `Environment variable ${envVar} is set`,
    value: displayValue,
  };
}

/**
 * Check if a process is running in the process tree
 */
function checkProcess(processName: string): DetectionEvidence | null {
  try {
    // Simple process check - in a real implementation, you'd want to
    // traverse the process tree more thoroughly
    if (
      process.argv0?.includes(processName) ||
      process.title?.includes(processName) ||
      process.env.npm_lifecycle_script?.includes(processName)
    ) {
      // AI-specific processes are more likely to indicate active usage
      const isAiProcess =
        processName.includes("ai") ||
        processName.includes("copilot") ||
        processName.includes("claude") ||
        processName.includes("aider");

      return {
        type: "process",
        description: `Process ${processName} detected`,
        value: processName,
      };
    }
  } catch (error) {
    // Ignore process check errors
  }
  return null;
}

/**
 * Check if an environment variable group matches based on its properties
 */
function checkEnvVarGroup(
  group: EnvVarGroup,
  env: Record<string, string | undefined> = process.env,
): DetectionEvidence | null {
  const results: { type: string; passed: boolean; details: string[] }[] = [];

  // Check ANY conditions (OR logic)
  if (group.any && group.any.length > 0) {
    let anyPassed = false;
    const anyDetails: string[] = [];

    for (const envVarDef of group.any) {
      const evidence = checkEnvVar(envVarDef, env);
      if (evidence) {
        anyPassed = true;
        anyDetails.push(evidence.value || "set");
        break; // Only need one to pass for ANY
      }
    }

    results.push({
      type: "any",
      passed: anyPassed,
      details: anyDetails,
    });
  }

  // Check ALL conditions (AND logic)
  if (group.all && group.all.length > 0) {
    let allPassed = true;
    const allDetails: string[] = [];

    for (const envVarDef of group.all) {
      const evidence = checkEnvVar(envVarDef, env);
      if (!evidence) {
        allPassed = false;
        break;
      }
      allDetails.push(evidence.value || "set");
    }

    results.push({
      type: "all",
      passed: allPassed,
      details: allDetails,
    });
  }

  // Check NONE conditions (NOT logic)
  if (group.none && group.none.length > 0) {
    let nonePassed = true;

    for (const envVarDef of group.none) {
      const evidence = checkEnvVar(envVarDef, env);
      if (evidence) {
        nonePassed = false;
        break;
      }
    }

    results.push({
      type: "none",
      passed: nonePassed,
      details: ["none found (as expected)"],
    });
  }

  // Check if all required conditions passed
  const allConditionsPassed = results.every((result) => result.passed);

  if (!allConditionsPassed) {
    return null;
  }

  // Build description and value
  const allDetails = results.flatMap((result) => result.details);
  const description = `Environment variable group matched: ${results.map((r) => r.type).join(" + ")}`;

  return {
    type: "env_var",
    description,
    value: allDetails.join(", "),
  };
}

/**
 * Run custom detectors for a provider
 */
function runCustomDetectors(provider: ProviderConfig): DetectionEvidence[] {
  if (!provider.customDetectors) return [];

  const evidence: DetectionEvidence[] = [];

  for (const detector of provider.customDetectors) {
    try {
      if (detector()) {
        evidence.push({
          type: "custom",
          description: `Custom detector for ${provider.name} returned true`,
        });
      }
    } catch (error) {
      // Ignore custom detector errors
    }
  }

  return evidence;
}

/**
 * Detect agentic coding environment
 */
export function detectAgenticEnvironment(
  env: Record<string, string | undefined> = process.env,
): DetectionResult {
  const allEvidence: Map<string, DetectionEvidence[]> = new Map();

  // Test each provider
  for (const provider of providers) {
    const evidence: DetectionEvidence[] = [];

    // Check environment variables (legacy - treated as ANY)
    for (const envVar of provider.envVars) {
      const envEvidence = checkEnvVar(envVar, env);
      if (envEvidence) {
        evidence.push(envEvidence);
      }
    }

    // Check environment variable groups
    if (provider.envVarGroups) {
      for (const group of provider.envVarGroups) {
        const groupEvidence = checkEnvVarGroup(group, env);
        if (groupEvidence) {
          evidence.push(groupEvidence);
        }
      }
    }

    // Check processes
    if (provider.processChecks) {
      for (const processName of provider.processChecks) {
        const processEvidence = checkProcess(processName);
        if (processEvidence) {
          evidence.push(processEvidence);
        }
      }
    }

    // Run custom detectors
    evidence.push(...runCustomDetectors(provider));

    if (evidence.length > 0) {
      allEvidence.set(provider.name, evidence);
    }
  }

  // Find the first provider with evidence (order matters!)
  let detectedProvider: ProviderConfig | null = null;
  let detectedEvidence: DetectionEvidence[] = [];

  for (const [providerName, evidence] of allEvidence) {
    // Since providers are ordered by specificity, take the first match
    detectedProvider = providers.find((p) => p.name === providerName) || null;
    detectedEvidence = evidence;
    break;
  }

  // Return results
  return {
    isAgentic: detectedProvider !== null,
    provider: detectedProvider?.name || null,
    type: detectedProvider?.type || null,
    evidence: detectedEvidence,
    metadata: {
      totalProvidersChecked: providers.length,
      providersWithEvidence: allEvidence.size,
      detectionTimestamp: new Date().toISOString(),
    },
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
