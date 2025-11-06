/**
 * Interactive fix command - Guide users through refactoring disharmonious functions
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { createPrompter } from '../prompter';
import { ProjectAnalyzer } from '../../project/project-analyzer';
import { FileAnalysisResult } from '../../project/project-analyzer';

export interface FixOptions {
  threshold?: number;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  dryRun?: boolean;
  autoApply?: boolean;
}

interface FixCandidate {
  file: string;
  function: {
    name: string;
    line: number;
    disharmony: number;
    severity: string;
    suggestions?: Array<{ name: string; similarity: number }>;
    startLine?: number;
    endLine?: number;
  };
  fileResult: FileAnalysisResult;
}

/**
 * Interactive fix command
 */
export async function fixCommand(
  target: string,
  options: FixOptions = {}
): Promise<void> {
  const prompter = createPrompter();

  try {
    console.log('');
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('           🔨 Interactive Fix Mode'));
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log('');

    const targetPath = path.resolve(target);

    if (!fs.existsSync(targetPath)) {
      console.log(chalk.red(`❌ Target does not exist: ${targetPath}`));
      return;
    }

    const isDirectory = fs.statSync(targetPath).isDirectory();

    // Analyze target
    console.log(chalk.cyan('Analyzing code...'));
    console.log('');

    const analyzer = new ProjectAnalyzer();
    const result = await analyzer.analyzeProject({
      rootPath: isDirectory ? targetPath : path.dirname(targetPath),
      include: isDirectory ? undefined : [path.basename(targetPath)],
      showProgress: false,
    });

    // Collect fix candidates
    const candidates: FixCandidate[] = [];
    const threshold = options.threshold ?? 0.5;

    for (const file of result.files) {
      if (file.status !== 'success') {
        continue;
      }

      for (const func of file.functions) {
        // Filter by threshold and severity
        if (func.disharmony < threshold) {
          continue;
        }

        if (options.severity && func.severity !== options.severity) {
          continue;
        }

        // Must have suggestions
        if (!func.suggestions || func.suggestions.length === 0) {
          continue;
        }

        candidates.push({
          file: file.relativePath,
          function: func,
          fileResult: file,
        });
      }
    }

    if (candidates.length === 0) {
      console.log(chalk.green('✅ No issues found that can be auto-fixed!'));
      console.log('');
      return;
    }

    // Sort by severity and disharmony
    candidates.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const severityDiff =
        (severityOrder[b.function.severity as keyof typeof severityOrder] || 0) -
        (severityOrder[a.function.severity as keyof typeof severityOrder] || 0);

      if (severityDiff !== 0) {
        return severityDiff;
      }

      return b.function.disharmony - a.function.disharmony;
    });

    console.log(chalk.cyan(`Found ${candidates.length} functions that can be fixed`));
    console.log('');

    if (options.dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made'));
      console.log('');
    }

    let fixedCount = 0;
    let skippedCount = 0;

    // Process each candidate
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      console.log(chalk.gray('─'.repeat(60)));
      console.log('');
      console.log(
        chalk.cyan(`[${i + 1}/${candidates.length}] `) +
          chalk.white(`${candidate.file}:${candidate.function.line}`)
      );
      console.log('');

      // Show current function
      const icon =
        candidate.function.severity === 'HIGH'
          ? chalk.red('❌')
          : candidate.function.severity === 'MEDIUM'
            ? chalk.yellow('⚠️')
            : chalk.blue('ℹ️');

      console.log(
        `${icon} Function: ${chalk.white.bold(candidate.function.name)}`
      );
      console.log(
        `   Disharmony: ${chalk.red(candidate.function.disharmony.toFixed(3))} [${candidate.function.severity}]`
      );
      console.log('');

      // Show suggestions
      console.log(chalk.cyan('Suggested names:'));
      if (candidate.function.suggestions && candidate.function.suggestions.length > 0) {
        candidate.function.suggestions.slice(0, 5).forEach((s, idx) => {
          const confidence = (s.similarity * 100).toFixed(1);
          const color = s.similarity > 0.8 ? chalk.green : s.similarity > 0.6 ? chalk.yellow : chalk.gray;
          console.log(`  ${idx + 1}. ${color(s.name)} (${confidence}% confidence)`);
        });
      } else {
        console.log(chalk.gray('  No suggestions available'));
      }
      console.log('');

      if (options.autoApply) {
        // Auto-apply top suggestion
        if (candidate.function.suggestions && candidate.function.suggestions.length > 0) {
          const topSuggestion = candidate.function.suggestions[0];
          console.log(
            chalk.cyan('Auto-applying: ') + chalk.green(topSuggestion.name)
          );
          console.log('');

          if (!options.dryRun) {
            const success = await applyFix(
              candidate,
              topSuggestion.name,
              targetPath
            );
            if (success) {
              fixedCount++;
              console.log(chalk.green('✅ Fixed!'));
            } else {
              skippedCount++;
              console.log(chalk.yellow('⚠️  Could not apply fix'));
            }
          } else {
            console.log(chalk.gray('(dry run - no changes made)'));
          }
        } else {
          console.log(chalk.yellow('⚠️  No suggestions available to apply'));
          skippedCount++;
        }

        console.log('');
        continue;
      }

      // Interactive mode
      const suggestionChoices = candidate.function.suggestions
        ? candidate.function.suggestions.slice(0, 5).map((s) => `Rename to: ${s.name}`)
        : [];

      const choices = [
        ...suggestionChoices,
        'Skip this function',
        'Skip all remaining',
        'Exit',
      ];

      const action = await prompter.choice(
        'What would you like to do?',
        choices,
        0
      );

      console.log('');

      if (action === 'Exit') {
        console.log(chalk.yellow('Exiting...'));
        break;
      }

      if (action === 'Skip all remaining') {
        console.log(chalk.yellow('Skipping all remaining functions'));
        skippedCount += candidates.length - i;
        break;
      }

      if (action === 'Skip this function') {
        console.log(chalk.gray('Skipped'));
        skippedCount++;
        console.log('');
        continue;
      }

      // Extract new name from action
      const newName = action.replace('Rename to: ', '');

      // Show preview
      console.log(chalk.cyan('Preview:'));
      console.log(
        `  ${chalk.red(candidate.function.name)} → ${chalk.green(newName)}`
      );
      console.log('');

      const confirm = await prompter.confirm('Apply this fix?', true);
      console.log('');

      if (!confirm) {
        console.log(chalk.gray('Skipped'));
        skippedCount++;
        console.log('');
        continue;
      }

      if (!options.dryRun) {
        const success = await applyFix(candidate, newName, targetPath);
        if (success) {
          fixedCount++;
          console.log(chalk.green('✅ Fixed!'));
        } else {
          skippedCount++;
          console.log(chalk.yellow('⚠️  Could not apply fix'));
        }
      } else {
        console.log(chalk.gray('(dry run - no changes made)'));
      }

      console.log('');
    }

    // Summary
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log(chalk.cyan.bold('Summary:'));
    console.log(`  Fixed: ${chalk.green(fixedCount)}`);
    console.log(`  Skipped: ${chalk.yellow(skippedCount)}`);
    console.log(
      `  Total: ${candidates.length}`
    );
    console.log('');

    if (fixedCount > 0 && !options.dryRun) {
      console.log(chalk.green('✅ Fixes applied successfully!'));
      console.log('');
      console.log(chalk.cyan('Next steps:'));
      console.log('  1. Review the changes');
      console.log('  2. Run your tests');
      console.log('  3. Commit the changes');
      console.log('');
    }
  } finally {
    prompter.close();
  }
}

