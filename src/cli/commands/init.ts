/**
 * Interactive initialization command
 * Guides users through first-time setup
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { createPrompter } from '../prompter';
import { ConfigLoader } from '../../config/config-loader';
import { ProjectAnalyzer } from '../../project/project-analyzer';
import { CliFormatter } from '../../output/cli-formatter';

export async function initCommand(targetDir: string = '.'): Promise<void> {
  const prompter = createPrompter();
  const formatter = new CliFormatter({ useColors: true, verbose: true });

  try {
    // Header
    console.log('');
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('       ✨ Welcome to Code Harmonizer! ✨'));
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log('');
    console.log(chalk.gray('I\'ll help you set up semantic bug detection for your project.'));
    console.log('');

    // Detect project
    const resolvedDir = path.resolve(targetDir);
    const hasPackageJson = fs.existsSync(path.join(resolvedDir, 'package.json'));
    const hasTsConfig = fs.existsSync(path.join(resolvedDir, 'tsconfig.json'));

    console.log(chalk.cyan('📁 Project Detection'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────'));

    if (hasPackageJson) {
      formatter.printSuccess('Detected: JavaScript/TypeScript project');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(resolvedDir, 'package.json'), 'utf-8')
      );
      console.log(chalk.gray(`   Project: ${packageJson.name || 'unknown'}`));
    }

    if (hasTsConfig) {
      formatter.printSuccess('Detected: TypeScript configuration');
    }

    // Count files
    console.log('');
    formatter.startSpinner('Scanning for JavaScript/TypeScript files...');

    const filesFound = await countFiles(resolvedDir);
    formatter.succeedSpinner(`Found ${filesFound} files to analyze`);

    console.log('');

    // Step 1: Create config
    console.log(chalk.cyan.bold('Step 1: Configuration'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────'));

    const hasExistingConfig = fs.existsSync(path.join(resolvedDir, '.harmonizerrc.json'));

    if (hasExistingConfig) {
      console.log(chalk.yellow('⚠️  .harmonizerrc.json already exists'));
      const overwrite = await prompter.confirm('   Overwrite with defaults?', false);

      if (overwrite) {
        ConfigLoader.createDefaultConfig(resolvedDir);
        formatter.printSuccess('Created new configuration');
      } else {
        formatter.printInfo('Keeping existing configuration');
      }
    } else {
      const createConfig = await prompter.confirm('   Create .harmonizerrc.json?', true);

      if (createConfig) {
        ConfigLoader.createDefaultConfig(resolvedDir);
        formatter.printSuccess('Created configuration file');
        console.log(chalk.gray('   Location: .harmonizerrc.json'));
      }
    }

    console.log('');

    // Step 2: Create ignore file
    console.log(chalk.cyan.bold('Step 2: Ignore Patterns'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────'));

    const hasExistingIgnore = fs.existsSync(path.join(resolvedDir, '.harmonizerignore'));

    if (hasExistingIgnore) {
      console.log(chalk.yellow('⚠️  .harmonizerignore already exists'));
      const overwrite = await prompter.confirm('   Overwrite with defaults?', false);

      if (overwrite) {
        ConfigLoader.createDefaultIgnore(resolvedDir);
        formatter.printSuccess('Created new ignore file');
      } else {
        formatter.printInfo('Keeping existing ignore file');
      }
    } else {
      const createIgnore = await prompter.confirm('   Create .harmonizerignore?', true);

      if (createIgnore) {
        ConfigLoader.createDefaultIgnore(resolvedDir);
        formatter.printSuccess('Created ignore file');
        console.log(chalk.gray('   Excludes: node_modules, dist, coverage'));
      }
    }

    console.log('');

    // Step 3: Run first analysis
    console.log(chalk.cyan.bold('Step 3: First Analysis'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────'));

    const runAnalysis = await prompter.confirm('   Run analysis now?', true);

    if (runAnalysis) {
      console.log('');
      formatter.startSpinner('Analyzing your code...');

      const analyzer = new ProjectAnalyzer();
      const result = await analyzer.analyzeProject({
        rootPath: resolvedDir,
        include: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
        showProgress: false,
      });

      formatter.succeedSpinner('Analysis complete!');
      console.log('');

      // Show results
      console.log(chalk.cyan.bold('📊 Results'));
      console.log(chalk.gray('──────────────────────────────────────────────────────────'));
      console.log(
        `   ${chalk.green('✓')} Files analyzed: ${chalk.bold(result.summary.analyzedFiles.toString())}`
      );
      console.log(
        `   ${chalk.green('✓')} Functions found: ${chalk.bold(result.summary.totalFunctions.toString())}`
      );

      if (result.summary.disharmoniousFunctions > 0) {
        const rate = (
          (result.summary.disharmoniousFunctions / result.summary.totalFunctions) *
          100
        ).toFixed(1);
        console.log(
          `   ${chalk.yellow('⚠')}  Issues found: ${chalk.bold.yellow(result.summary.disharmoniousFunctions.toString())} (${rate}% disharmony rate)`
        );

        // Count by severity
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        for (const file of result.files) {
          if (file.status === 'success') {
            for (const func of file.functions) {
              if (func.severity === 'HIGH') highCount++;
              else if (func.severity === 'MEDIUM') mediumCount++;
              else if (func.severity === 'LOW') lowCount++;
            }
          }
        }

        if (highCount > 0) {
          console.log(`   ${chalk.red('●')} HIGH severity: ${chalk.bold.red(highCount.toString())}`);
        }
        if (mediumCount > 0) {
          console.log(
            `   ${chalk.yellow('●')} MEDIUM severity: ${chalk.bold.yellow(mediumCount.toString())}`
          );
        }
        if (lowCount > 0) {
          console.log(`   ${chalk.blue('●')} LOW severity: ${chalk.bold.blue(lowCount.toString())}`);
        }
      } else {
        console.log(`   ${chalk.green('✨')} No issues found! All code is harmonious.`);
      }

      console.log('');

      // Offer to view details
      if (result.summary.disharmoniousFunctions > 0) {
        const viewDetails = await prompter.confirm('   View detailed results?', true);

        if (viewDetails) {
          console.log('');
          console.log(formatter.formatProjectResult(result));
        }
      }
    }

    console.log('');

    // Next steps
    console.log(chalk.cyan.bold('🎉 Setup Complete!'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────'));
    console.log('');
    console.log(chalk.bold('Next steps:'));
    console.log('');
    console.log(
      chalk.cyan('   harmonizer ./src -r') + chalk.gray('         Analyze recursively')
    );
    console.log(chalk.cyan('   harmonizer watch') + chalk.gray('              Watch for changes'));
    console.log(
      chalk.cyan('   harmonizer fix --interactive') + chalk.gray('  Auto-fix issues')
    );
    console.log(
      chalk.cyan('   harmonizer --help') + chalk.gray('              See all options')
    );
    console.log('');
    console.log(chalk.bold('Learn more:'));
    console.log('');
    console.log(
      chalk.cyan('   harmonizer tutorial') + chalk.gray('          5-minute guided tour')
    );
    console.log(
      chalk.cyan('   harmonizer examples') + chalk.gray('          See usage examples')
    );
    console.log('');
    console.log(chalk.gray('💡 Tip: Install VS Code extension for real-time feedback'));
    console.log(
      chalk.gray('   → https://marketplace.visualstudio.com/items?itemName=code-harmonizer')
    );
    console.log('');
  } finally {
    prompter.close();
  }
}

/**
 * Count JavaScript/TypeScript files in directory
 */
async function countFiles(dir: string): Promise<number> {
  const { glob } = await import('glob');

  const files = await glob('**/*.{js,ts,jsx,tsx}', {
    cwd: dir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
    nodir: true,
  });

  return files.length;
}
