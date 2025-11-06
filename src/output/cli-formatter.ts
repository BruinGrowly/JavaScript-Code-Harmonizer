/**
 * Enhanced CLI Formatter
 * Beautiful terminal output with colors, tables, and progress indicators
 */

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import ora, { Ora } from 'ora';
import { ProjectAnalysisResult, FileAnalysisResult } from '../project/project-analyzer';

export interface FormatterOptions {
  useColors?: boolean;
  verbose?: boolean;
  showProgress?: boolean;
}

/**
 * Enhanced CLI Formatter
 */
export class CliFormatter {
  private options: Required<FormatterOptions>;
  private progressBar: cliProgress.SingleBar | null = null;
  private spinner: Ora | null = null;

  constructor(options: FormatterOptions = {}) {
    this.options = {
      useColors: options.useColors ?? true,
      verbose: options.verbose ?? false,
      showProgress: options.showProgress ?? true,
    };

    // Disable colors if not supported
    if (!this.options.useColors || !chalk.supportsColor) {
      chalk.level = 0;
    }
  }

  /**
   * Print header banner
   */
  printHeader(): void {
    console.log('');
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('          JavaScript Code Harmonizer') + chalk.cyan(' v0.2.0'));
    console.log(chalk.cyan('          Semantic Bug Detection & Code Analysis'));
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════════════'));
    console.log('');
  }

  /**
   * Start spinner
   */
  startSpinner(text: string): void {
    if (!this.options.showProgress) return;

    this.spinner = ora({
      text: chalk.cyan(text),
      spinner: 'dots',
    }).start();
  }

  /**
   * Update spinner text
   */
  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = chalk.cyan(text);
    }
  }

  /**
   * Stop spinner with success
   */
  succeedSpinner(text?: string): void {
    if (this.spinner) {
      if (text) {
        this.spinner.succeed(chalk.green(text));
      } else {
        this.spinner.succeed();
      }
      this.spinner = null;
    }
  }

  /**
   * Stop spinner with failure
   */
  failSpinner(text?: string): void {
    if (this.spinner) {
      if (text) {
        this.spinner.fail(chalk.red(text));
      } else {
        this.spinner.fail();
      }
      this.spinner = null;
    }
  }

  /**
   * Create progress bar
   */
  createProgressBar(total: number, format?: string): void {
    if (!this.options.showProgress) return;

    this.progressBar = new cliProgress.SingleBar(
      {
        format:
          format ||
          chalk.cyan('{bar}') +
            ' | {percentage}% | {value}/{total} files | ETA: {eta_formatted}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );

    this.progressBar.start(total, 0);
  }

  /**
   * Update progress bar
   */
  updateProgress(current: number): void {
    if (this.progressBar) {
      this.progressBar.update(current);
    }
  }

  /**
   * Stop progress bar
   */
  stopProgress(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  /**
   * Format project analysis result
   */
  formatProjectResult(result: ProjectAnalysisResult): string {
    const lines: string[] = [];

    // Summary section
    lines.push(chalk.bold.white('SUMMARY:'));
    lines.push(this.formatSummary(result));
    lines.push('');

    // Issues section
    if (result.summary.disharmoniousFunctions > 0) {
      lines.push(this.formatIssues(result));
    } else {
      lines.push(chalk.bold.green('✅ No significant issues found!'));
      lines.push(chalk.gray('   All functions are semantically harmonious.'));
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format summary
   */
  private formatSummary(result: ProjectAnalysisResult): string {
    const { summary } = result;
    const lines: string[] = [];

    const filesColor = summary.errorFiles > 0 ? chalk.yellow : chalk.green;
    lines.push(
      `  ${chalk.gray('Files analyzed:')} ${filesColor(`${summary.analyzedFiles}/${summary.totalFiles}`)}`
    );

    const functionsColor = summary.disharmoniousFunctions > 0 ? chalk.yellow : chalk.green;
    lines.push(
      `  ${chalk.gray('Total functions:')} ${functionsColor(summary.totalFunctions.toString())}`
    );

    if (summary.disharmoniousFunctions > 0) {
      lines.push(
        `  ${chalk.gray('Disharmonious:')} ${chalk.red(summary.disharmoniousFunctions.toString())}`
      );
    }

    const avgColor = this.getDisharmonyColor(summary.averageDisharmony);
    lines.push(
      `  ${chalk.gray('Avg disharmony:')} ${avgColor(summary.averageDisharmony.toFixed(3))}`
    );

    const maxColor = this.getDisharmonyColor(summary.maxDisharmony);
    lines.push(
      `  ${chalk.gray('Max disharmony:')} ${maxColor(summary.maxDisharmony.toFixed(3))}`
    );

    if (summary.errorFiles > 0) {
      lines.push('');
      lines.push(chalk.yellow(`  ⚠️  ${summary.errorFiles} files had errors`));
    }

    return lines.join('\n');
  }

  /**
   * Format issues list
   */
  private formatIssues(result: ProjectAnalysisResult): string {
    const lines: string[] = [];

    // Collect all issues
    const issues: Array<{
      file: string;
      func: any;
    }> = [];

    for (const file of result.files) {
      if (file.status === 'success') {
        for (const func of file.functions) {
          if (func.disharmony > 0.5) {
            issues.push({ file: file.relativePath, func });
          }
        }
      }
    }

    issues.sort((a, b) => b.func.disharmony - a.func.disharmony);

    lines.push(
      chalk.bold.white(`ISSUES FOUND (${issues.length}):`) +
        chalk.gray(` showing top ${Math.min(issues.length, 20)}`)
    );
    lines.push('');

    for (const issue of issues.slice(0, 20)) {
      lines.push(this.formatIssue(issue.file, issue.func));
      lines.push('');
    }

    if (issues.length > 20) {
      lines.push(chalk.gray(`  ... and ${issues.length - 20} more issues`));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format single issue
   */
  private formatIssue(filePath: string, func: any): string {
    const lines: string[] = [];

    // Issue header with icon and severity badge
    const icon = this.getSeverityIcon(func.severity);
    const badge = this.getSeverityBadge(func.severity);

    lines.push(`${icon} ${chalk.bold.white(`${filePath}:${func.line}`)} ${badge}`);
    lines.push(
      `   ${chalk.gray('Function:')} ${chalk.cyan(func.name + '()')}`
    );

    const disharmonyColor = this.getDisharmonyColor(func.disharmony);
    lines.push(
      `   ${chalk.gray('Disharmony:')} ${disharmonyColor(func.disharmony.toFixed(3))}`
    );

    // Show suggestions if available and verbose
    if (this.options.verbose && func.suggestions && func.suggestions.length > 0) {
      lines.push(
        `   ${chalk.gray('💡 Suggestions:')} ${func.suggestions
          .slice(0, 3)
          .map((s: any) => chalk.green(s.name))
          .join(chalk.gray(', '))}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'HIGH':
        return chalk.red('❌');
      case 'MEDIUM':
        return chalk.yellow('⚠️');
      case 'LOW':
        return chalk.blue('ℹ️');
      default:
        return '•';
    }
  }

  /**
   * Get severity badge
   */
  private getSeverityBadge(severity: string): string {
    switch (severity) {
      case 'HIGH':
        return chalk.bgRed.white.bold(' HIGH ');
      case 'MEDIUM':
        return chalk.bgYellow.black.bold(' MEDIUM ');
      case 'LOW':
        return chalk.bgBlue.white.bold(' LOW ');
      default:
        return chalk.bgGray.white.bold(' UNKNOWN ');
    }
  }

  /**
   * Get color for disharmony score
   */
  private getDisharmonyColor(score: number): chalk.Chalk {
    if (score > 0.8) {
      return chalk.red.bold;
    } else if (score > 0.5) {
      return chalk.yellow.bold;
    } else if (score > 0.3) {
      return chalk.blue;
    } else {
      return chalk.green;
    }
  }

  /**
   * Format file analysis result (for watch mode)
   */
  formatFileResult(fileResult: FileAnalysisResult): string {
    const lines: string[] = [];

    if (fileResult.status !== 'success') {
      lines.push(chalk.red(`❌ Analysis failed: ${fileResult.error}`));
      return lines.join('\n');
    }

    const { metrics } = fileResult;

    if (metrics.disharmoniousFunctions === 0) {
      lines.push(
        chalk.green(`✅ All clear! ${metrics.totalFunctions} functions in harmony`)
      );
    } else {
      lines.push(
        chalk.yellow(
          `⚠️  ${metrics.disharmoniousFunctions}/${metrics.totalFunctions} functions need attention`
        )
      );

      // Show worst functions
      const worst = fileResult.functions
        .filter((f) => f.disharmony > 0.5)
        .sort((a, b) => b.disharmony - a.disharmony)
        .slice(0, 3);

      for (const func of worst) {
        const color = this.getDisharmonyColor(func.disharmony);
        lines.push(
          `   ${this.getSeverityIcon(func.severity)} ${chalk.cyan(func.name + '()')} - ${color(func.disharmony.toFixed(3))} ${this.getSeverityBadge(func.severity)}`
        );
      }
    }

    return lines.join('\n');
  }

  /**
   * Print success message
   */
  printSuccess(message: string): void {
    console.log(chalk.green('✅ ' + message));
  }

  /**
   * Print error message
   */
  printError(message: string): void {
    console.log(chalk.red('❌ ' + message));
  }

  /**
   * Print warning message
   */
  printWarning(message: string): void {
    console.log(chalk.yellow('⚠️  ' + message));
  }

  /**
   * Print info message
   */
  printInfo(message: string): void {
    console.log(chalk.cyan('ℹ️  ' + message));
  }

  /**
   * Print horizontal line
   */
  printLine(): void {
    console.log(chalk.gray('─'.repeat(70)));
  }

  /**
   * Print blank line
   */
  printBlank(): void {
    console.log('');
  }
}