/**
 * Apply a fix by renaming a function
 */
async function applyFix(
  candidate: FixCandidate,
  newName: string,
  rootPath: string
): Promise<boolean> {
  try {
    const filePath = path.join(rootPath, candidate.file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find the function declaration line
    const funcLine = lines[candidate.function.line - 1];

    if (!funcLine) {
      return false;
    }

    // Replace function name
    // Handle various function declaration patterns
    const patterns = [
      // function name()
      new RegExp(`\\bfunction\\s+${candidate.function.name}\\s*\\(`),
      // const name = function()
      new RegExp(`\\bconst\\s+${candidate.function.name}\\s*=\\s*function\\s*\\(`),
      // let name = function()
      new RegExp(`\\blet\\s+${candidate.function.name}\\s*=\\s*function\\s*\\(`),
      // var name = function()
      new RegExp(`\\bvar\\s+${candidate.function.name}\\s*=\\s*function\\s*\\(`),
      // const name = () =>
      new RegExp(`\\bconst\\s+${candidate.function.name}\\s*=\\s*\\(`),
      // name: function()
      new RegExp(`\\b${candidate.function.name}\\s*:\\s*function\\s*\\(`),
      // name() { (method)
      new RegExp(`\\b${candidate.function.name}\\s*\\(`),
    ];

    let replaced = false;
    for (const pattern of patterns) {
      if (pattern.test(funcLine)) {
        lines[candidate.function.line - 1] = funcLine.replace(
          candidate.function.name,
          newName
        );
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      return false;
    }

    // Write back
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return true;
  } catch (error) {
    console.error(
      chalk.red(
        `Error applying fix: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    return false;
  }
}
