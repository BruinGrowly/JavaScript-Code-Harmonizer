/**
 * SARIF (Static Analysis Results Interchange Format) output formatter
 * For GitHub Code Scanning and other CI/CD integrations
 * Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import { ProjectAnalysisResult } from '../project/project-analyzer';

export interface SarifLog {
  version: '2.1.0';
  $schema: string;
  runs: SarifRun[];
}

export interface SarifRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
  properties?: {
    metrics?: Record<string, number>;
  };
}

export interface SarifRule {
  id: string;
  name: string;
  shortDescription: {
    text: string;
  };
  fullDescription: {
    text: string;
  };
  help: {
    text: string;
    markdown: string;
  };
  defaultConfiguration: {
    level: 'note' | 'warning' | 'error';
  };
  properties?: {
    tags?: string[];
  };
}

export interface SarifResult {
  ruleId: string;
  level: 'note' | 'warning' | 'error';
  message: {
    text: string;
    markdown?: string;
  };
  locations: Array<{
    physicalLocation: {
      artifactLocation: {
        uri: string;
        uriBaseId?: string;
      };
      region: {
        startLine: number;
        startColumn?: number;
      };
    };
  }>;
  properties?: {
    disharmony?: number;
    suggestions?: Array<{ name: string; similarity: number }>;
  };
}

/**
 * SARIF formatter
 */
export class SarifFormatter {
  private static readonly VERSION = '0.2.0';
  private static readonly SCHEMA_URL =
    'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json';
  private static readonly REPO_URL = 'https://github.com/BruinGrowly/JavaScript-Code-Harmonizer';

  /**
   * Convert project analysis result to SARIF format
   */
  static format(result: ProjectAnalysisResult): SarifLog {
    return {
      version: '2.1.0',
      $schema: this.SCHEMA_URL,
      runs: [
        {
          tool: {
            driver: {
              name: 'JavaScript Code Harmonizer',
              version: this.VERSION,
              informationUri: this.REPO_URL,
              rules: this.createRules(),
            },
          },
          results: this.createResults(result),
          properties: {
            metrics: {
              totalFiles: result.summary.totalFiles,
              analyzedFiles: result.summary.analyzedFiles,
              errorFiles: result.summary.errorFiles,
              totalFunctions: result.summary.totalFunctions,
              disharmoniousFunctions: result.summary.disharmoniousFunctions,
              averageDisharmony: result.summary.averageDisharmony,
              maxDisharmony: result.summary.maxDisharmony,
            },
          },
        },
      ],
    };
  }

  /**
   * Create SARIF rules
   */
  private static createRules(): SarifRule[] {
    return [
      {
        id: 'semantic-disharmony-high',
        name: 'High Semantic Disharmony',
        shortDescription: {
          text: 'Function name does not match implementation (high severity)',
        },
        fullDescription: {
          text: 'The semantic analysis detected high disharmony between the function name (intent) and its implementation (execution). This indicates that the function name is misleading and does not accurately represent what the function does.',
        },
        help: {
          text: 'Review the function implementation and rename it to better reflect what it actually does. Consider the suggested names based on semantic analysis.',
          markdown:
            '## High Semantic Disharmony\n\nThis function has high disharmony between its name and implementation.\n\n### Why this matters\n- Misleading function names make code harder to understand\n- Can lead to bugs when developers misuse the function\n- Violates the principle of least surprise\n\n### How to fix\n1. Review what the function actually does\n2. Rename it to match its behavior\n3. Consider the suggested names from semantic analysis\n4. Update all callers after renaming',
        },
        defaultConfiguration: {
          level: 'error',
        },
        properties: {
          tags: ['semantic', 'naming', 'maintainability'],
        },
      },
      {
        id: 'semantic-disharmony-medium',
        name: 'Medium Semantic Disharmony',
        shortDescription: {
          text: 'Function name somewhat mismatches implementation (medium severity)',
        },
        fullDescription: {
          text: 'The semantic analysis detected moderate disharmony between the function name and implementation. The function name may be vague or only partially accurate.',
        },
        help: {
          text: 'Consider renaming the function to better represent its implementation. Review the suggested names.',
          markdown:
            '## Medium Semantic Disharmony\n\nThis function has moderate disharmony between its name and implementation.\n\n### Recommendations\n- Consider making the function name more specific\n- Review if the function is doing too much (single responsibility)\n- Check if the name captures all important aspects of the implementation',
        },
        defaultConfiguration: {
          level: 'warning',
        },
        properties: {
          tags: ['semantic', 'naming', 'maintainability'],
        },
      },
      {
        id: 'semantic-disharmony-low',
        name: 'Low Semantic Disharmony',
        shortDescription: {
          text: 'Function has minor semantic disharmony',
        },
        fullDescription: {
          text: 'The semantic analysis detected low disharmony. The function name generally matches its implementation but could be slightly improved.',
        },
        help: {
          text: 'This is informational. The function name is generally good but could potentially be more precise.',
          markdown:
            '## Low Semantic Disharmony\n\nThis function has minor room for improvement in naming clarity.',
        },
        defaultConfiguration: {
          level: 'note',
        },
        properties: {
          tags: ['semantic', 'naming', 'code-quality'],
        },
      },
    ];
  }

