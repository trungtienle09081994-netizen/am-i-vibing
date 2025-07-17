#!/usr/bin/env node

import {
  detectAgenticEnvironment,
  isAgent,
  isInteractive,
} from "./detector.js";

interface CliOptions {
  format?: "json" | "text";
  check?: "agent" | "interactive";
  quiet?: boolean;
  help?: boolean;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--format":
      case "-f":
        options.format = args[++i] as "json" | "text";
        break;
      case "--check":
      case "-c":
        options.check = args[++i] as "agent" | "interactive";
        break;
      case "--quiet":
      case "-q":
        options.quiet = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
am-i-vibing - Detect agentic coding environments

USAGE:
  npx am-i-vibing [OPTIONS]

OPTIONS:
  -f, --format <json|text>     Output format (default: text)
  -c, --check <agent|interactive>  Check for specific environment type
  -q, --quiet                  Only output result, no labels
  -h, --help                   Show this help message

EXAMPLES:
  npx am-i-vibing                    # Detect current environment
  npx am-i-vibing --format json     # JSON output
  npx am-i-vibing --check agent     # Check if running under agent
  npx am-i-vibing --quiet            # Minimal output

EXIT CODES:
  0  Agentic environment detected (or specific check passed)
  1  No agentic environment detected (or specific check failed)
`);
}

function formatOutput(
  result: ReturnType<typeof detectAgenticEnvironment>,
  options: CliOptions,
): string {
  if (options.format === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.quiet) {
    if (options.check) {
      return result.type === options.check ? "true" : "false";
    }
    return result.isAgentic ? `${result.name}` : "none";
  }

  if (options.check) {
    const matches = result.type === options.check;
    return matches
      ? `✓ Running in ${options.check} environment: ${result.name}`
      : `✗ Not running in ${options.check} environment`;
  }

  if (!result.isAgentic) {
    return "✗ No agentic environment detected";
  }

  return `✓ Detected: ${result.name} (${result.type})`;
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  let result;
  let exitCode = 1;

  if (options.check === "agent") {
    const isAgentEnv = isAgent();
    result = detectAgenticEnvironment();
    exitCode = isAgentEnv ? 0 : 1;
  } else if (options.check === "interactive") {
    const isInteractiveEnv = isInteractive();
    result = detectAgenticEnvironment();
    exitCode = isInteractiveEnv ? 0 : 1;
  } else {
    result = detectAgenticEnvironment();
    exitCode = result.isAgentic ? 0 : 1;
  }

  const output = formatOutput(result, options);
  console.log(output);

  process.exit(exitCode);
}

main();
