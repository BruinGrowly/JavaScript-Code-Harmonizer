#!/usr/bin/env node
/**
 * Enhanced CLI for JavaScript Code Harmonizer
 * Supports project analysis, caching, baseline comparison, and multiple output formats
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer, ProjectConfig } from '../project/project-analyzer';
import { ConfigLoader } from '../config/config-loader';
import { BaselineManager } from '../ci/baseline-manager';
import { SarifFormatter } from '../output/sarif-formatter';

interface CliOptions {
  // Input
  target: string; // File or directory
  recursive: boolean;

  // Configuration
  config?: string;

  // Analysis options
  suggestNames: boolean;
  threshold: number;

  // Performance
  parallel: number;
  cache: boolean;
  incremental: boolean;

  // CI/CD
  baseline?: string;
  saveBaseline?: string;
  failOnHigh: boolean;
  failOnMedium: boolean;
  exitCode: boolean;

  // Output
  format: 'text' | 'json' | 'sarif' | 'markdown';
  output?: string;
  verbose: boolean;
  quiet: boolean;

  // Utility
  init: boolean;
  clearCache: boolean;
  help: boolean;
  version: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    target: '.',
    recursive: false,
    suggestNames: false,
    threshold: 0.5,
    parallel: 4,
    cache: false,
    incremental: false,
    failOnHigh: false,
    failOnMedium: false,
    exitCode: false,
    format: 'text',
    verbose: false,
    quiet: false,
    init: false,
    clearCache: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--version':
      case '-v':
        options.version = true;
        break;
      case '--init':
        options.init = true;
        break;
      case '--config':
      case '-c':
        options.config = nextArg;
        i++;
        break;
      case '--recursive':
      case '-r':
        options.recursive = true;
        break;
      case '--suggest-names':
        options.suggestNames = true;
        break;
      case '--threshold':
      case '-t':
        options.threshold = parseFloat(nextArg);
        i++;
        break;
      case '--parallel':
      case '-p':
        options.parallel = parseInt(nextArg, 10);
        i++;
        break;
      case '--cache':
        options.cache = true;
        break;
      case '--incremental':
        options.incremental = true;
        break;
      case '--clear-cache':
        options.clearCache = true;
        break;
      case '--baseline':
        options.baseline = nextArg;
        i++;
        break;
      case '--save-baseline':
        options.saveBaseline = nextArg;
        i++;
        break;
      case '--fail-on-high':
        options.failOnHigh = true;
        break;
      case '--fail-on-medium':
        options.failOnMedium = true;
        break;
      case '--exit-code':
        options.exitCode = true;
        break;
      case '--format':
      case '-f':
        options.format = nextArg as 'text' | 'json' | 'sarif' | 'markdown';
        i++;
        break;
      case '--output':
      case '-o':
        options.output = nextArg;
        i++;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--quiet':
      case '-q':
        options.quiet = true;
        break;
      default:
        if (!arg.startsWith('-') && !options.target) {
          options.target = arg;
        } else if (!arg.startsWith('-')) {
          options.target = arg;
        }
        break;
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
JavaScript Code Harmonizer v0.2.0
Semantic bug detection using LJPW framework

USAGE:
  harmonizer [OPTIONS] [TARGET]

TARGET:
  File or directory to analyze (default: current directory)

OPTIONS:
  Analysis:
    --recursive, -r              Analyze directory recursively
    --suggest-names              Suggest better function names
    --threshold, -t <number>     Disharmony threshold (default: 0.5)
    --config, -c <path>          Path to configuration file

  Performance:
    --parallel, -p <number>      Number of parallel workers (default: 4)
    --cache                      Enable result caching
    --incremental                Only analyze changed files
    --clear-cache                Clear the cache and exit

  CI/CD:
    --baseline <path>            Compare with baseline file
    --save-baseline <path>       Save current results as baseline
    --fail-on-high               Exit with code 1 if HIGH severity found
    --fail-on-medium             Exit with code 1 if MEDIUM severity found
    --exit-code                  Use exit codes (0=pass, 1=fail, 2=error)

  Output:
    --format, -f <format>        Output format: text, json, sarif, markdown
    --output, -o <path>          Write output to file
    --verbose                    Show detailed analysis
    --quiet, -q                  Suppress progress output

  Utility:
    --init                       Create default config files
    --help, -h                   Show this help
    --version, -v                Show version

EXAMPLES:
  # Analyze current directory
  harmonizer

  # Analyze specific file
  harmonizer src/index.js

  # Analyze directory recursively with caching
  harmonizer src/ --recursive --cache

  # CI/CD usage with baseline
  harmonizer src/ -r --baseline baseline.json --fail-on-high --exit-code

  # Generate SARIF output for GitHub Code Scanning
  harmonizer src/ -r --format sarif --output harmonizer.sarif

  # Create configuration files
  harmonizer --init

MORE INFO:
  Documentation: https://github.com/BruinGrowly/JavaScript-Code-Harmonizer
  Report issues: https://github.com/BruinGrowly/JavaScript-Code-Harmonizer/issues
`);
}

/**
 * Print version
 */
