/**
 * Configuration system for JavaScript Code Harmonizer
 * Loads configuration from .harmonizerrc.json and .harmonizerignore
 */

import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export interface ThresholdConfig {
  low: number;
  medium: number;
  high: number;
}

export interface RuleConfig {
  'semantic-naming': 'off' | 'warn' | 'error';
  'ice-analysis': 'off' | 'warn' | 'error';
  'disharmony-threshold': 'off' | 'warn' | 'error';
}

export interface HarmonizerConfig {
  /**
   * Thresholds for disharmony levels
   */
  thresholds?: {
    disharmony?: ThresholdConfig;
  };

  /**
   * Glob patterns to ignore
   */
  ignore?: string[];

  /**
   * Rule configuration
   */
  rules?: Partial<RuleConfig>;

  /**
   * Custom vocabulary extensions
   */
  vocabulary?: {
    custom?: Record<string, 'love' | 'justice' | 'power' | 'wisdom'>;
  };

  /**
   * Analysis options
   */
  analysis?: {
    suggestNames?: boolean;
    topSuggestions?: number;
    minConfidence?: number;
  };

  /**
   * Performance options
   */
  performance?: {
    parallelism?: number;
    cache?: boolean;
    incremental?: boolean;
    fileTimeout?: number;
    maxMemory?: number;
  };

  /**
   * Output options
   */
  output?: {
    format?: 'text' | 'json' | 'sarif' | 'markdown';
    verbose?: boolean;
    showProgress?: boolean;
    mode?: 'pragmatic' | 'standard' | 'verbose';
  };

