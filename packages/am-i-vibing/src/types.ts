/**
 * The type of AI coding environment detected
 */
export type AgenticType = "agent" | "interactive" | "hybrid";

/**
 * Environment variable definition - either just a name or a name/value tuple
 */
export type EnvVarDefinition = string | [string, string];

/**
 * Environment variable group with logical operators
 */
export interface EnvVarGroup {
  /** ANY of these environment variables can match (OR logic) */
  any?: EnvVarDefinition[];

  /** ALL of these environment variables must match (AND logic) */
  all?: EnvVarDefinition[];

  /** NONE of these environment variables should be present (NOT logic) */
  none?: EnvVarDefinition[];
}

/**
 * Configuration for detecting a specific AI coding provider
 */
export interface ProviderConfig {
  /** Unique identifier for the provider */
  id: string;

  /** Human-readable name of the provider */
  name: string;

  /** Type of AI coding environment */
  type: AgenticType;

  /** Environment variables */
  envVars?: Array<EnvVarGroup | EnvVarDefinition>;

  /** Process names to check for in the process tree */
  processChecks?: string[];

  /** Custom detection functions for complex logic */
  customDetectors?: (() => boolean)[];
}

/**
 * Result of agentic environment detection
 */
export interface DetectionResult {
  /** Whether an agentic environment was detected */
  isAgentic: boolean;

  /** ID of the detected provider, if any */
  id: string | null;

  /** Name of the detected provider, if any */
  name: string | null;

  /** Type of agentic environment, if detected */
  type: AgenticType | null;
}
