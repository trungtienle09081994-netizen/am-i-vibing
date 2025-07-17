import type { DetectionResult, DetectionEvidence, ProviderConfig, EnvVarDefinition } from './types.js';
import { providers } from './providers.js';

/**
 * Check if a specific environment variable exists (handles both strings and tuples)
 */
function checkEnvVar(envVarDef: EnvVarDefinition): DetectionEvidence | null {
  let envVar: string;
  let expectedValue: string | undefined;
  
  // Handle both string and tuple formats
  if (typeof envVarDef === 'string') {
    envVar = envVarDef;
    expectedValue = undefined;
  } else {
    [envVar, expectedValue] = envVarDef;
  }
  
  const actualValue = process.env[envVar];
  
  // Check if environment variable exists
  if (!actualValue) {
    return null;
  }
  
  // If we have an expected value, check if it matches
  if (expectedValue && actualValue !== expectedValue) {
    return null;
  }
  
  // Determine if this env var indicates active usage or just installation
  const isActiveIndicator = envVar.includes('ENABLED') || 
                           envVar.includes('ACTIVE') || 
                           envVar.includes('SESSION') ||
                           envVar.includes('CHAT_ENABLED') ||
                           envVar.includes('EXTENSION_VERSION') ||
                           expectedValue !== undefined; // Having an expected value makes it more specific
  
  // Generic API keys and tokens are less reliable indicators
  const isGenericCredential = envVar.includes('TOKEN') || envVar.includes('API_KEY');
  
  const displayValue = expectedValue 
    ? `${envVar}=${expectedValue}`
    : (envVar.toLowerCase().includes('key') || envVar.toLowerCase().includes('token') 
       ? '[REDACTED]' 
       : actualValue);
  
  return {
    type: 'env_var',
    description: expectedValue 
      ? `Environment variable ${envVar} is set to ${expectedValue}`
      : `Environment variable ${envVar} is set`,
    value: displayValue,
    indicates: isActiveIndicator ? 'active' : (isGenericCredential ? 'installed' : 'environment')
  };
}

/**
 * Check if a process is running in the process tree
 */
function checkProcess(processName: string): DetectionEvidence | null {
  try {
    // Simple process check - in a real implementation, you'd want to
    // traverse the process tree more thoroughly
    if (process.argv0?.includes(processName) || 
        process.title?.includes(processName) ||
        process.env.npm_lifecycle_script?.includes(processName)) {
      
      // AI-specific processes are more likely to indicate active usage
      const isAiProcess = processName.includes('ai') || 
                         processName.includes('copilot') ||
                         processName.includes('claude') ||
                         processName.includes('aider');
      
      return {
        type: 'process',
        description: `Process ${processName} detected`,
        value: processName,
        indicates: isAiProcess ? 'active' : 'installed'
      };
    }
  } catch (error) {
    // Ignore process check errors
  }
  return null;
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
          type: 'custom',
          description: `Custom detector for ${provider.name} returned true`,
          indicates: 'active' // Custom detectors are designed to be more specific
        });
      }
    } catch (error) {
      // Ignore custom detector errors
    }
  }
  
  return evidence;
}

/**
 * Calculate confidence score based on evidence
 */
function calculateConfidence(evidence: DetectionEvidence[]): number {
  if (evidence.length === 0) return 0;
  
  let score = 0;
  let hasActiveEvidence = false;
  
  for (const ev of evidence) {
    // Weight scores heavily based on what the evidence indicates
    let baseScore = 0;
    
    switch (ev.type) {
      case 'env_var':
        baseScore = 0.4;
        break;
      case 'process':
        baseScore = 0.3;
        break;
      case 'custom':
        baseScore = 0.5; // Custom detectors are now more reliable
        break;
    }
    
    // Apply multiplier based on what the evidence indicates
    switch (ev.indicates) {
      case 'active':
        score += baseScore * 1.0; // Full weight for active usage
        hasActiveEvidence = true;
        break;
      case 'installed':
        score += baseScore * 0.3; // Much lower weight for just installation
        break;
      case 'environment':
        score += baseScore * 0.2; // Lowest weight for environment detection
        break;
    }
  }
  
  // Bonus for having any active evidence
  if (hasActiveEvidence) {
    score += 0.1;
  }
  
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Detect agentic coding environment
 */
export function detectAgenticEnvironment(): DetectionResult {
  const allEvidence: Map<string, DetectionEvidence[]> = new Map();
  
  // Test each provider
  for (const provider of providers) {
    const evidence: DetectionEvidence[] = [];
    
    // Check environment variables
    for (const envVar of provider.envVars) {
      const envEvidence = checkEnvVar(envVar);
      if (envEvidence) {
        evidence.push(envEvidence);
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
  
  // Find the provider with the highest confidence
  let bestProvider: ProviderConfig | null = null;
  let bestEvidence: DetectionEvidence[] = [];
  let bestConfidence = 0;
  
  for (const [providerName, evidence] of allEvidence) {
    const confidence = calculateConfidence(evidence);
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestProvider = providers.find(p => p.name === providerName) || null;
      bestEvidence = evidence;
    }
  }
  
  // Return results
  return {
    isAgentic: bestProvider !== null,
    provider: bestProvider?.name || null,
    type: bestProvider?.type || null,
    confidence: bestConfidence,
    evidence: bestEvidence,
    capabilities: bestProvider?.capabilities || [],
    metadata: {
      totalProvidersChecked: providers.length,
      providersWithEvidence: allEvidence.size,
      detectionTimestamp: new Date().toISOString()
    }
  };
}

/**
 * Check if currently running in a specific provider
 */
export function isProvider(providerName: string): boolean {
  const result = detectAgenticEnvironment();
  return result.provider === providerName;
}

/**
 * Check if currently running in any direct agentic environment
 */
export function isDirectAgent(): boolean {
  const result = detectAgenticEnvironment();
  return result.type === 'direct';
}

/**
 * Check if currently running in any embedded agentic environment
 */
export function isEmbeddedAgent(): boolean {
  const result = detectAgenticEnvironment();
  return result.type === 'embedded';
}

/**
 * Get available capabilities in current environment
 */
export function getCapabilities(): string[] {
  const result = detectAgenticEnvironment();
  return result.capabilities;
}