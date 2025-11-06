/**
 * Status dashboard - Quick overview of project code health
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer } from '../../project/project-analyzer';
import { ConfigLoader } from '../../config/config-loader';

export interface StatusOptions {
  verbose?: boolean;
  config?: string;
}

/**
 * Status dashboard command
 */
export async function statusCommand(
  target: string = '.',
  options: StatusOptions = {}
): Promise<void> {
  console.log('');
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('           📊 Code Health Dashboard'));
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log('');

  const targetPath = path.resolve(target);

  if (!fs.existsSync(targetPath)) {
    console.log(chalk.red(`❌ Target does not exist: ${targetPath}`));
    return;
  }

  const isDirectory = fs.statSync(targetPath).isDirectory();

  // Load configuration
  const config = options.config
    ? ConfigLoader.loadConfig(path.dirname(options.config))
    : ConfigLoader.loadConfig(targetPath);

  // Analyze project
  console.log(chalk.cyan('Analyzing project...'));
  console.log('');

  const analyzer = new ProjectAnalyzer();
  const result = await analyzer.analyzeProject({
    rootPath: isDirectory ? targetPath : path.dirname(targetPath),
    include: isDirectory ? undefined : [path.basename(targetPath)],
    exclude: config.ignore,
    showProgress: false,
  });

  console.log('');

  // Overall Health Score (0-100)
  const healthScore = calculateHealthScore(result);
  const healthGrade = getHealthGrade(healthScore);
  const healthColor = getHealthColor(healthScore);

  console.log(chalk.bold('OVERALL HEALTH'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');

  // Big health score display
  console.log(
    `  ${healthColor('█'.repeat(Math.floor(healthScore / 5)))}${chalk.gray('░'.repeat(Math.floor((100 - healthScore) / 5)))}`
  );
  console.log(
    `  ${healthColor(healthScore.toFixed(0))}${chalk.gray('/100')} - Grade: ${healthColor(healthGrade)}`
  );
  console.log('');

  // Files summary
  console.log(chalk.bold('FILES'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  Total files: ${chalk.cyan(result.summary.totalFiles)}`);
  console.log(`  Analyzed: ${chalk.green(result.summary.analyzedFiles)}`);
  if (result.summary.errorFiles > 0) {
    console.log(`  Errors: ${chalk.red(result.summary.errorFiles)}`);
  }
  console.log('');

  // Functions summary
  console.log(chalk.bold('FUNCTIONS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(`  Total functions: ${chalk.cyan(result.summary.totalFunctions)}`);
  console.log(
    `  Harmonious: ${chalk.green(result.summary.totalFunctions - result.summary.disharmoniousFunctions)}`
  );
  console.log(
    `  Disharmonious: ${chalk.yellow(result.summary.disharmoniousFunctions)}`
  );

  const harmoniousPercent =
    result.summary.totalFunctions > 0
      ? ((result.summary.totalFunctions - result.summary.disharmoniousFunctions) /
          result.summary.totalFunctions) *
        100
      : 100;
  console.log(
    `  Success rate: ${harmoniousPercent >= 80 ? chalk.green : harmoniousPercent >= 60 ? chalk.yellow : chalk.red}(${harmoniousPercent.toFixed(1)}%)`
  );
  console.log('');

  // Severity breakdown
  const severityCounts = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const file of result.files) {
    if (file.status === 'success') {
      for (const func of file.functions) {
        if (func.severity in severityCounts) {
          severityCounts[func.severity as keyof typeof severityCounts]++;
        }
      }
    }
  }

  console.log(chalk.bold('SEVERITY DISTRIBUTION'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(
    `  ${chalk.red('❌ HIGH')}: ${chalk.red(severityCounts.HIGH)} ${createBar(severityCounts.HIGH, result.summary.disharmoniousFunctions, chalk.red)}`
  );
  console.log(
    `  ${chalk.yellow('⚠️  MEDIUM')}: ${chalk.yellow(severityCounts.MEDIUM)} ${createBar(severityCounts.MEDIUM, result.summary.disharmoniousFunctions, chalk.yellow)}`
  );
  console.log(
    `  ${chalk.blue('ℹ️  LOW')}: ${chalk.blue(severityCounts.LOW)} ${createBar(severityCounts.LOW, result.summary.disharmoniousFunctions, chalk.blue)}`
  );
  console.log('');

  // Disharmony metrics
  console.log(chalk.bold('DISHARMONY METRICS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(
    `  Average: ${getDisharmonyColor(result.summary.averageDisharmony)(result.summary.averageDisharmony.toFixed(3))}`
  );
  console.log(
    `  Maximum: ${getDisharmonyColor(result.summary.maxDisharmony)(result.summary.maxDisharmony.toFixed(3))}`
  );
  console.log('');

  // Top 5 worst files
  const fileScores: Array<{ file: string; avgDisharmony: number; count: number }> =
    [];

  for (const file of result.files) {
    if (file.status === 'success' && file.functions.length > 0) {
      const disharmoniousFuncs = file.functions.filter((f) => f.disharmony > 0.3);
      if (disharmoniousFuncs.length > 0) {
        const avgDisharmony =
          disharmoniousFuncs.reduce((sum, f) => sum + f.disharmony, 0) /
          disharmoniousFuncs.length;
        fileScores.push({
          file: file.relativePath,
          avgDisharmony,
          count: disharmoniousFuncs.length,
        });
      }
    }
  }

  if (fileScores.length > 0) {
    fileScores.sort((a, b) => b.avgDisharmony - a.avgDisharmony);

    console.log(chalk.bold('TOP 5 FILES NEEDING ATTENTION'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');

    for (let i = 0; i < Math.min(5, fileScores.length); i++) {
      const file = fileScores[i];
      console.log(
        `  ${i + 1}. ${chalk.yellow(file.file)} - ${getDisharmonyColor(file.avgDisharmony)(file.avgDisharmony.toFixed(3))} avg (${file.count} issues)`
      );
    }
    console.log('');
  }

  // Recommendations
  console.log(chalk.bold('RECOMMENDATIONS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');

  if (healthScore >= 90) {
    console.log(chalk.green('  ✅ Excellent! Your code is in great shape.'));
    console.log(
      chalk.gray('     Keep up the good work and maintain this quality.')
    );
  } else if (healthScore >= 70) {
    console.log(chalk.yellow('  ⚠️  Good, but room for improvement.'));
    if (severityCounts.HIGH > 0) {
      console.log(
        `     • Fix ${severityCounts.HIGH} HIGH severity issues with: ${chalk.cyan('harmonizer fix --severity HIGH')}`
      );
    }
    console.log(
      `     • Review top problematic files: ${chalk.cyan('harmonizer ' + (fileScores[0]?.file || '.'))}`
    );
  } else {
    console.log(chalk.red('  ❌ Needs attention.'));
    console.log(
      `     • Start with HIGH severity: ${chalk.cyan('harmonizer fix --severity HIGH')}`
    );
    console.log(
      `     • Focus on top 5 worst files: ${chalk.cyan('harmonizer fix ' + (fileScores[0]?.file || '.'))}`
    );
    console.log(
      `     • Set up git hooks: ${chalk.cyan('harmonizer install-hooks')}`
    );
  }

  console.log('');

  // Detailed mode
  if (options.verbose) {
    console.log(chalk.bold('DETAILED BREAKDOWN'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');

    for (const file of result.files) {
      if (file.status === 'success') {
        const disharmonious = file.functions.filter((f) => f.disharmony > 0.3);
        if (disharmonious.length > 0) {
          console.log(chalk.cyan(`  ${file.relativePath}`));
          for (const func of disharmonious) {
            const icon =
              func.severity === 'HIGH'
                ? chalk.red('❌')
                : func.severity === 'MEDIUM'
                  ? chalk.yellow('⚠️')
                  : chalk.blue('ℹ️');
            console.log(
              `    ${icon} ${func.name} (${getDisharmonyColor(func.disharmony)(func.disharmony.toFixed(3))})`
            );
          }
          console.log('');
        }
      }
    }
  }

  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(chalk.cyan('💡 Tip: Use ') + chalk.white('harmonizer --help') + chalk.cyan(' for more commands'));
  console.log('');
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(result: any): number {
  if (result.summary.totalFunctions === 0) {
    return 100;
  }

  // Base score: percentage of harmonious functions
  const harmoniousPercent =
    ((result.summary.totalFunctions - result.summary.disharmoniousFunctions) /
      result.summary.totalFunctions) *
    100;

  // Penalties
  let score = harmoniousPercent;

  // Penalty for high average disharmony
  if (result.summary.averageDisharmony > 0.5) {
    score -= (result.summary.averageDisharmony - 0.5) * 20;
  }

  // Penalty for very high max disharmony
  if (result.summary.maxDisharmony > 0.8) {
    score -= (result.summary.maxDisharmony - 0.8) * 10;
  }

  // Penalty for errors
  if (result.summary.errorFiles > 0) {
    score -= (result.summary.errorFiles / result.summary.totalFiles) * 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get health grade (A-F)
 */
function getHealthGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get color function based on health score
 */
function getHealthColor(score: number): (text: string) => string {
  if (score >= 80) return chalk.green;
  if (score >= 60) return chalk.yellow;
  return chalk.red;
}

/**
 * Get color function based on disharmony value
 */
function getDisharmonyColor(disharmony: number): (text: string) => string {
  if (disharmony >= 0.7) return chalk.red;
  if (disharmony >= 0.5) return chalk.yellow;
  return chalk.blue;
}

/**
 * Create a simple bar chart
 */
function createBar(
  value: number,
  max: number,
  color: (text: string) => string
): string {
  if (max === 0) return '';
  const barLength = 20;
  const filled = Math.round((value / max) * barLength);
  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(barLength - filled));
}
