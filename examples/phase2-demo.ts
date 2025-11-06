/**
 * Phase 2 Demo - Developer Experience Features
 * Demonstrates HTML reports, Git integration, Watch mode, and enhanced CLI
 */

import * as path from 'path';
import { ProjectAnalyzer } from '../src/project/project-analyzer';
import { HtmlReporter } from '../src/output/html-reporter';
import { GitIntegration } from '../src/git/git-integration';
import { CliFormatter } from '../src/output/cli-formatter';

async function demo() {
  const formatter = new CliFormatter({ useColors: true, verbose: true });

  formatter.printHeader();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Phase 2: Developer Experience Features');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const testFilesDir = path.join(__dirname, 'test-files');

  // ===================================================================
  // 1. Enhanced CLI with Colors
  // ===================================================================
  formatter.printInfo('1. ENHANCED CLI WITH COLORS & PROGRESS');
  formatter.printLine();
  console.log('');

  formatter.startSpinner('Analyzing project...');

  const analyzer = new ProjectAnalyzer();
  const result = await analyzer.analyzeProject({
    rootPath: testFilesDir,
    include: ['**/*.js'],
    showProgress: false,
  });

  formatter.succeedSpinner('Analysis complete!');
  console.log('');

  const formattedOutput = formatter.formatProjectResult(result);
  console.log(formattedOutput);

  // ===================================================================
  // 2. HTML Report Generation
  // ===================================================================
  formatter.printInfo('2. HTML REPORT GENERATION');
  formatter.printLine();
  console.log('');

  const htmlPath = path.join(process.cwd(), 'harmonizer-report.html');
  HtmlReporter.save(result, htmlPath, {
    title: 'Phase 2 Demo Report',
    includeCharts: true,
    includeFileDetails: true,
    theme: 'light',
  });

  formatter.printSuccess(`HTML report generated: ${htmlPath}`);
  console.log('');

  // ===================================================================
  // 3. Git Integration
  // ===================================================================
  formatter.printInfo('3. GIT INTEGRATION');
  formatter.printLine();
  console.log('');

  const git = new GitIntegration(process.cwd());

  const isGit = await git.isGitRepo();
  console.log(`   Git repository: ${isGit ? '✅ Yes' : '❌ No'}`);

  if (isGit) {
    const currentBranch = await git.getCurrentBranch();
    console.log(`   Current branch: ${currentBranch}`);

    const stats = await git.getStats();
    console.log(`   Total commits: ${stats.totalCommits}`);
    console.log(`   Unpushed commits: ${stats.hasUnpushedCommits ? 'Yes' : 'No'}`);
    console.log(`   Uncommitted changes: ${stats.hasUncommittedChanges ? 'Yes' : 'No'}`);

    // Get changed files (if any)
    const changedFiles = await git.getChangedFiles();
    if (changedFiles.length > 0) {
      console.log(`   Changed files: ${changedFiles.length}`);
      for (const file of changedFiles.slice(0, 3)) {
        console.log(`      • ${path.relative(process.cwd(), file.path)} (${file.status})`);
      }
    }
  }

  console.log('');

  // ===================================================================
  // 4. Git Hooks Installation
  // ===================================================================
  formatter.printInfo('4. GIT HOOKS');
  formatter.printLine();
  console.log('');

  console.log('   Available hooks:');
  console.log('      • pre-commit  - Run before commits');
  console.log('      • pre-push    - Run before pushing');
  console.log('');
  console.log('   To install: harmonizer install-hooks --pre-commit --pre-push');
  console.log('');

  // ===================================================================
  // 5. Watch Mode (demonstrate API, not actually start watching)
  // ===================================================================
  formatter.printInfo('5. WATCH MODE');
  formatter.printLine();
  console.log('');

  console.log('   Watch mode provides continuous analysis:');
  console.log('      • Monitors file changes in real-time');
  console.log('      • Debounced analysis (500ms default)');
  console.log('      • Instant feedback on save');
  console.log('      • Colored terminal output');
  console.log('');
  console.log('   To start: harmonizer watch ./src');
  console.log('');

  // ===================================================================
  // Summary
  // ===================================================================
  formatter.printLine();
  formatter.printSuccess('Phase 2 features demonstrated successfully!');
  console.log('');

  console.log('✅ Features available:');
  console.log('   • Enhanced CLI with colors, spinners, and progress bars');
  console.log('   • Beautiful HTML reports with interactive charts');
  console.log('   • Git integration (analyze diffs, blame, hooks)');
  console.log('   • Watch mode for continuous analysis');
  console.log('   • Improved developer experience throughout');
  console.log('');

  console.log('📝 Try these commands:');
  console.log('   harmonizer ./src --recursive              # Enhanced colored output');
  console.log('   harmonizer ./src -r --format html -o report.html  # HTML report');
  console.log('   harmonizer --git-diff origin/main         # Analyze git changes');
  console.log('   harmonizer watch ./src                    # Continuous analysis');
  console.log('   harmonizer install-hooks --pre-commit     # Install git hooks');
  console.log('');
}

// Run demo
demo().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