function printVersion(): void {
  console.log('JavaScript Code Harmonizer v0.2.0');
}

/**
 * Initialize configuration files
 */
function initConfig(targetDir: string): void {
  try {
    ConfigLoader.createDefaultConfig(targetDir);
    console.log(`✅ Created .harmonizerrc.json in ${targetDir}`);
  } catch (error) {
    console.log(`⚠️  .harmonizerrc.json already exists`);
  }

  try {
    ConfigLoader.createDefaultIgnore(targetDir);
    console.log(`✅ Created .harmonizerignore in ${targetDir}`);
  } catch (error) {
    console.log(`⚠️  .harmonizerignore already exists`);
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Handle utility commands
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    printVersion();
    process.exit(0);
  }

  if (options.init) {
    initConfig(process.cwd());
    process.exit(0);
  }

  // Load configuration
  const config = options.config
    ? ConfigLoader.loadConfig(path.dirname(options.config))
    : ConfigLoader.loadConfig(options.target);

  // Validate target
  const targetPath = path.resolve(options.target);
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Error: Target does not exist: ${targetPath}`);
    process.exit(2);
  }

  const isDirectory = fs.statSync(targetPath).isDirectory();

  if (!options.quiet) {
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('           JavaScript Code Harmonizer v0.2.0                      ');
    console.log('           Semantic Bug Detection & Code Analysis                 ');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
  }

  // Build project config
  const projectConfig: ProjectConfig = {
    rootPath: isDirectory ? targetPath : path.dirname(targetPath),
    include: isDirectory ? undefined : [path.basename(targetPath)],
    exclude: config.ignore,
    parallelism: options.parallel || (config.performance?.parallelism ?? 4),
    cache: options.cache || (config.performance?.cache ?? false),
    cacheDir: path.join(targetPath, '.harmonizer-cache'),
    incremental: options.incremental || (config.performance?.incremental ?? false),
    maxMemory: config.performance?.maxMemory ?? 0,
    showProgress: !options.quiet && (config.output?.showProgress ?? true),
    fileTimeout: config.performance?.fileTimeout ?? 30000,
    continueOnError: true,
  };

  // Analyze project
  const analyzer = new ProjectAnalyzer();
  const result = await analyzer.analyzeProject(projectConfig);

  if (!options.quiet) {
    console.log('');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
  }

  // Handle baseline comparison
  let exitCode = 0;

  if (options.baseline) {
    const comparison = BaselineManager.compare(result, options.baseline);

    if (!options.quiet) {
      console.log(BaselineManager.formatComparison(comparison));
      console.log('');
    }

    if (options.exitCode) {
      exitCode = BaselineManager.getExitCode(
        comparison,
        options.failOnHigh || (config.ci?.failOnHigh ?? false),
        options.failOnMedium || (config.ci?.failOnMedium ?? false),
        result
      );
    }
  }

  // Save baseline if requested
  if (options.saveBaseline) {
    const metrics = BaselineManager.extractMetrics(result);
    BaselineManager.saveBaseline(metrics, options.saveBaseline);
    if (!options.quiet) {
      console.log(`💾 Baseline saved to ${options.saveBaseline}`);
      console.log('');
    }
  }

  // Format and output results
  let output: string;

  switch (options.format) {
    case 'json':
      output = JSON.stringify(result, null, 2);
      break;

    case 'sarif':
      const sarif = SarifFormatter.format(result);
      output = JSON.stringify(sarif, null, 2);
      break;

    case 'markdown':
      output = formatMarkdown(result, options);
      break;

    case 'text':
    default:
      output = formatText(result, options);
      break;
  }

  // Write output
  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    if (!options.quiet) {
      console.log(`📄 Output written to ${options.output}`);
    }
  } else {
    console.log(output);
  }

  // Exit with appropriate code
  if (options.exitCode) {
    process.exit(exitCode);
  }
}

/**
 * Format results as text
 */
function formatText(result: any, options: CliOptions): string {
  const lines: string[] = [];

  lines.push('SUMMARY:');
  lines.push(`  Files analyzed: ${result.summary.analyzedFiles}/${result.summary.totalFiles}`);
  lines.push(`  Total functions: ${result.summary.totalFunctions}`);
  lines.push(`  Disharmonious functions: ${result.summary.disharmoniousFunctions}`);
  lines.push(`  Average disharmony: ${result.summary.averageDisharmony.toFixed(3)}`);
  lines.push(`  Max disharmony: ${result.summary.maxDisharmony.toFixed(3)}`);
  lines.push('');

  if (result.summary.errorFiles > 0) {
    lines.push(`⚠️  ${result.summary.errorFiles} files had errors`);
    lines.push('');
  }

  // Show disharmonious functions
  const disharmoniousFunctions: any[] = [];
  for (const file of result.files) {
    if (file.status === 'success') {
      for (const func of file.functions) {
        if (func.disharmony > options.threshold) {
          disharmoniousFunctions.push({
            ...func,
            file: file.relativePath,
          });
        }
      }
    }
  }

  if (disharmoniousFunctions.length > 0) {
    lines.push(`ISSUES FOUND (${disharmoniousFunctions.length}):`);
    lines.push('');

    disharmoniousFunctions.sort((a, b) => b.disharmony - a.disharmony);

    for (const func of disharmoniousFunctions.slice(0, 20)) {
      const icon = func.severity === 'HIGH' ? '❌' : func.severity === 'MEDIUM' ? '⚠️' : '📝';
      lines.push(`${icon} ${func.file}:${func.line} - ${func.name}`);
      lines.push(`   Disharmony: ${func.disharmony.toFixed(3)} [${func.severity}]`);

      if (options.suggestNames && func.suggestions) {
        lines.push(`   Suggestions: ${func.suggestions.slice(0, 3).map((s: any) => s.name).join(', ')}`);
      }

      lines.push('');
    }

    if (disharmoniousFunctions.length > 20) {
      lines.push(`... and ${disharmoniousFunctions.length - 20} more issues`);
      lines.push('');
    }
  } else {
    lines.push('✅ No significant issues found!');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format results as markdown
 */
function formatMarkdown(result: any, options: CliOptions): string {
  const lines: string[] = [];

  lines.push('# Code Harmonizer Analysis Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Files analyzed**: ${result.summary.analyzedFiles}/${result.summary.totalFiles}`);
  lines.push(`- **Total functions**: ${result.summary.totalFunctions}`);
  lines.push(`- **Disharmonious functions**: ${result.summary.disharmoniousFunctions}`);
  lines.push(`- **Average disharmony**: ${result.summary.averageDisharmony.toFixed(3)}`);
  lines.push(`- **Max disharmony**: ${result.summary.maxDisharmony.toFixed(3)}`);
  lines.push('');

  // Show disharmonious functions
  const disharmoniousFunctions: any[] = [];
  for (const file of result.files) {
    if (file.status === 'success') {
      for (const func of file.functions) {
        if (func.disharmony > options.threshold) {
          disharmoniousFunctions.push({
            ...func,
            file: file.relativePath,
          });
        }
      }
    }
  }

  if (disharmoniousFunctions.length > 0) {
    lines.push(`## Issues Found (${disharmoniousFunctions.length})`);
    lines.push('');

    disharmoniousFunctions.sort((a, b) => b.disharmony - a.disharmony);

    lines.push('| File | Function | Line | Disharmony | Severity |');
    lines.push('|------|----------|------|------------|----------|');

    for (const func of disharmoniousFunctions) {
      const icon = func.severity === 'HIGH' ? '❌' : func.severity === 'MEDIUM' ? '⚠️' : '📝';
      lines.push(
        `| ${func.file} | \`${func.name}\` | ${func.line} | ${func.disharmony.toFixed(3)} | ${icon} ${func.severity} |`
      );
    }

    lines.push('');
  } else {
    lines.push('## ✅ No Issues Found');
    lines.push('');
    lines.push('All functions have good semantic harmony!');
    lines.push('');
  }

  return lines.join('\n');
}

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(2);
  });
}

export { main, parseArgs };
