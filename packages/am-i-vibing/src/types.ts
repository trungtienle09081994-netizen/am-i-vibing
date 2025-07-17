/**
 * The type of AI coding environment detected
 */
export type AgenticType = 'direct' | 'embedded' | 'hybrid';

/**
 * Environment variable definition - either just a name or a name/value tuple
 */
export type EnvVarDefinition = string | [string, string];

/**
 * Configuration for detecting a specific AI coding provider
 */
export interface ProviderConfig {
  /** Human-readable name of the provider */
  name: string;
  
  /** Type of AI coding environment */
  type: AgenticType;
  
  /** Environment variables that indicate this provider */
  envVars: EnvVarDefinition[];
  
  /** Process names to check for in the process tree */
  processChecks?: string[];
  
  /** Custom detection functions for complex logic */
  customDetectors?: (() => boolean)[];
  
  /** Known capabilities this provider exposes */
  capabilities?: string[];
}

/**
 * Evidence found during detection
 */
export interface DetectionEvidence {
  /** Type of evidence found */
  type: 'env_var' | 'process' | 'custom';
  
  /** Description of what was found */
  description: string;
  
  /** The actual value found (if safe to expose) */
  value?: string;
  
  /** Whether this indicates active usage vs just installation */
  indicates: 'active' | 'installed' | 'environment';
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
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Evidence that led to this detection */
  evidence: DetectionEvidence[];
  
  /** Known capabilities of the detected provider */
  capabilities: string[];
  
  /** Additional metadata about the detection */
  metadata: Record<string, unknown>;
}