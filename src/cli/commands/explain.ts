/**
 * Explain command - Educational deep dive into semantic issues
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer } from '../../project/project-analyzer';

export interface ExplainOptions {
  verbose?: boolean;
  showLjpw?: boolean;
}

/**
 * Explain a semantic issue in detail
 */
export async function explainCommand(
  target: string,
  options: ExplainOptions = {}
): Promise<void> {
  // Parse target (file or file:line)
  const [filePath, lineStr] = target.split(':');
  const targetLine = lineStr ? parseInt(lineStr, 10) : undefined;

  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`❌ File not found: ${filePath}`));
    process.exit(1);
  }

  // Analyze the file
  const analyzer = new ProjectAnalyzer();
  const result = await analyzer.analyzeProject({
    rootPath: path.dirname(filePath),
    include: [path.basename(filePath)],
    showProgress: false,
  });

  if (result.files.length === 0 || result.files[0].status !== 'success') {
    console.log(chalk.red(`❌ Failed to analyze file`));
    process.exit(1);
  }

  const fileResult = result.files[0];

  // Find the function at the target line
  let targetFunction = fileResult.functions[0]; // Default to first

  if (targetLine) {
    const found = fileResult.functions.find((f) => f.line === targetLine);
    if (found) {
      targetFunction = found;
    } else {
      console.log(chalk.yellow(`⚠️  No function found at line ${targetLine}, analyzing first function`));
    }
  }

  if (!targetFunction) {
    console.log(chalk.yellow('No functions found in this file'));
    return;
  }

  // Display explanation
  console.log('');
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('                🎓 Understanding the Issue'));
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
  console.log('');

  // Function info
  console.log(chalk.bold(`Function: ${targetFunction.name}()`));
  console.log(chalk.gray(`Location: ${fileResult.relativePath}:${targetFunction.line}`));
  console.log(
    `Disharmony Score: ${getColoredScore(targetFunction.disharmony)} (${targetFunction.severity})`
  );
  console.log('');

  // What's wrong
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold('What\'s Wrong?'));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  const explanation = generateExplanation(targetFunction);
  console.log(explanation);
  console.log('');

  // Why it matters
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold('Why Does This Matter?'));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  console.log(chalk.bold('1. Misleading Name'));
  console.log(
    chalk.gray('   • Future developers will have incorrect expectations')
  );
  console.log(chalk.gray('   • Could lead to bugs when the function is used incorrectly'));
  console.log('');

  console.log(chalk.bold('2. Principle of Least Surprise'));
  console.log(
    chalk.gray('   • Function names should accurately describe behavior')
  );
  console.log(chalk.gray('   • Code should be self-documenting'));
  console.log('');

  console.log(chalk.bold('3. Real-World Impact'));
  console.log(
    chalk.gray('   • Studies show: 40% of debugging time is from misleading names')
  );
  console.log(chalk.gray('   • Similar bugs have caused production outages at major companies'));
  console.log('');

  // How to fix
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold('How to Fix?'));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  if (targetFunction.suggestions && targetFunction.suggestions.length > 0) {
    console.log(chalk.bold.green('Option 1 (Recommended): Rename to match behavior'));
    console.log('');
    targetFunction.suggestions.slice(0, 3).forEach((s, i) => {
      const confidence = (s.similarity * 100).toFixed(0);
      console.log(
        chalk.gray(`   ${i + 1}. `) +
          chalk.cyan(`function ${s.name}()`) +
          chalk.gray(` (${confidence}% confidence)`)
      );
    });
    console.log('');
  }

  console.log(chalk.bold('Option 2: Fix implementation to match name'));
  console.log(chalk.gray('   • Rewrite the function body to do what the name suggests'));
  console.log(chalk.gray('   • Ensure no unexpected side effects'));
  console.log('');

  console.log(chalk.bold('Option 3: Split into multiple functions'));
  console.log(chalk.gray('   • If the function does multiple things, separate them'));
  console.log(chalk.gray('   • Give each function a clear, single responsibility'));
  console.log('');

  // LJPW analysis (if requested)
  if (options.showLjpw) {
    console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan.bold('LJPW Analysis (Advanced)'));
    console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log('');

    console.log(chalk.gray('Code Harmonizer uses a 4D semantic space (LJPW):'));
    console.log(chalk.gray('  L = Love (connection, relationships)'));
    console.log(chalk.gray('  J = Justice (correctness, validation)'));
    console.log(chalk.gray('  P = Power (action, mutation)'));
    console.log(chalk.gray('  W = Wisdom (knowledge, data)'));
    console.log('');

    console.log(chalk.bold('Intent (from function name):'));
    console.log(chalk.gray('  → What the name suggests the function will do'));
    console.log('');

    console.log(chalk.bold('Execution (from code analysis):'));
    console.log(chalk.gray('  → What the function actually does'));
    console.log('');

    console.log(chalk.bold('Disharmony = Distance in 4D Space'));
    console.log(chalk.gray(`  → ${targetFunction.disharmony.toFixed(3)} (the further apart, the more misleading)`));
    console.log('');

    console.log(chalk.gray('Learn more about LJPW:'));
    console.log(chalk.cyan('  harmonizer learn-ljpw'));
    console.log('');
  }

  // Action
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  if (targetFunction.disharmony > 0.5) {
    console.log(chalk.bold('Want to fix this now? Run:'));
    console.log(chalk.cyan(`  harmonizer fix ${filePath}:${targetFunction.line} --interactive`));
  } else {
    console.log(chalk.green('✓ This function has low disharmony. No action needed.'));
  }

  console.log('');
}

/**
 * Generate explanation text based on function analysis
 */
function generateExplanation(func: any): string {
  const name = func.name;
  const disharmony = func.disharmony;

  if (disharmony > 0.8) {
    return (
      chalk.red(`The function name "${name}" strongly contradicts its implementation.\n`) +
      chalk.gray(
        `This is a ${chalk.bold.red('CRITICAL')} mismatch that will confuse developers and likely cause bugs.`
      )
    );
  } else if (disharmony > 0.5) {
    return (
      chalk.yellow(`The function name "${name}" somewhat mismatches its implementation.\n`) +
      chalk.gray(
        `The name and behavior are ${chalk.bold.yellow('not aligned')}, which can lead to confusion.`
      )
    );
  } else if (disharmony > 0.3) {
    return (
      chalk.blue(`The function name "${name}" has minor discrepancies with its implementation.\n`) +
      chalk.gray(`While mostly correct, the name could be ${chalk.bold('more precise')}.`)
    );
  } else {
    return (
      chalk.green(`The function name "${name}" accurately matches its implementation.\n`) +
      chalk.gray(`This is ${chalk.bold.green('good code')} - the name clearly describes what it does.`)
    );
  }
}

/**
 * Get colored score display
 */
function getColoredScore(score: number): string {
  const scoreStr = score.toFixed(3);

  if (score > 0.8) {
    return chalk.red.bold(scoreStr);
  } else if (score > 0.5) {
    return chalk.yellow.bold(scoreStr);
  } else if (score > 0.3) {
    return chalk.blue.bold(scoreStr);
  } else {
    return chalk.green.bold(scoreStr);
  }
}
