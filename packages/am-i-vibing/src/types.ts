/**
 * The type of AI coding environment detected
 */
export type AgenticType = "agent" | "interactive" | "hybrid";

/**
 * Environment variable definition - either just a name or a name/value tuple
 */
export type EnvVarDefinition = string | [string, string];

/**
 * Logical operator for combining environment variable checks
 */
export type LogicalOperator = "any" | "all" | "not" | "count";

/**
 * Environment variable check group with logical operators
 */
export interface EnvVarCheckGroup {
  /** The logical operator to apply to the conditions */
  operator: LogicalOperator;

  /** The environment variables to check */
  conditions: EnvVarDefinition[];

  /** For 'count' operator: minimum number of conditions that must match */
  minCount?: number;

  /** Description for this group of checks */
  description?: string;

  /** Weight/importance of this group for confidence scoring */
  weight?: number;
}

/**
 * Simplified group interfaces for common patterns
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

  /** Environment variables that indicate this provider (legacy - treated as 'any' group) */
  envVars: EnvVarDefinition[];

  /** Environment variable groups with logical operators */
  envVarGroups?: EnvVarGroup[];

  /** Process names to check for in the process tree */
  processChecks?: string[];

  /** Custom detection functions for complex logic */
  customDetectors?: (() => boolean)[];
}

/**
 * Evidence found during detection
 */
export interface DetectionEvidence {
  /** Type of evidence found */
  type: "env_var" | "process" | "custom";

  /** Description of what was found */
  description: string;

  /** The actual value found (if safe to expose) */
  value?: string;
}

/**
 * Result of agentic environment detection
 */
export interface DetectionResult {
  /** Whether an agentic environment was detected */
  isAgentic: boolean;

  /** Name of the detected provider, if any */
  provider: string | null;

  /** Type of agentic environment, if detected */
  type: AgenticType | null;

  /** Evidence that led to this detection */
  evidence: DetectionEvidence[];

  /** Additional metadata about the detection */
  metadata: Record<string, unknown>;
}
