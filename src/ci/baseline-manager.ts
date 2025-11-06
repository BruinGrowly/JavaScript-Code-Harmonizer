/**
 * Baseline manager for CI/CD integration
 * Compares current analysis with baseline to detect regressions
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalysisResult } from '../project/project-analyzer';

export interface BaselineComparison {
  status: 'improved' | 'degraded' | 'unchanged' | 'no-baseline';
  baseline: BaselineMetrics | null;
  current: BaselineMetrics;
  diff: {
    disharmoniousFunctions: number;
    averageDisharmony: number;
    maxDisharmony: number;
    totalFunctions: number;
  };
  regressions: Array<{
    file: string;
    function: string;
    baselineDisharmony: number;
    currentDisharmony: number;
    increase: number;
  }>;
  improvements: Array<{
    file: string;
    function: string;
    baselineDisharmony: number;
    currentDisharmony: number;
    decrease: number;
  }>;
}

export interface BaselineMetrics {
  timestamp: string;
  totalFunctions: number;
  disharmoniousFunctions: number;
  averageDisharmony: number;
  maxDisharmony: number;
  files: Record<
    string,
    {
      functions: Record<
        string,
        {
          disharmony: number;
          severity: string;
        }
      >;
    }
  >;
}

/**
 * Baseline manager
 */
export class BaselineManager {
  /**
   * Extract baseline metrics from analysis result
   */
  static extractMetrics(result: ProjectAnalysisResult): BaselineMetrics {
    const files: BaselineMetrics['files'] = {};

    for (const file of result.files) {
      if (file.status === 'success') {
        const functions: Record<string, { disharmony: number; severity: string }> = {};

        for (const func of file.functions) {
          functions[func.name] = {
            disharmony: func.disharmony,
            severity: func.severity,
          };
        }

        files[file.relativePath] = { functions };
      }
    }

    return {
      timestamp: result.timestamp,
      totalFunctions: result.summary.totalFunctions,
      disharmoniousFunctions: result.summary.disharmoniousFunctions,
      averageDisharmony: result.summary.averageDisharmony,
      maxDisharmony: result.summary.maxDisharmony,
      files,
    };
  }

