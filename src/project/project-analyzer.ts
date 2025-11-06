/**
 * Project-level analysis for multiple files
 * Handles recursive directory traversal, parallel processing, and aggregation
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ASTSemanticParser } from '../parser/ast-parser';
import { SemanticEngine, VocabularyManager } from '../core/engine';
import { SemanticNamingEngine } from '../naming/semantic-naming';
import { CacheManager } from '../cache/cache-manager';

export interface ProjectConfig {
  /**
   * Root directory to analyze
   */
  rootPath: string;

  /**
   * Glob patterns to include (default: all .js, .ts, .jsx, .tsx files)
   */
  include?: string[];

  /**
   * Glob patterns to exclude
   */
  exclude?: string[];

  /**
   * Maximum number of parallel workers
   */
  parallelism?: number;

  /**
   * Whether to use caching
   */
  cache?: boolean;

  /**
   * Cache directory
   */
  cacheDir?: string;

  /**
   * Only analyze files changed since last run
   */
  incremental?: boolean;

  /**
   * Maximum memory usage in bytes (default: unlimited)
   */
  maxMemory?: number;

  /**
   * Show progress indicators
   */
  showProgress?: boolean;

  /**
   * Timeout per file in milliseconds
   */
  fileTimeout?: number;

  /**
   * Continue on errors vs fail fast
   */
  continueOnError?: boolean;
}

export interface FileAnalysisResult {
  filePath: string;
  relativePath: string;
  status: 'success' | 'error' | 'skipped' | 'timeout';
  error?: string;
  analysisTime: number;
  functions: Array<{
    name: string;
    line: number;
    disharmony: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestions?: Array<{ name: string; similarity: number }>;
  }>;
  metrics: {
    totalFunctions: number;
    disharmoniousFunctions: number;
    averageDisharmony: number;
    maxDisharmony: number;
  };
}

export interface ProjectAnalysisResult {
  projectPath: string;
  timestamp: string;
  config: ProjectConfig;
  files: FileAnalysisResult[];
  summary: {
    totalFiles: number;
    analyzedFiles: number;
    errorFiles: number;
    skippedFiles: number;
    totalFunctions: number;
    disharmoniousFunctions: number;
    averageDisharmony: number;
    maxDisharmony: number;
    analysisTime: number;
  };
  errors: Array<{
    file: string;
    error: string;
  }>;
}

/**
 * Main project analyzer
 */
export class ProjectAnalyzer {
  private parser: ASTSemanticParser;
  private engine: SemanticEngine;
  private namingEngine: SemanticNamingEngine;
  private vocabulary: VocabularyManager;
  private cacheManager: CacheManager | null = null;

  constructor() {
    this.vocabulary = new VocabularyManager();
    this.parser = new ASTSemanticParser(this.vocabulary);
    this.engine = new SemanticEngine(this.vocabulary);
    this.namingEngine = new SemanticNamingEngine();
  }