  /**
   * CI/CD options
   */
  ci?: {
    failOnHigh?: boolean;
    failOnMedium?: boolean;
    baselineFile?: string;
    exitCode?: boolean;
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Required<HarmonizerConfig> = {
  thresholds: {
    disharmony: {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
    },
  },
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/.git/**',
  ],
  rules: {
    'semantic-naming': 'warn',
    'ice-analysis': 'warn',
    'disharmony-threshold': 'error',
  },
  vocabulary: {
    custom: {},
  },
  analysis: {
    suggestNames: false,
    topSuggestions: 5,
    minConfidence: 0.7,
  },
  performance: {
    parallelism: 4,
    cache: false,
    incremental: false,
    fileTimeout: 30000,
    maxMemory: 0,
  },
  output: {
    format: 'text',
    verbose: false,
    showProgress: true,
    mode: 'pragmatic',
  },
  ci: {
    failOnHigh: false,
    failOnMedium: false,
    baselineFile: '',
    exitCode: false,
  },
};

/**
 * Configuration loader
 */
export class ConfigLoader {
  /**
   * Load configuration from a specific directory
   */
  static loadConfig(searchPath: string): HarmonizerConfig {
    const configPath = this.findConfigFile(searchPath);

    if (!configPath) {
      return { ...DEFAULT_CONFIG };
    }

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(content) as HarmonizerConfig;

      // Merge with defaults
      return this.mergeConfig(DEFAULT_CONFIG, userConfig);
    } catch (error) {
      console.warn(
        `⚠️  Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Find .harmonizerrc.json file by walking up the directory tree
   */
  private static findConfigFile(startPath: string): string | null {
    const configNames = ['.harmonizerrc.json', '.harmonizerrc', 'harmonizer.config.json'];

    let currentPath = path.resolve(startPath);

    while (true) {
      for (const configName of configNames) {
        const configPath = path.join(currentPath, configName);
        if (fs.existsSync(configPath)) {
          return configPath;
        }
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        // Reached root
        break;
      }
      currentPath = parentPath;
    }

    return null;
  }

  /**
   * Load .harmonizerignore file
   */
  static loadIgnoreFile(searchPath: string): Ignore {
    const ig = ignore();

    const ignorePath = this.findIgnoreFile(searchPath);

    if (ignorePath) {
      try {
        const content = fs.readFileSync(ignorePath, 'utf-8');
        ig.add(content);
      } catch (error) {
        console.warn(
          `⚠️  Failed to load .harmonizerignore from ${ignorePath}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return ig;
  }

  /**
   * Find .harmonizerignore file
   */
  private static findIgnoreFile(startPath: string): string | null {
    let currentPath = path.resolve(startPath);

    while (true) {
      const ignorePath = path.join(currentPath, '.harmonizerignore');
      if (fs.existsSync(ignorePath)) {
        return ignorePath;
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    return null;
  }

  /**
   * Deep merge configuration objects
   */
  private static mergeConfig(
    defaults: Required<HarmonizerConfig>,
    user: HarmonizerConfig
  ): Required<HarmonizerConfig> {
    const defaultDisharmony = defaults.thresholds?.disharmony || { low: 0.3, medium: 0.6, high: 0.8 };
    const mergedThresholds: ThresholdConfig = {
      low: user.thresholds?.disharmony?.low ?? defaultDisharmony.low,
      medium: user.thresholds?.disharmony?.medium ?? defaultDisharmony.medium,
      high: user.thresholds?.disharmony?.high ?? defaultDisharmony.high,
    };

    return {
      thresholds: {
        disharmony: mergedThresholds,
      },
      ignore: user.ignore || defaults.ignore,
      rules: {
        ...defaults.rules,
        ...(user.rules || {}),
      },
      vocabulary: {
        custom: {
          ...defaults.vocabulary.custom,
          ...(user.vocabulary?.custom || {}),
        },
      },
      analysis: {
        ...defaults.analysis,
        ...(user.analysis || {}),
      },
      performance: {
        ...defaults.performance,
        ...(user.performance || {}),
      },
      output: {
        ...defaults.output,
        ...(user.output || {}),
      },
      ci: {
        ...defaults.ci,
        ...(user.ci || {}),
      },
    };
  }

  /**
   * Validate configuration
   */
  static validateConfig(config: HarmonizerConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate thresholds
    if (config.thresholds?.disharmony) {
      const { low, medium, high } = config.thresholds.disharmony;
      if (low < 0 || low > 1) errors.push('thresholds.disharmony.low must be between 0 and 1');
      if (medium < 0 || medium > 1)
        errors.push('thresholds.disharmony.medium must be between 0 and 1');
      if (high < 0 || high > 1) errors.push('thresholds.disharmony.high must be between 0 and 1');
      if (low >= medium || medium >= high) {
        errors.push('thresholds.disharmony must be in increasing order: low < medium < high');
      }
    }

    // Validate performance settings
    if (config.performance?.parallelism && config.performance.parallelism < 1) {
      errors.push('performance.parallelism must be >= 1');
    }

    if (config.performance?.fileTimeout && config.performance.fileTimeout < 1000) {
      errors.push('performance.fileTimeout must be >= 1000ms');
    }

    // Validate analysis settings
    if (
      config.analysis?.minConfidence &&
      (config.analysis.minConfidence < 0 || config.analysis.minConfidence > 1)
    ) {
      errors.push('analysis.minConfidence must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a default .harmonizerrc.json file
   */
  static createDefaultConfig(targetPath: string): void {
    const configPath = path.join(targetPath, '.harmonizerrc.json');

    if (fs.existsSync(configPath)) {
      throw new Error(`Configuration file already exists at ${configPath}`);
    }

    const exampleConfig: HarmonizerConfig = {
      thresholds: {
        disharmony: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
        },
      },
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.js'],
      rules: {
        'semantic-naming': 'warn',
        'ice-analysis': 'warn',
        'disharmony-threshold': 'error',
      },
      analysis: {
        suggestNames: true,
        topSuggestions: 5,
        minConfidence: 0.7,
      },
      performance: {
        parallelism: 4,
        cache: true,
        incremental: true,
      },
      output: {
        format: 'text',
        verbose: false,
      },
      ci: {
        failOnHigh: true,
        failOnMedium: false,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2), 'utf-8');
  }

  /**
   * Create a default .harmonizerignore file
   */
  static createDefaultIgnore(targetPath: string): void {
    const ignorePath = path.join(targetPath, '.harmonizerignore');

    if (fs.existsSync(ignorePath)) {
      throw new Error(`Ignore file already exists at ${ignorePath}`);
    }

    const defaultIgnore = `# Dependencies
node_modules/
bower_components/

# Build outputs
dist/
build/
out/
.next/
.nuxt/

# Testing
coverage/
.nyc_output/
*.test.js
*.spec.js
__tests__/
__mocks__/

# Minified files
*.min.js
*.bundle.js

# Generated files
*.generated.js
*.g.js

# Version control
.git/
.svn/
.hg/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
logs/
`;

    fs.writeFileSync(ignorePath, defaultIgnore, 'utf-8');
  }
}
