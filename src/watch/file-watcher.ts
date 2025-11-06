/**
 * File Watcher
 * Continuous analysis mode that watches for file changes
 */

import chokidar, { FSWatcher } from 'chokidar';
import * as path from 'path';
import { ProjectAnalyzer } from '../project/project-analyzer';
import chalk from 'chalk';

export interface WatchOptions {
  /**
   * Directory to watch
   */
  rootPath: string;

  /**
   * Glob patterns to watch
   */
  include?: string[];

  /**
   * Patterns to ignore
   */
  ignore?: string[];

  /**
   * Debounce delay in milliseconds
   */
  debounce?: number;

  /**
   * Show verbose output
   */
  verbose?: boolean;

  /**
   * Callback when analysis completes
   */
  onAnalysis?: (filePath: string, result: any) => void;

  /**
   * Callback when error occurs
   */
  onError?: (filePath: string, error: Error) => void;
}

/**
 * File Watcher for continuous analysis
 */
export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private analyzer: ProjectAnalyzer;
  private options: Required<WatchOptions>;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private analyzing: Set<string> = new Set();

  constructor(options: WatchOptions) {
    this.analyzer = new ProjectAnalyzer();
    this.options = {
      rootPath: options.rootPath,
      include: options.include || ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
      ignore: options.ignore || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
      ],
      debounce: options.debounce || 500,
      verbose: options.verbose ?? true,
      onAnalysis: options.onAnalysis || (() => {}),
      onError: options.onError || (() => {}),
    };
  }

  /**
   * Start watching files
   */
  async start(): Promise<void> {
    if (this.watcher) {
      throw new Error('Watcher is already running');
    }

    this.log(chalk.cyan('🔍 Starting Code Harmonizer in watch mode...'));
    this.log(chalk.gray(`   Watching: ${this.options.rootPath}`));
    this.log(chalk.gray(`   Patterns: ${this.options.include.join(', ')}`));
    this.log('');

    this.watcher = chokidar.watch(this.options.include, {
      cwd: this.options.rootPath,
      ignored: this.options.ignore,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange(filePath, 'added'))
      .on('change', (filePath) => this.handleFileChange(filePath, 'changed'))
      .on('unlink', (filePath) => this.handleFileDelete(filePath))
      .on('error', (error) => this.handleWatchError(error))
      .on('ready', () => {
        this.log(chalk.green('✅ Watching for changes. Press Ctrl+C to stop.'));
        this.log('');
      });

    // Keep process alive
    return new Promise((resolve) => {
      // This promise never resolves - watch mode runs until interrupted
      process.on('SIGINT', () => {
        this.stop();
        resolve();
        process.exit(0);
      });
    });
  }

  /**
   * Stop watching files
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    this.log('');
    this.log(chalk.yellow('🛑 Stopping watch mode...'));

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    await this.watcher.close();
    this.watcher = null;

    this.log(chalk.green('✅ Watch mode stopped'));
  }

  /**
   * Handle file change
   */
  private handleFileChange(relativePath: string, changeType: 'added' | 'changed'): void {
    const filePath = path.resolve(this.options.rootPath, relativePath);

    // Clear existing debounce timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.analyzeFile(filePath, changeType);
    }, this.options.debounce);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Handle file deletion
   */
  private handleFileDelete(relativePath: string): void {
    const filePath = path.resolve(this.options.rootPath, relativePath);
    this.log(chalk.gray(`🗑️  ${relativePath} deleted`));

    // Clear any pending analysis for this file
    const timer = this.debounceTimers.get(filePath);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(filePath);
    }
  }

  /**
   * Handle watch error
   */
  private handleWatchError(error: Error): void {
    this.log(chalk.red(`❌ Watch error: ${error.message}`));
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string, changeType: 'added' | 'changed'): Promise<void> {
    // Prevent concurrent analysis of the same file
    if (this.analyzing.has(filePath)) {
      return;
    }

    this.analyzing.add(filePath);

    const relativePath = path.relative(this.options.rootPath, filePath);
    const icon = changeType === 'added' ? '📄' : '✏️';

    try {
      this.log(chalk.cyan(`${icon} ${relativePath} ${changeType}... analyzing`));

      const startTime = Date.now();

      const result = await this.analyzer.analyzeProject({
        rootPath: this.options.rootPath,
        include: [relativePath],
        showProgress: false,
      });

      const analysisTime = Date.now() - startTime;

      if (result.files.length > 0 && result.files[0].status === 'success') {
        const fileResult = result.files[0];
        this.displayAnalysisResult(fileResult, analysisTime);

        // Call callback
        this.options.onAnalysis(filePath, fileResult);
      } else if (result.files[0]?.status === 'error') {
        throw new Error(result.files[0].error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(chalk.red(`   ❌ Error: ${errorMessage}`));

      this.options.onError(filePath, error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.analyzing.delete(filePath);
    }
  }

  /**
   * Display analysis result
   */
  private displayAnalysisResult(fileResult: any, analysisTime: number): void {
    const { metrics } = fileResult;

    if (metrics.disharmoniousFunctions === 0) {
      this.log(
        chalk.green(
          `   ✅ All clear! ${metrics.totalFunctions} functions in harmony (${analysisTime}ms)`
        )
      );
    } else {
      const issueColor = metrics.maxDisharmony > 0.8 ? chalk.red : chalk.yellow;
      this.log(
        issueColor(
          `   ⚠️  ${metrics.disharmoniousFunctions}/${metrics.totalFunctions} functions need attention`
        )
      );
      this.log(
        chalk.gray(`   Avg disharmony: ${metrics.averageDisharmony.toFixed(3)} (${analysisTime}ms)`)
      );

      if (this.options.verbose) {
        // Show top 3 worst functions
        const worst = fileResult.functions
          .filter((f: any) => f.disharmony > 0.5)
          .sort((a: any, b: any) => b.disharmony - a.disharmony)
          .slice(0, 3);

        for (const func of worst) {
          const severityColor =
            func.severity === 'HIGH'
              ? chalk.red
              : func.severity === 'MEDIUM'
                ? chalk.yellow
                : chalk.blue;

          this.log(
            `      ${severityColor(`• ${func.name}()`)} - ${func.disharmony.toFixed(3)} [${func.severity}]`
          );
        }
      }
    }

    this.log('');
  }

  /**
   * Log message if not in quiet mode
   */
  private log(message: string): void {
    if (this.options.verbose) {
      console.log(message);
    }
  }

  /**
   * Get watcher statistics
   */
  getStats(): {
    isRunning: boolean;
    filesBeingAnalyzed: number;
    pendingDebounces: number;
  } {
    return {
      isRunning: this.watcher !== null,
      filesBeingAnalyzed: this.analyzing.size,
      pendingDebounces: this.debounceTimers.size,
    };
  }
}