  /**
   * Analyze an entire project
   */
  async analyzeProject(config: ProjectConfig): Promise<ProjectAnalysisResult> {
    const startTime = Date.now();

    // Normalize configuration
    const normalizedConfig = this.normalizeConfig(config);

    // Initialize cache manager if caching is enabled
    if (normalizedConfig.cache) {
      this.cacheManager = new CacheManager(normalizedConfig.cacheDir);
      if (normalizedConfig.showProgress) {
        const stats = this.cacheManager.getStats();
        console.log(`📦 Cache loaded: ${stats.totalEntries} entries`);
      }
    }

    // Find all files to analyze
    const files = await this.findFiles(normalizedConfig);

    if (normalizedConfig.showProgress) {
      console.log(`Found ${files.length} files to analyze`);
    }

    // Determine which files need analysis (if using cache)
    let filesToAnalyze = files;
    let cachedResults: FileAnalysisResult[] = [];

    if (this.cacheManager && normalizedConfig.incremental) {
      const { cached, toAnalyze } = this.cacheManager.getFilesToAnalyze(files);
      filesToAnalyze = toAnalyze;

      // Load cached results
      for (const file of cached) {
        const result = this.cacheManager.get(file);
        if (result) {
          cachedResults.push(result);
        }
      }

      if (normalizedConfig.showProgress) {
        console.log(`📦 Using ${cached.length} cached results, analyzing ${toAnalyze.length} files`);
      }
    }

    // Analyze files (with parallelism)
    const newResults = await this.analyzeFiles(filesToAnalyze, normalizedConfig);

    // Combine cached and new results
    const results = [...cachedResults, ...newResults];

    // Save cache if enabled
    if (this.cacheManager) {
      this.cacheManager.saveCache();
      if (normalizedConfig.showProgress) {
        const stats = this.cacheManager.getStats();
        console.log(`💾 Cache saved: ${stats.totalEntries} entries`);
      }
    }

    // Calculate summary statistics
    const summary = this.calculateSummary(results, Date.now() - startTime);

    // Collect errors
    const errors = results
      .filter((r) => r.status === 'error')
      .map((r) => ({
        file: r.relativePath,
        error: r.error || 'Unknown error',
      }));

    return {
      projectPath: normalizedConfig.rootPath,
      timestamp: new Date().toISOString(),
      config: normalizedConfig,
      files: results,
      summary,
      errors,
    };
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: ProjectConfig): Required<ProjectConfig> {
    return {
      rootPath: path.resolve(config.rootPath),
      include: config.include || ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
      exclude: config.exclude || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.min.js',
        '**/*.bundle.js',
      ],
      parallelism: config.parallelism || 4,
      cache: config.cache ?? false,
      cacheDir: config.cacheDir || path.join(config.rootPath, '.harmonizer-cache'),
      incremental: config.incremental ?? false,
      maxMemory: config.maxMemory || 0,
      showProgress: config.showProgress ?? true,
      fileTimeout: config.fileTimeout || 30000, // 30 seconds per file
      continueOnError: config.continueOnError ?? true,
    };
  }

  /**
   * Find all files matching the configuration
   */
  private async findFiles(config: Required<ProjectConfig>): Promise<string[]> {
    const allFiles: Set<string> = new Set();

    // Process include patterns
    for (const pattern of config.include) {
      const matches = await glob(pattern, {
        cwd: config.rootPath,
        absolute: true,
        ignore: config.exclude,
        nodir: true,
      });
      matches.forEach((f) => allFiles.add(f));
    }

    return Array.from(allFiles).sort();
  }

  /**
   * Analyze multiple files with parallel processing
   */
  private async analyzeFiles(
    files: string[],
    config: Required<ProjectConfig>
  ): Promise<FileAnalysisResult[]> {
    const results: FileAnalysisResult[] = [];
    const batchSize = config.parallelism;

    // Process in batches for parallelism
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      if (config.showProgress) {
        console.log(`Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} (${i + 1}-${Math.min(i + batchSize, files.length)}/${files.length})`);
      }

      // Analyze batch in parallel
      const batchResults = await Promise.all(
        batch.map((file) => this.analyzeFile(file, config))
      );

      results.push(...batchResults);

      // Check memory usage if limit is set
      if (config.maxMemory > 0) {
        const usage = process.memoryUsage();
        if (usage.heapUsed > config.maxMemory) {
          console.warn(
            `⚠️  Memory limit exceeded (${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(config.maxMemory / 1024 / 1024)}MB)`
          );
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
        }
      }
    }

    return results;
  }

  /**
   * Analyze a single file with timeout and error handling
   */
  private async analyzeFile(
    filePath: string,
    config: Required<ProjectConfig>
  ): Promise<FileAnalysisResult> {
    const startTime = Date.now();
    const relativePath = path.relative(config.rootPath, filePath);

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), config.fileTimeout);
      });

      // Analyze file with timeout
      const analysisPromise = this.performFileAnalysis(filePath, relativePath);

      const result = await Promise.race([analysisPromise, timeoutPromise]);

      const finalResult = {
        ...result,
        analysisTime: Date.now() - startTime,
      };

      // Store in cache if successful
      if (this.cacheManager && finalResult.status === 'success') {
        this.cacheManager.set(filePath, finalResult);
      }

      return finalResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage === 'Timeout') {
        return {
          filePath,
          relativePath,
          status: 'timeout',
          error: `Analysis timed out after ${config.fileTimeout}ms`,
          analysisTime: config.fileTimeout,
          functions: [],
          metrics: {
            totalFunctions: 0,
            disharmoniousFunctions: 0,
            averageDisharmony: 0,
            maxDisharmony: 0,
          },
        };
      }

      return {
        filePath,
        relativePath,
        status: 'error',
        error: errorMessage,
        analysisTime: Date.now() - startTime,
        functions: [],
        metrics: {
          totalFunctions: 0,
          disharmoniousFunctions: 0,
          averageDisharmony: 0,
          maxDisharmony: 0,
        },
      };
    }
  }

  /**
   * Perform the actual file analysis
   */
  private async performFileAnalysis(
    filePath: string,
    relativePath: string
  ): Promise<Omit<FileAnalysisResult, 'analysisTime'>> {
    // Read file
    const code = fs.readFileSync(filePath, 'utf-8');

    // Check if file is likely minified (heuristic: very long lines)
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;
    if (avgLineLength > 500) {
      return {
        filePath,
        relativePath,
        status: 'skipped',
        error: 'Skipped: appears to be minified or generated code',
        functions: [],
        metrics: {
          totalFunctions: 0,
          disharmoniousFunctions: 0,
          averageDisharmony: 0,
          maxDisharmony: 0,
        },
      };
    }

    // Extract functions
    const functions = this.parser.extractFunctions(code);

    if (functions.length === 0) {
      return {
        filePath,
        relativePath,
        status: 'success',
        functions: [],
        metrics: {
          totalFunctions: 0,
          disharmoniousFunctions: 0,
          averageDisharmony: 0,
          maxDisharmony: 0,
        },
      };
    }

    // Analyze each function
    const functionResults = [];
    let totalDisharmony = 0;
    let maxDisharmony = 0;
    let disharmoniousCount = 0;

    for (const { node, metadata } of functions) {
      const parseResult = this.parser.analyzeFunction(node, metadata);
      const iceAnalysis = this.engine.performICEAnalysis(
        parseResult.intent,
        ['javascript', 'function'],
        parseResult.execution
      );

      if (iceAnalysis.disharmony > 0.5) {
        disharmoniousCount++;
      }

      totalDisharmony += iceAnalysis.disharmony;
      maxDisharmony = Math.max(maxDisharmony, iceAnalysis.disharmony);

      // Get naming suggestions for disharmonious functions
      const suggestions =
        iceAnalysis.disharmony > 0.5
          ? this.namingEngine.suggestNames(iceAnalysis.execution, undefined, 3)
          : undefined;

      // Map severity to uppercase format expected by interface
      const severityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
        excellent: 'LOW',
        low: 'LOW',
        medium: 'MEDIUM',
        high: 'HIGH',
        critical: 'HIGH',
      };

      functionResults.push({
        name: metadata.name,
        line: metadata.location?.start.line || 1,
        disharmony: iceAnalysis.disharmony,
        severity: severityMap[iceAnalysis.severity] || 'LOW',
        suggestions,
      });
    }

    return {
      filePath,
      relativePath,
      status: 'success',
      functions: functionResults,
      metrics: {
        totalFunctions: functions.length,
        disharmoniousFunctions: disharmoniousCount,
        averageDisharmony: functions.length > 0 ? totalDisharmony / functions.length : 0,
        maxDisharmony,
      },
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    results: FileAnalysisResult[],
    analysisTime: number
  ): ProjectAnalysisResult['summary'] {
    const analyzed = results.filter((r) => r.status === 'success');
    const errors = results.filter((r) => r.status === 'error');
    const skipped = results.filter((r) => r.status === 'skipped' || r.status === 'timeout');

    const totalFunctions = analyzed.reduce((sum, r) => sum + r.metrics.totalFunctions, 0);
    const disharmoniousFunctions = analyzed.reduce(
      (sum, r) => sum + r.metrics.disharmoniousFunctions,
      0
    );
    const totalDisharmony = analyzed.reduce(
      (sum, r) => sum + r.metrics.averageDisharmony * r.metrics.totalFunctions,
      0
    );
    const maxDisharmony = analyzed.reduce(
      (max, r) => Math.max(max, r.metrics.maxDisharmony),
      0
    );

    return {
      totalFiles: results.length,
      analyzedFiles: analyzed.length,
      errorFiles: errors.length,
      skippedFiles: skipped.length,
      totalFunctions,
      disharmoniousFunctions,
      averageDisharmony: totalFunctions > 0 ? totalDisharmony / totalFunctions : 0,
      maxDisharmony,
      analysisTime,
    };
  }
}
