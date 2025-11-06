#!/usr/bin/env node
/**
 * Main CLI entry point with all interactive commands
 * This is the user-facing CLI with enhanced UX
 */

import * as path from 'path';
import {
  initCommand,
  fixCommand,
  explainCommand,
  examplesCommand,
  statusCommand,
  helpCommand,
  tutorialCommand,
} from './commands';

/**
 * Parse and route CLI commands
 */
async function main() {
  const args = process.argv.slice(2);

  // No arguments - show quick help
  if (args.length === 0) {
    helpCommand();
    process.exit(0);
  }

  const command = args[0];

  // Route to appropriate command handler
  try {
    switch (command) {
      case '--help':
      case '-h':
      case 'help':
        if (args[1]) {
          helpCommand({ command: args[1] });
        } else {
          helpCommand();
        }
        break;

      case '--version':
      case '-v':
      case 'version':
        console.log('JavaScript Code Harmonizer v0.2.0');
        break;

      case 'init':
        await initCommand(args[1] || '.');
        break;

      case 'fix':
        {
          const target = args[1] || '.';
          const options: any = {};

          for (let i = 2; i < args.length; i++) {
            switch (args[i]) {
              case '--threshold':
                options.threshold = parseFloat(args[++i]);
                break;
              case '--severity':
                options.severity = args[++i];
                break;
              case '--dry-run':
                options.dryRun = true;
                break;
              case '--auto-apply':
                options.autoApply = true;
                break;
            }
          }

          await fixCommand(target, options);
        }
        break;

      case 'explain':
        {
          const target = args[1];
          if (!target) {
            console.error('❌ Error: Please specify a target (file:line)');
            console.log('');
            console.log('Usage: harmonizer explain <file:line>');
            console.log('Example: harmonizer explain src/user.js:42');
            process.exit(1);
          }

          const options: any = {};
          if (args.includes('--verbose')) {
            options.verbose = true;
          }

          await explainCommand(target, options);
        }
        break;

      case 'examples':
        await examplesCommand(args[1]);
        break;

      case 'status':
        {
          const target = args[1] || '.';
          const options: any = {};

          if (args.includes('--verbose')) {
            options.verbose = true;
          }
          if (args.includes('--config')) {
            const configIndex = args.indexOf('--config');
            options.config = args[configIndex + 1];
          }

          await statusCommand(target, options);
        }
        break;

      case 'tutorial':
        await tutorialCommand();
        break;

      case 'watch':
        {
          // Import dynamically to avoid loading watch dependencies unless needed
          const { FileWatcher } = await import('../watch/file-watcher');
          const target = args[1] || '.';
          const targetPath = path.resolve(target);

          const watcher = new FileWatcher({
            rootPath: targetPath,
            include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
            verbose: true,
          });

          console.log('');
          console.log('👀 Watching for changes...');
          console.log(`   Path: ${targetPath}`);
          console.log('   Press Ctrl+C to stop');
          console.log('');

          await watcher.start();
        }
        break;

      case 'install-hooks':
        {
          const { GitIntegration } = await import('../git/git-integration');
          const git = new GitIntegration(process.cwd());

          const options: any = {};
          if (args.includes('--pre-commit')) {
            options.preCommit = true;
          }
          if (args.includes('--pre-push')) {
            options.prePush = true;
          }

          // Default to pre-commit if nothing specified
          if (!options.preCommit && !options.prePush) {
            options.preCommit = true;
          }

          await git.installHooks(options);
          console.log('');
          console.log('✅ Git hooks installed successfully!');
          console.log('');
        }
        break;

      default:
        // If starts with -, it might be a flag for analysis
        // If it's a file/directory path, run analysis
        // Otherwise, delegate to harmonizer-v2 (full-featured CLI)
        if (command.startsWith('-') || command.includes('/') || command.includes('.')) {
          // Delegate to full CLI
          const { main: v2Main } = await import('./harmonizer-v2');
          await v2Main();
        } else {
          console.error(`❌ Unknown command: ${command}`);
          console.log('');
          console.log('Run "harmonizer --help" for usage information');
          console.log('');
          process.exit(1);
        }
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(2);
  });
}

export { main };
