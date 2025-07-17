import type { ProviderConfig } from './types.js';

/**
 * Provider configurations for major AI coding tools
 */
export const providers: ProviderConfig[] = [
  {
    name: 'Claude Code',
    type: 'direct',
    envVars: [
      'CLAUDECODE', // Real env var that exists when running Claude Code
      'CLAUDE_CODE_ENTRYPOINT',
      'CLAUDE_CODE_SSE_PORT'
    ],
    capabilities: ['file_editing', 'command_execution', 'git_operations', 'mcp_servers']
  },
  {
    name: 'Cursor',
    type: 'embedded',
    envVars: [
      ['TERM_PROGRAM', 'cursor'], // Real env var set by Cursor terminal
      ['EDITOR', 'cursor']
    ],
    capabilities: ['code_completion', 'chat', 'file_editing']
  },
  {
    name: 'GitHub Copilot',
    type: 'embedded',
    envVars: [
      // GitHub Copilot doesn't use env vars for detection - uses VS Code settings
      // Detection should be done through VS Code process + settings files
    ],
    capabilities: ['code_completion', 'chat', 'agent_mode'],
    customDetectors: [
      () => {
        // Only detect if we're in VS Code environment
        return process.env.TERM_PROGRAM === 'vscode' && 
               process.env.VSCODE_GIT_ASKPASS_NODE !== undefined;
      }
    ]
  },
  {
    name: 'Replit AI',
    type: 'direct',
    envVars: [
      'REPL_ID', // Real env var - automatically set by Replit
      'REPL_OWNER', // Real env var - automatically set by Replit
      'REPL_SLUG', // Real env var - automatically set by Replit
      'REPL_LANGUAGE', // Real env var - automatically set by Replit
      'REPLIT_DEV_DOMAIN', // Real env var - automatically set by Replit
      'REPLIT_DB_URL' // Real env var - automatically set by Replit
    ],
    capabilities: ['cloud_execution', 'environment_injection', 'containerization']
  },
  {
    name: 'Windsurf (Codeium)',
    type: 'embedded',
    envVars: [
      // Windsurf uses MCP configuration files, not env vars for detection
      // Detection should be based on process or config files
    ],
    capabilities: ['code_completion', 'ast_analysis', 'similarity_detection'],
    customDetectors: [
      () => {
        // Check for Windsurf process or config directory
        try {
          const homeDir = process.env.HOME || process.env.USERPROFILE;
          if (homeDir) {
            const fs = require('fs');
            const path = require('path');
            const configPath = path.join(homeDir, '.codeium', 'windsurf');
            return fs.existsSync(configPath);
          }
        } catch {
          // Ignore filesystem errors
        }
        return false;
      }
    ]
  },
  {
    name: 'Continue.dev',
    type: 'embedded',
    envVars: [
      // Continue.dev uses config files, not env vars for detection
    ],
    capabilities: ['context_providers', 'mcp_integration', 'chat'],
    customDetectors: [
      () => {
        // Check for Continue.dev config
        try {
          const homeDir = process.env.HOME || process.env.USERPROFILE;
          if (homeDir) {
            const fs = require('fs');
            const path = require('path');
            const configPath = path.join(homeDir, '.continue');
            return fs.existsSync(configPath);
          }
        } catch {
          // Ignore filesystem errors
        }
        return false;
      }
    ]
  },
  {
    name: 'Aider',
    type: 'direct',
    envVars: [
      // Real Aider environment variables from official docs
      'AIDER_API_KEY',
      'AIDER_MODEL',
      'AIDER_AUTO_COMMITS',
      'AIDER_GIT',
      'AIDER_ANALYTICS',
      'AIDER_DARK_MODE',
      'AIDER_CACHE_PROMPTS'
    ],
    processChecks: ['aider'], // Keep this one since it's a CLI tool
    capabilities: ['git_integration', 'auto_commits', 'repository_mapping', 'testing_integration']
  },
  {
    name: 'Tabnine',
    type: 'embedded',
    envVars: [
      // Tabnine doesn't use env vars for detection - uses IDE settings
      // Detection should be based on process or config files
    ],
    capabilities: ['code_completion', 'multi_language_support'],
    processChecks: ['tabnine'] // Most reliable detection method
  },
  {
    name: 'Bolt.new',
    type: 'direct',
    envVars: [
      // Bolt.new/StackBlitz detection should be based on WebContainer environment
      // These are likely guessed variables
    ],
    capabilities: ['webcontainer', 'browser_execution', 'filesystem_control'],
    customDetectors: [
      () => {
        // Check for WebContainer/StackBlitz environment
        try {
          const globalWindow = (globalThis as any).window;
          return globalWindow && 
                 (globalWindow.location?.hostname?.includes('stackblitz') ||
                  globalWindow.location?.hostname?.includes('bolt.new'));
        } catch {
          return false;
        }
      }
    ]
  },
  {
    name: 'JetBrains AI Assistant',
    type: 'embedded',
    envVars: [
      // JetBrains AI Assistant doesn't use env vars for detection
      // Detection should be based on IDE process and config files
    ],
    capabilities: ['context_aware_suggestions', 'coding_agent', 'project_analysis'],
    customDetectors: [
      () => {
        // Check for JetBrains IDE process indicators
        return process.env.IDEA_PROPERTIES !== undefined ||
               process.env.JETBRAINS_IDE !== undefined;
      }
    ]
  }
];

/**
 * Get provider configuration by name
 */
export function getProvider(name: string): ProviderConfig | undefined {
  return providers.find(p => p.name === name);
}

/**
 * Get all providers of a specific type
 */
export function getProvidersByType(type: 'direct' | 'embedded' | 'hybrid'): ProviderConfig[] {
  return providers.filter(p => p.type === type);
}