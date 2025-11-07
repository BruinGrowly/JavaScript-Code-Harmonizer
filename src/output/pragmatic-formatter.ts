/**
 * Pragmatic output formatter - focuses on practical bug detection
 * Less mysticism, more actionable insights
 */

import chalk from 'chalk';
import { FileAnalysisResult } from '../project/project-analyzer';

export interface PragmaticFormatterOptions {
  showSuggestions?: boolean;
  showDataFlow?: boolean;
  minConfidence?: number;
}

/**
 * Format analysis results in pragmatic style
 */
export class PragmaticFormatter {
  /**
   * Format function issue in pragmatic style
   */
  static formatFunctionIssue(
    func: any,
    file: string,
    options: PragmaticFormatterOptions = {}
  ): string {
    const lines: string[] = [];
    const minConfidence = options.minConfidence ?? 0.7;

    // Show location
    lines.push(
      chalk.yellow(`${file}:${func.line}`) + chalk.gray(` - ${func.name}()`)
    );

    // Describe the problem in plain English
    const problem = this.describeProblem(func);
    lines.push(chalk.gray(`  Issue: ${problem}`));

    // Show severity as practical impact
    const impact = this.describeImpact(func.severity);
    lines.push(chalk.gray(`  Impact: ${impact}`));

    // Show confidence score
    lines.push(
      chalk.gray(`  Confidence: ${(func.disharmony * 100).toFixed(0)}%`)
    );

    // Show baseline metrics if available
    if (func.baselines) {
      const b = func.baselines;
      lines.push('');
      lines.push(chalk.cyan('  Quality Metrics:'));
      lines.push(
        chalk.gray(
          `    Composite Score: ${chalk.white(b.compositeScore.toFixed(2))} - ${b.interpretation}`
        )
      );
      lines.push(
        chalk.gray(
          `    Robustness: ${chalk.white(b.robustness.toFixed(2))} | ` +
            `Effectiveness: ${chalk.white(b.effectiveness.toFixed(2))} | ` +
            `Growth: ${chalk.white(b.growthPotential.toFixed(2))}`
        )
      );
    }

    // Show suggestions if available and meet confidence threshold
    if (
      options.showSuggestions &&
      func.suggestions &&
      func.suggestions.length > 0
    ) {
      const goodSuggestions = func.suggestions.filter(
        (s: any) => s.similarity >= minConfidence
      );

      if (goodSuggestions.length > 0) {
        lines.push('');
        lines.push(chalk.cyan('  Suggested fixes:'));
        goodSuggestions.slice(0, 3).forEach((s: any, i: number) => {
          const confidence = (s.similarity * 100).toFixed(0);
          lines.push(
            chalk.gray(`    ${i + 1}. Rename to ${chalk.white(s.name + '()')} (${confidence}% match)`)
          );
        });
      }
    }

    lines.push('');
    return lines.join('\n');
  }

  /**
   * Describe the problem in plain English
   */
  private static describeProblem(func: any): string {
    const intentDom = func.intent?.dominant || 'unknown';
    const execDom = func.execution?.dominant || 'unknown';

    if (intentDom === execDom) {
      return 'Function name and implementation are consistent';
    }

    const actionMap: Record<string, string> = {
      wisdom: 'reads/retrieves data',
      power: 'modifies/creates/deletes data',
      justice: 'validates/checks data',
      love: 'connects/relates data',
    };

    const nameAction = actionMap[intentDom] || 'performs unknown action';
    const codeAction = actionMap[execDom] || 'performs unknown action';

    return `Name suggests it ${nameAction}, but code actually ${codeAction}`;
  }

  /**
   * Describe the practical impact of the severity
   */
  private static describeImpact(severity: string): string {
    const impactMap: Record<string, string> = {
      HIGH: 'Critical - Likely to cause bugs in production',
      MEDIUM: 'Moderate - May confuse developers, review recommended',
      LOW: 'Minor - Consider renaming for clarity',
      EXCELLENT: 'None - Function is well-named',
    };

    return impactMap[severity] || 'Unknown impact';
  }

  /**
   * Format a file summary in pragmatic style
   */
  static formatFileSummary(result: FileAnalysisResult): string {
    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.bold(`File: ${result.relativePath}`));
    lines.push(chalk.gray('─'.repeat(60)));

