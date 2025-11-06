/**
 * Interactive onboarding tutorial - 5-minute guided walkthrough
 */

import chalk from 'chalk';
import { createPrompter } from '../prompter';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer } from '../../project/project-analyzer';

/**
 * Tutorial command - walks users through Code Harmonizer features
 */
export async function tutorialCommand(): Promise<void> {
  const prompter = createPrompter();

  try {
    console.log('');
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('     🎓 Welcome to Code Harmonizer Tutorial'));
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log('');
    console.log(
      chalk.gray('This 5-minute tutorial will show you everything you need to know.')
    );
    console.log('');

    await prompter.waitForEnter();

    // Step 1: Introduction
    console.log('');
    console.log(chalk.cyan.bold('STEP 1: What is Code Harmonizer?'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Code Harmonizer detects ' + chalk.yellow('semantic bugs') + ' - when function names');
    console.log("don't match what they actually do.");
    console.log('');
    console.log(chalk.bold('Example:'));
    console.log('');
    console.log(chalk.gray('  // This function name says "get" but it modifies data!'));
    console.log(chalk.red('  function getUserData(userId) {'));
    console.log(chalk.red('    const user = database.find(userId);'));
    console.log(chalk.red('    user.lastAccess = Date.now();  // ⚠️ Side effect!'));
    console.log(chalk.red('    database.update(user);         // ⚠️ Modifying!'));
    console.log(chalk.red('    return user;'));
    console.log(chalk.red('  }'));
    console.log('');
    console.log(chalk.gray('  // Better name:'));
    console.log(chalk.green('  function updateUserAccessAndGet(userId) { ... }'));
    console.log('');
    console.log(
      'Code Harmonizer uses ' + chalk.cyan('semantic analysis') + ' to find these issues.'
    );
    console.log('');

    await prompter.waitForEnter();

    // Step 2: Basic Analysis
    console.log('');
    console.log(chalk.cyan.bold('STEP 2: Running Your First Analysis'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('The most basic command:');
    console.log('');
    console.log(`  ${chalk.white('harmonizer ./your-file.js')}`);
    console.log('');
    console.log('Or analyze a whole directory:');
    console.log('');
    console.log(`  ${chalk.white('harmonizer ./src --recursive')}`);
    console.log('');

    const hasCode = await prompter.confirm(
      'Do you have some JavaScript code we can analyze right now?',
      true
    );
    console.log('');

    if (hasCode) {
      const target = await prompter.input(
        'Enter path to file or directory',
        './src'
      );
      console.log('');
      console.log(chalk.cyan('Analyzing...'));
      console.log('');

      try {
        const targetPath = path.resolve(target);
        if (fs.existsSync(targetPath)) {
          const isDirectory = fs.statSync(targetPath).isDirectory();
          const analyzer = new ProjectAnalyzer();
          const result = await analyzer.analyzeProject({
            rootPath: isDirectory ? targetPath : path.dirname(targetPath),
            include: isDirectory ? undefined : [path.basename(targetPath)],
            showProgress: false,
          });

          console.log('');
          console.log(chalk.green('✅ Analysis complete!'));
          console.log('');
          console.log(`  Files analyzed: ${result.summary.analyzedFiles}`);
          console.log(`  Functions found: ${result.summary.totalFunctions}`);
          console.log(
            `  Issues found: ${result.summary.disharmoniousFunctions}`
          );
          console.log('');
        } else {
          console.log(chalk.yellow("Path doesn't exist - that's okay!"));
          console.log('');
        }
      } catch (_error) {
        console.log(chalk.yellow('Analysis skipped - moving on!'));
        console.log('');
      }
    } else {
      console.log(
        chalk.gray("No problem! We'll show you with examples later.")
      );
      console.log('');
    }

    await prompter.waitForEnter();

    // Step 3: Understanding Results
    console.log('');
    console.log(chalk.cyan.bold('STEP 3: Understanding Results'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Code Harmonizer shows:');
    console.log('');
    console.log(
      `  ${chalk.red('❌ HIGH')} - Severely misleading name (fix immediately)`
    );
    console.log(
      `  ${chalk.yellow('⚠️  MEDIUM')} - Somewhat misleading (fix when possible)`
    );
    console.log(
      `  ${chalk.blue('ℹ️  LOW')} - Minor improvements (optional)`
    );
    console.log('');
    console.log('Each issue shows:');
    console.log(chalk.gray('  • The disharmony score (0.0 - 1.0)'));
    console.log(chalk.gray('  • Why the name is misleading'));
    console.log(chalk.gray('  • Suggested better names'));
    console.log('');

    await prompter.waitForEnter();

    // Step 4: Interactive Features
    console.log('');
    console.log(chalk.cyan.bold('STEP 4: Interactive Features'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Code Harmonizer has helpful interactive commands:');
    console.log('');
    console.log(chalk.bold('a) harmonizer status'));
    console.log(chalk.gray('   Quick health dashboard of your project'));
    console.log('');
    console.log(chalk.bold('b) harmonizer fix ./src'));
    console.log(chalk.gray('   Step-by-step guided refactoring'));
    console.log('');
    console.log(chalk.bold('c) harmonizer explain file:42'));
    console.log(chalk.gray('   Deep explanation of why an issue is flagged'));
    console.log('');
    console.log(chalk.bold('d) harmonizer examples'));
    console.log(chalk.gray('   Browse usage examples'));
    console.log('');

    await prompter.waitForEnter();

    // Step 5: Development Workflow
    console.log('');
    console.log(chalk.cyan.bold('STEP 5: Development Workflow'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Integrate into your workflow:');
    console.log('');
    console.log(chalk.bold('Watch Mode:'));
    console.log(`  ${chalk.white('harmonizer watch ./src')}`);
    console.log(chalk.gray('  Continuously monitors files for changes'));
    console.log('');
    console.log(chalk.bold('Git Hooks:'));
    console.log(`  ${chalk.white('harmonizer install-hooks --pre-commit')}`);
    console.log(chalk.gray('  Blocks commits with HIGH severity issues'));
    console.log('');
    console.log(chalk.bold('Analyze Git Changes:'));
    console.log(`  ${chalk.white('harmonizer --git-diff main')}`);
    console.log(chalk.gray('  Only analyze files changed vs main branch'));
    console.log('');

    await prompter.waitForEnter();

    // Step 6: CI/CD Integration
    console.log('');
    console.log(chalk.cyan.bold('STEP 6: CI/CD Integration'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Prevent quality regressions:');
    console.log('');
    console.log(chalk.bold('1. Save a baseline:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --save-baseline baseline.json')}`);
    console.log('');
    console.log(chalk.bold('2. In CI, compare against it:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --baseline baseline.json --fail-on-high --exit-code')}`);
    console.log('');
    console.log(chalk.gray('This fails the build if quality degrades!'));
    console.log('');
    console.log(chalk.bold('3. GitHub Code Scanning:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --format sarif -o harmonizer.sarif')}`);
    console.log('');
    console.log(chalk.gray('Upload the .sarif file to see issues in GitHub PRs!'));
    console.log('');

    await prompter.waitForEnter();

    // Step 7: Reports
    console.log('');
    console.log(chalk.cyan.bold('STEP 7: Beautiful Reports'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('Generate shareable reports:');
    console.log('');
    console.log(chalk.bold('HTML Report (with charts):'));
    console.log(`  ${chalk.white('harmonizer ./src -r --format html -o report.html')}`);
    console.log('');
    console.log(chalk.bold('Markdown Report:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --format markdown -o report.md')}`);
    console.log('');
    console.log(chalk.bold('JSON (for tools):'));
    console.log(`  ${chalk.white('harmonizer ./src -r --format json -o results.json')}`);
    console.log('');

    await prompter.waitForEnter();

    // Step 8: Performance Tips
    console.log('');
    console.log(chalk.cyan.bold('STEP 8: Performance Tips'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
    console.log('For large codebases:');
    console.log('');
    console.log(chalk.bold('Enable Caching (3.7x faster!):'));
    console.log(`  ${chalk.white('harmonizer ./src -r --cache')}`);
    console.log('');
    console.log(chalk.bold('Incremental Analysis:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --cache --incremental')}`);
    console.log(chalk.gray('  Only re-analyzes changed files'));
    console.log('');
    console.log(chalk.bold('Increase Parallelism:'));
    console.log(`  ${chalk.white('harmonizer ./src -r --parallel 8')}`);
    console.log(chalk.gray('  Uses 8 worker threads (default: 4)'));
    console.log('');

    await prompter.waitForEnter();

    // Completion
    console.log('');
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('                🎉 Tutorial Complete!'));
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log('');
    console.log(chalk.green('You now know everything to get started!'));
    console.log('');
    console.log(chalk.bold('Quick Reference:'));
    console.log('');
    console.log(`  ${chalk.cyan('harmonizer --help')}           Full command reference`);
    console.log(`  ${chalk.cyan('harmonizer examples')}         Browse examples`);
    console.log(`  ${chalk.cyan('harmonizer status')}           Check project health`);
    console.log(`  ${chalk.cyan('harmonizer fix ./src')}        Fix issues interactively`);
    console.log('');
    console.log(chalk.bold('Next Steps:'));
    console.log('');
    console.log(
      `  1. Run ${chalk.white('harmonizer init')} to set up your project`
    );
    console.log(`  2. Try ${chalk.white('harmonizer status')} to see your code health`);
    console.log(
      `  3. Use ${chalk.white('harmonizer fix')} to improve your code`
    );
    console.log('');
    console.log('Happy harmonizing! 🎵');
    console.log('');
  } finally {
    prompter.close();
  }
}