  /**
   * Save baseline to file
   */
  static saveBaseline(metrics: BaselineMetrics, filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2), 'utf-8');
  }

  /**
   * Load baseline from file
   */
  static loadBaseline(filePath: string): BaselineMetrics | null {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as BaselineMetrics;
    } catch (error) {
      console.warn(
        `⚠️  Failed to load baseline from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Compare current analysis with baseline
   */
  static compare(
    current: ProjectAnalysisResult,
    baselinePath: string
  ): BaselineComparison {
    const baseline = this.loadBaseline(baselinePath);
    const currentMetrics = this.extractMetrics(current);

    if (!baseline) {
      return {
        status: 'no-baseline',
        baseline: null,
        current: currentMetrics,
        diff: {
          disharmoniousFunctions: 0,
          averageDisharmony: 0,
          maxDisharmony: 0,
          totalFunctions: 0,
        },
        regressions: [],
        improvements: [],
      };
    }

    // Calculate overall differences
    const diff = {
      disharmoniousFunctions: currentMetrics.disharmoniousFunctions - baseline.disharmoniousFunctions,
      averageDisharmony: currentMetrics.averageDisharmony - baseline.averageDisharmony,
      maxDisharmony: currentMetrics.maxDisharmony - baseline.maxDisharmony,
      totalFunctions: currentMetrics.totalFunctions - baseline.totalFunctions,
    };

    // Find regressions and improvements
    const regressions: BaselineComparison['regressions'] = [];
    const improvements: BaselineComparison['improvements'] = [];

    for (const [filePath, fileData] of Object.entries(currentMetrics.files)) {
      const baselineFile = baseline.files[filePath];

      for (const [funcName, funcData] of Object.entries(fileData.functions)) {
        const baselineFunc = baselineFile?.functions[funcName];

        if (baselineFunc) {
          const change = funcData.disharmony - baselineFunc.disharmony;

          if (change > 0.1) {
            // Significant regression
            regressions.push({
              file: filePath,
              function: funcName,
              baselineDisharmony: baselineFunc.disharmony,
              currentDisharmony: funcData.disharmony,
              increase: change,
            });
          } else if (change < -0.1) {
            // Significant improvement
            improvements.push({
              file: filePath,
              function: funcName,
              baselineDisharmony: baselineFunc.disharmony,
              currentDisharmony: funcData.disharmony,
              decrease: Math.abs(change),
            });
          }
        }
      }
    }

    // Sort by severity
    regressions.sort((a, b) => b.increase - a.increase);
    improvements.sort((a, b) => b.decrease - a.decrease);

    // Determine overall status
    let status: BaselineComparison['status'] = 'unchanged';
    if (regressions.length > 0 || diff.disharmoniousFunctions > 0) {
      status = 'degraded';
    } else if (improvements.length > 0 || diff.disharmoniousFunctions < 0) {
      status = 'improved';
    }

    return {
      status,
      baseline,
      current: currentMetrics,
      diff,
      regressions,
      improvements,
    };
  }

  /**
   * Determine exit code based on comparison and thresholds
   */
  static getExitCode(
    comparison: BaselineComparison,
    failOnHigh: boolean,
    failOnMedium: boolean,
    current: ProjectAnalysisResult
  ): number {
    // Exit code 0 = success, 1 = failure, 2 = error

    // Check for analysis errors
    if (current.summary.errorFiles > 0) {
      return 2;
    }

    // Check for regressions
    if (comparison.status === 'degraded' && comparison.regressions.length > 0) {
      return 1;
    }

    // Check for HIGH severity issues
    const highSeverityCount = current.files.reduce((count, file) => {
      return (
        count + file.functions.filter((f) => f.severity === 'HIGH').length
      );
    }, 0);

    if (failOnHigh && highSeverityCount > 0) {
      return 1;
    }

    // Check for MEDIUM severity issues
    const mediumSeverityCount = current.files.reduce((count, file) => {
      return (
        count + file.functions.filter((f) => f.severity === 'MEDIUM').length
      );
    }, 0);

    if (failOnMedium && mediumSeverityCount > 0) {
      return 1;
    }

    return 0;
  }

  /**
   * Format comparison as human-readable text
   */
  static formatComparison(comparison: BaselineComparison): string {
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('                   BASELINE COMPARISON                     ');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');

    if (comparison.status === 'no-baseline') {
      lines.push('⚠️  No baseline found. Use --save-baseline to create one.');
      lines.push('');
      lines.push(`Current metrics:`);
      lines.push(`  Total functions: ${comparison.current.totalFunctions}`);
      lines.push(`  Disharmonious functions: ${comparison.current.disharmoniousFunctions}`);
      lines.push(
        `  Average disharmony: ${comparison.current.averageDisharmony.toFixed(3)}`
      );
      lines.push(`  Max disharmony: ${comparison.current.maxDisharmony.toFixed(3)}`);
      return lines.join('\n');
    }

    // Status
    const statusEmoji =
      comparison.status === 'improved'
        ? '✅'
        : comparison.status === 'degraded'
          ? '❌'
          : '➖';
    lines.push(`Status: ${statusEmoji} ${comparison.status.toUpperCase()}`);
    lines.push('');

    // Overall metrics comparison
    lines.push('Overall Changes:');
    lines.push(
      `  Total functions: ${comparison.baseline!.totalFunctions} → ${comparison.current.totalFunctions} (${comparison.diff.totalFunctions >= 0 ? '+' : ''}${comparison.diff.totalFunctions})`
    );
    lines.push(
      `  Disharmonious functions: ${comparison.baseline!.disharmoniousFunctions} → ${comparison.current.disharmoniousFunctions} (${comparison.diff.disharmoniousFunctions >= 0 ? '+' : ''}${comparison.diff.disharmoniousFunctions})`
    );
    lines.push(
      `  Average disharmony: ${comparison.baseline!.averageDisharmony.toFixed(3)} → ${comparison.current.averageDisharmony.toFixed(3)} (${comparison.diff.averageDisharmony >= 0 ? '+' : ''}${comparison.diff.averageDisharmony.toFixed(3)})`
    );
    lines.push(
      `  Max disharmony: ${comparison.baseline!.maxDisharmony.toFixed(3)} → ${comparison.current.maxDisharmony.toFixed(3)} (${comparison.diff.maxDisharmony >= 0 ? '+' : ''}${comparison.diff.maxDisharmony.toFixed(3)})`
    );
    lines.push('');

    // Regressions
    if (comparison.regressions.length > 0) {
      lines.push(`❌ Regressions (${comparison.regressions.length}):`);
      for (const reg of comparison.regressions.slice(0, 10)) {
        lines.push(
          `  ${reg.file}:${reg.function} - ${reg.baselineDisharmony.toFixed(3)} → ${reg.currentDisharmony.toFixed(3)} (+${reg.increase.toFixed(3)})`
        );
      }
      if (comparison.regressions.length > 10) {
        lines.push(`  ... and ${comparison.regressions.length - 10} more`);
      }
      lines.push('');
    }

    // Improvements
    if (comparison.improvements.length > 0) {
      lines.push(`✅ Improvements (${comparison.improvements.length}):`);
      for (const imp of comparison.improvements.slice(0, 10)) {
        lines.push(
          `  ${imp.file}:${imp.function} - ${imp.baselineDisharmony.toFixed(3)} → ${imp.currentDisharmony.toFixed(3)} (-${imp.decrease.toFixed(3)})`
        );
      }
      if (comparison.improvements.length > 10) {
        lines.push(`  ... and ${comparison.improvements.length - 10} more`);
      }
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}
