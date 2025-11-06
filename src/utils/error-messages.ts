/**
 * Improved error messages with helpful context and suggestions
 */

import chalk from 'chalk';

export interface ErrorContext {
  operation?: string;
  filePath?: string;
  suggestion?: string;
  documentation?: string;
}

/**
 * Enhanced error message formatter
 */
export class ErrorFormatter {
  /**
   * Format a file not found error
   */
  static fileNotFound(filePath: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ File Not Found'));
    lines.push('');
    lines.push(chalk.gray(`Could not find: ${chalk.white(filePath)}`));
    lines.push('');

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    } else {
      lines.push(chalk.cyan('Suggestions:'));
      lines.push(chalk.gray('  • Check the file path spelling'));
      lines.push(chalk.gray('  • Make sure the file exists'));
      lines.push(chalk.gray('  • Use relative or absolute paths'));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a directory not found error
   */
  static directoryNotFound(dirPath: string): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ Directory Not Found'));
    lines.push('');
    lines.push(chalk.gray(`Could not find: ${chalk.white(dirPath)}`));
    lines.push('');
    lines.push(chalk.cyan('Suggestions:'));
    lines.push(chalk.gray('  • Check the directory path'));
    lines.push(chalk.gray('  • Create the directory first'));
    lines.push(chalk.gray('  • Use an existing directory'));
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Format a parse error
   */
  static parseError(filePath: string, error: Error): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ Parse Error'));
    lines.push('');
    lines.push(chalk.gray(`Failed to parse: ${chalk.white(filePath)}`));
    lines.push('');
    lines.push(chalk.yellow('Error:'));
    lines.push(chalk.gray(`  ${error.message}`));
    lines.push('');
    lines.push(chalk.cyan('Common causes:'));
    lines.push(chalk.gray('  • Syntax error in the file'));
    lines.push(chalk.gray('  • Unsupported JavaScript/TypeScript feature'));
    lines.push(chalk.gray('  • File is not valid JavaScript/TypeScript'));
    lines.push('');
    lines.push(chalk.cyan('What to do:'));
    lines.push(chalk.gray('  1. Check the file for syntax errors'));
    lines.push(chalk.gray('  2. Try running eslint or tsc on the file'));
    lines.push(chalk.gray('  3. Skip this file with .harmonizerignore'));
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Format a configuration error
   */
  static configError(message: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ Configuration Error'));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    } else {
      lines.push(chalk.cyan('What to do:'));
      lines.push(chalk.gray('  1. Run: harmonizer init'));
      lines.push(chalk.gray('  2. Check .harmonizerrc.json format'));
      lines.push(
        chalk.gray('  3. See: https://github.com/BruinGrowly/JavaScript-Code-Harmonizer#config')
      );
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a git error
   */
  static gitError(message: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ Git Error'));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    } else {
      lines.push(chalk.cyan('Common causes:'));
      lines.push(chalk.gray('  • Not in a git repository'));
      lines.push(chalk.gray('  • Git is not installed'));
      lines.push(chalk.gray('  • Invalid branch name'));
      lines.push('');
      lines.push(chalk.cyan('What to do:'));
      lines.push(chalk.gray('  1. Make sure you\'re in a git repository'));
      lines.push(chalk.gray('  2. Check: git status'));
      lines.push(chalk.gray('  3. Verify branch exists: git branch -a'));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format an analysis error
   */
  static analysisError(message: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold('❌ Analysis Error'));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');

    if (context?.filePath) {
      lines.push(chalk.gray(`File: ${chalk.white(context.filePath)}`));
      lines.push('');
    }

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    } else {
      lines.push(chalk.cyan('What to do:'));
      lines.push(chalk.gray('  • Try running with --verbose for more details'));
      lines.push(chalk.gray('  • Check file permissions'));
      lines.push(chalk.gray('  • Skip problematic files with .harmonizerignore'));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a generic error with helpful formatting
   */
  static genericError(title: string, message: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.red.bold(`❌ ${title}`));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');

    if (context?.operation) {
      lines.push(chalk.gray(`Operation: ${context.operation}`));
      lines.push('');
    }

    if (context?.filePath) {
      lines.push(chalk.gray(`File: ${chalk.white(context.filePath)}`));
      lines.push('');
    }

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    }

    if (context?.documentation) {
      lines.push(chalk.cyan('Documentation:'));
      lines.push(chalk.gray(`  ${context.documentation}`));
      lines.push('');
    }

    lines.push(chalk.gray('For more help: harmonizer --help'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format a warning message
   */
  static warning(message: string, context?: ErrorContext): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.yellow.bold('⚠️  Warning'));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');

    if (context?.suggestion) {
      lines.push(chalk.cyan('Suggestion:'));
      lines.push(chalk.gray(`  ${context.suggestion}`));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a success message
   */
  static success(message: string): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.green.bold('✅ Success'));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Format an info message
   */
  static info(title: string, message: string): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(chalk.cyan.bold(`ℹ️  ${title}`));
    lines.push('');
    lines.push(chalk.gray(message));
    lines.push('');
    return lines.join('\n');
  }
}

/**
 * Quick helper functions
 */
export const error = ErrorFormatter.genericError;
export const fileNotFound = ErrorFormatter.fileNotFound;
export const configError = ErrorFormatter.configError;
export const warning = ErrorFormatter.warning;
export const success = ErrorFormatter.success;
export const info = ErrorFormatter.info;