  /**
   * Create SARIF results from analysis
   */
  private static createResults(result: ProjectAnalysisResult): SarifResult[] {
    const results: SarifResult[] = [];

    for (const file of result.files) {
      if (file.status !== 'success') {
        continue;
      }

      for (const func of file.functions) {
        // Only report functions with disharmony above threshold
        if (func.disharmony < 0.3) {
          continue;
        }

        const ruleId = this.getRuleId(func.severity);
        const level = this.getLevel(func.severity);

        const message = this.createMessage(func);

        results.push({
          ruleId,
          level,
          message,
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: file.relativePath,
                },
                region: {
                  startLine: func.line,
                },
              },
            },
          ],
          properties: {
            disharmony: func.disharmony,
            suggestions: func.suggestions,
          },
        });
      }
    }

    return results;
  }

  /**
   * Get rule ID based on severity
   */
  private static getRuleId(severity: string): string {
    switch (severity) {
      case 'HIGH':
        return 'semantic-disharmony-high';
      case 'MEDIUM':
        return 'semantic-disharmony-medium';
      case 'LOW':
        return 'semantic-disharmony-low';
      default:
        return 'semantic-disharmony-low';
    }
  }

  /**
   * Get SARIF level based on severity
   */
  private static getLevel(severity: string): 'note' | 'warning' | 'error' {
    switch (severity) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'note';
      default:
        return 'note';
    }
  }

  /**
   * Create message for result
   */
  private static createMessage(func: {
    name: string;
    disharmony: number;
    severity: string;
    suggestions?: Array<{ name: string; similarity: number }>;
  }): { text: string; markdown?: string } {
    const text = `Function '${func.name}' has ${func.severity.toLowerCase()} semantic disharmony (${func.disharmony.toFixed(3)})`;

    let markdown = `## Semantic Disharmony: \`${func.name}\`\n\n`;
    markdown += `**Severity**: ${func.severity}\n`;
    markdown += `**Disharmony Score**: ${func.disharmony.toFixed(3)}\n\n`;

    markdown += `### What this means\n`;
    markdown +=
      `The function name "${func.name}" does not accurately represent what the function actually does. `;
    markdown += `This can lead to confusion and bugs.\n\n`;

    if (func.suggestions && func.suggestions.length > 0) {
      markdown += `### Suggested names\n`;
      markdown += `Based on semantic analysis of the function's implementation:\n\n`;
      for (let i = 0; i < Math.min(func.suggestions.length, 5); i++) {
        const suggestion = func.suggestions[i];
        markdown += `${i + 1}. \`${suggestion.name}\` (similarity: ${(suggestion.similarity * 100).toFixed(1)}%)\n`;
      }
      markdown += `\n`;
    }

    markdown += `### Recommended actions\n`;
    markdown += `1. Review the function's implementation\n`;
    markdown += `2. Rename the function to match what it actually does\n`;
    markdown += `3. Update all callers after renaming\n`;

    return { text, markdown };
  }
}
