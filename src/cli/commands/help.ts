/**
 * Enhanced help command with better organization and examples
 */

import chalk from 'chalk';

export interface HelpOptions {
  command?: string;
}

/**
 * Enhanced help command
 */
export function helpCommand(options: HelpOptions = {}): void {
  if (options.command) {
    showCommandHelp(options.command);
  } else {
    showGeneralHelp();
  }
}

/**
 * Show general help
 */
function showGeneralHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('         JavaScript Code Harmonizer v0.2.0'));
  console.log(chalk.cyan.bold('         Semantic Bug Detection & Refactoring'));
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log('');

  console.log(chalk.bold('QUICK START'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer init')}              Set up Code Harmonizer`);
  console.log(`  ${chalk.cyan('harmonizer .')}                 Analyze current directory`);
  console.log(`  ${chalk.cyan('harmonizer status')}            View project health dashboard`);
  console.log(`  ${chalk.cyan('harmonizer examples')}          Browse interactive examples`);
  console.log('');

  console.log(chalk.bold('ANALYSIS COMMANDS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer [file|dir]')}        Analyze files or directories`);
  console.log(`  ${chalk.cyan('harmonizer --recursive')}       Analyze recursively (alias: -r)`);
  console.log(`  ${chalk.cyan('harmonizer --threshold 0.7')}   Set disharmony threshold`);
  console.log(`  ${chalk.cyan('harmonizer --format sarif')}    Output format: text|json|sarif|markdown`);
  console.log('');

  console.log(chalk.bold('INTERACTIVE COMMANDS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer init')}              Interactive project setup`);
  console.log(`  ${chalk.cyan('harmonizer fix [target]')}      Interactive refactoring guide`);
  console.log(`  ${chalk.cyan('harmonizer explain file:line')} Deep-dive into an issue`);
  console.log(`  ${chalk.cyan('harmonizer examples')}          Browse usage examples`);
  console.log(`  ${chalk.cyan('harmonizer status')}            Project health dashboard`);
  console.log('');

  console.log(chalk.bold('DEVELOPMENT WORKFLOW'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer watch [dir]')}       Watch files for changes`);
  console.log(`  ${chalk.cyan('harmonizer --git-diff main')}   Analyze changed files vs branch`);
  console.log(`  ${chalk.cyan('harmonizer install-hooks')}     Set up git pre-commit hooks`);
  console.log(`  ${chalk.cyan('harmonizer --cache')}           Enable caching for speed`);
  console.log('');

  console.log(chalk.bold('CI/CD INTEGRATION'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer --save-baseline')}   Save quality baseline`);
  console.log(`  ${chalk.cyan('harmonizer --baseline file')}   Compare vs baseline`);
  console.log(`  ${chalk.cyan('harmonizer --fail-on-high')}    Exit code 1 if HIGH found`);
  console.log(`  ${chalk.cyan('harmonizer --exit-code')}       Use exit codes (0=pass, 1=fail)`);
  console.log(`  ${chalk.cyan('harmonizer --format sarif')}    GitHub Code Scanning format`);
  console.log('');

  console.log(chalk.bold('REPORTS & OUTPUT'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer --format html')}     Beautiful HTML report`);
  console.log(`  ${chalk.cyan('harmonizer --format json')}     Machine-readable JSON`);
  console.log(`  ${chalk.cyan('harmonizer --format sarif')}    SARIF 2.1.0 format`);
  console.log(`  ${chalk.cyan('harmonizer --output file')}     Save to file (alias: -o)`);
  console.log(`  ${chalk.cyan('harmonizer --verbose')}         Show detailed output`);
  console.log(`  ${chalk.cyan('harmonizer --quiet')}           Suppress progress (alias: -q)`);
  console.log('');

  console.log(chalk.bold('PERFORMANCE OPTIONS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer --cache')}           Enable result caching`);
  console.log(`  ${chalk.cyan('harmonizer --incremental')}     Only analyze changed files`);
  console.log(`  ${chalk.cyan('harmonizer --parallel 8')}      Set worker count (default: 4)`);
  console.log(`  ${chalk.cyan('harmonizer --clear-cache')}     Clear cache and exit`);
  console.log('');

  console.log(chalk.bold('CONFIGURATION'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer --config file')}     Load config from file`);
  console.log(`  ${chalk.cyan('harmonizer init')}              Create .harmonizerrc.json`);
  console.log('');
  console.log('  Config files (searched in order):');
  console.log(chalk.gray('    .harmonizerrc.json'));
  console.log(chalk.gray('    .harmonizer.json'));
  console.log(chalk.gray('    package.json (harmonizer field)'));
  console.log('');

  console.log(chalk.bold('EXAMPLES'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(chalk.gray('  # First-time setup'));
  console.log(`  ${chalk.white('harmonizer init')}`);
  console.log('');
  console.log(chalk.gray('  # Quick analysis'));
  console.log(`  ${chalk.white('harmonizer src/index.js')}`);
  console.log('');
  console.log(chalk.gray('  # Analyze entire project'));
  console.log(`  ${chalk.white('harmonizer ./src --recursive --cache')}`);
  console.log('');
  console.log(chalk.gray('  # Interactive fixing'));
  console.log(`  ${chalk.white('harmonizer fix ./src')}`);
  console.log('');
  console.log(chalk.gray('  # Generate HTML report'));
  console.log(`  ${chalk.white('harmonizer ./src -r --format html -o report.html')}`);
  console.log('');
  console.log(chalk.gray('  # CI/CD usage'));
  console.log(`  ${chalk.white('harmonizer ./src -r --baseline baseline.json --fail-on-high --exit-code')}`);
  console.log('');
  console.log(chalk.gray('  # Watch mode'));
  console.log(`  ${chalk.white('harmonizer watch ./src')}`);
  console.log('');
  console.log(chalk.gray('  # Git integration'));
  console.log(`  ${chalk.white('harmonizer --git-diff main')}`);
  console.log('');

  console.log(chalk.bold('LEARN MORE'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  ${chalk.cyan('harmonizer examples')}          Interactive examples`);
  console.log(`  ${chalk.cyan('harmonizer explain file:42')}   Understand an issue`);
  console.log(`  ${chalk.cyan('harmonizer help <command>')}    Command-specific help`);
  console.log('');
  console.log(`  📚 Documentation: ${chalk.cyan('https://github.com/BruinGrowly/JavaScript-Code-Harmonizer')}`);
  console.log(`  🐛 Report issues: ${chalk.cyan('https://github.com/BruinGrowly/JavaScript-Code-Harmonizer/issues')}`);
  console.log('');
}

/**
 * Show help for a specific command
 */
function showCommandHelp(command: string): void {
  const helpTopics: Record<string, () => void> = {
    init: showInitHelp,
    fix: showFixHelp,
    explain: showExplainHelp,
    examples: showExamplesHelp,
    status: showStatusHelp,
    watch: showWatchHelp,
    'install-hooks': showInstallHooksHelp,
  };

  const helpFn = helpTopics[command];
  if (helpFn) {
    helpFn();
  } else {
    console.log('');
    console.log(chalk.red(`Unknown command: ${command}`));
    console.log('');
    console.log('Available commands:');
    Object.keys(helpTopics).forEach((cmd) => {
      console.log(`  ${chalk.cyan(cmd)}`);
    });
    console.log('');
  }
}

function showInitHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer init'));
  console.log('');
  console.log('Interactive project setup - creates configuration files');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer init [directory]')}`);
  console.log('');
  console.log(chalk.bold('EXAMPLE:'));
  console.log(`  ${chalk.white('harmonizer init')}`);
  console.log('');
}

function showFixHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer fix'));
  console.log('');
  console.log('Interactive refactoring - guides you through fixing disharmonious functions');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer fix [target] [options]')}`);
  console.log('');
  console.log(chalk.bold('OPTIONS:'));
  console.log(`  ${chalk.cyan('--threshold <n>')}     Only fix functions above threshold`);
  console.log(`  ${chalk.cyan('--severity <level>')}  Filter by severity (HIGH|MEDIUM|LOW)`);
  console.log(`  ${chalk.cyan('--dry-run')}           Show what would be fixed`);
  console.log(`  ${chalk.cyan('--auto-apply')}        Auto-apply top suggestion`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer fix ./src')}`);
  console.log(`  ${chalk.white('harmonizer fix ./src --severity HIGH')}`);
  console.log(`  ${chalk.white('harmonizer fix ./src --dry-run')}`);
  console.log('');
}

function showExplainHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer explain'));
  console.log('');
  console.log('Deep-dive explanation of why a function is flagged');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer explain <file:line> [options]')}`);
  console.log('');
  console.log(chalk.bold('OPTIONS:'));
  console.log(`  ${chalk.cyan('--verbose')}  Show detailed LJPW analysis`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer explain src/user.js:42')}`);
  console.log(`  ${chalk.white('harmonizer explain ./lib/auth.js:15 --verbose')}`);
  console.log('');
}

function showExamplesHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer examples'));
  console.log('');
  console.log('Browse and run interactive usage examples');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer examples [category]')}`);
  console.log('');
  console.log(chalk.bold('CATEGORIES:'));
  console.log(`  ${chalk.cyan('basics')}       Getting started examples`);
  console.log(`  ${chalk.cyan('reports')}      Report generation`);
  console.log(`  ${chalk.cyan('ci-cd')}        CI/CD integration`);
  console.log(`  ${chalk.cyan('git')}          Git integration`);
  console.log(`  ${chalk.cyan('development')}  Development workflow`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer examples')}`);
  console.log(`  ${chalk.white('harmonizer examples ci-cd')}`);
  console.log('');
}

function showStatusHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer status'));
  console.log('');
  console.log('Project health dashboard - quick overview of code quality');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer status [target] [options]')}`);
  console.log('');
  console.log(chalk.bold('OPTIONS:'));
  console.log(`  ${chalk.cyan('--verbose')}  Show detailed file-by-file breakdown`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer status')}`);
  console.log(`  ${chalk.white('harmonizer status ./src --verbose')}`);
  console.log('');
}

function showWatchHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer watch'));
  console.log('');
  console.log('Watch files for changes and analyze continuously');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer watch [directory]')}`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer watch ./src')}`);
  console.log(`  ${chalk.white('harmonizer watch')}`);
  console.log('');
}

function showInstallHooksHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('COMMAND: harmonizer install-hooks'));
  console.log('');
  console.log('Install git pre-commit and pre-push hooks');
  console.log('');
  console.log(chalk.bold('USAGE:'));
  console.log(`  ${chalk.cyan('harmonizer install-hooks [options]')}`);
  console.log('');
  console.log(chalk.bold('OPTIONS:'));
  console.log(`  ${chalk.cyan('--pre-commit')}  Install pre-commit hook`);
  console.log(`  ${chalk.cyan('--pre-push')}    Install pre-push hook`);
  console.log('');
  console.log(chalk.bold('EXAMPLES:'));
  console.log(`  ${chalk.white('harmonizer install-hooks --pre-commit')}`);
  console.log(`  ${chalk.white('harmonizer install-hooks --pre-commit --pre-push')}`);
  console.log('');
}