    if (result.status === 'error') {
      lines.push(chalk.red(`  Error: ${result.error}`));
      return lines.join('\n');
    }

    if (result.status !== 'success') {
      return lines.join('\n');
    }

    const issues = result.functions.filter((f) => f.disharmony > 0.5);

    if (issues.length === 0) {
      lines.push(chalk.green('  ✓ No naming issues detected'));
      lines.push('');
      return lines.join('\n');
    }

    lines.push(chalk.yellow(`  ${issues.length} naming issue(s) found:`));
    lines.push('');

    // Group by severity
    const high = issues.filter((f) => f.severity === 'HIGH');
    const medium = issues.filter((f) => f.severity === 'MEDIUM');
    const low = issues.filter((f) => f.severity === 'LOW');

    if (high.length > 0) {
      lines.push(chalk.red(`  🔴 ${high.length} high-priority`));
      high.forEach((f) => {
        lines.push(
          chalk.gray(`     • ${f.name}() at line ${f.line}`)
        );
      });
    }

    if (medium.length > 0) {
      lines.push(chalk.yellow(`  🟡 ${medium.length} medium-priority`));
      medium.forEach((f) => {
        lines.push(
          chalk.gray(`     • ${f.name}() at line ${f.line}`)
        );
      });
    }

    if (low.length > 0) {
      lines.push(chalk.blue(`  🔵 ${low.length} low-priority`));
      low.forEach((f) => {
        lines.push(
          chalk.gray(`     • ${f.name}() at line ${f.line}`)
        );
      });
    }

    lines.push('');
    return lines.join('\n');
  }

  /**
   * Format project summary in pragmatic style
   */
  static formatProjectSummary(results: FileAnalysisResult[]): string {
    const lines: string[] = [];

    const totalFiles = results.length;
    const successFiles = results.filter((r) => r.status === 'success').length;
    const errorFiles = results.filter((r) => r.status === 'error').length;

    let totalFunctions = 0;
    let totalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    results.forEach((r) => {
      if (r.status === 'success') {
        totalFunctions += r.functions.length;
        r.functions.forEach((f) => {
          if (f.disharmony > 0.5) {
            totalIssues++;
            if (f.severity === 'HIGH') highIssues++;
            else if (f.severity === 'MEDIUM') mediumIssues++;
            else if (f.severity === 'LOW') lowIssues++;
          }
        });
      }
    });

    lines.push('');
    lines.push(chalk.bold('SUMMARY'));
    lines.push(chalk.gray('─'.repeat(60)));
    lines.push('');
    lines.push(
      `  Files analyzed: ${chalk.cyan(successFiles.toString())} of ${totalFiles}`
    );

    if (errorFiles > 0) {
      lines.push(`  Files with errors: ${chalk.red(errorFiles.toString())}`);
    }

    lines.push(`  Functions checked: ${chalk.cyan(totalFunctions.toString())}`);
    lines.push('');

    if (totalIssues === 0) {
      lines.push(chalk.green('  ✓ No naming issues detected!'));
      lines.push('');
      lines.push(chalk.gray('  Your function names accurately describe their behavior.'));
    } else {
      lines.push(
        `  ${chalk.yellow('Naming issues found:')} ${chalk.bold(totalIssues.toString())}`
      );
      lines.push('');

      if (highIssues > 0) {
        lines.push(
          `    ${chalk.red('●')} ${highIssues} high-priority ${chalk.gray('(review immediately)')}`
        );
      }
      if (mediumIssues > 0) {
        lines.push(
          `    ${chalk.yellow('●')} ${mediumIssues} medium-priority ${chalk.gray('(review when possible)')}`
        );
      }
      if (lowIssues > 0) {
        lines.push(
          `    ${chalk.blue('●')} ${lowIssues} low-priority ${chalk.gray('(optional cleanup)')}`
        );
      }

      lines.push('');
      lines.push(chalk.cyan('  Next steps:'));

      if (highIssues > 0) {
        lines.push(
          chalk.gray('    1. Fix high-priority issues: ') +
            chalk.white('harmonizer fix --severity HIGH')
        );
      }
      lines.push(
        chalk.gray('    2. Review details: ') +
          chalk.white('harmonizer explain <file>:<line>')
      );
      lines.push(
        chalk.gray('    3. Check project health: ') +
          chalk.white('harmonizer status')
      );
    }

    lines.push('');
    return lines.join('\n');
  }
}
