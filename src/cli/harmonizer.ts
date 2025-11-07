#!/usr/bin/env node

/**
 * JavaScript Code Harmonizer - CLI Tool
 *
 * Main command-line interface for analyzing JavaScript/TypeScript code
 * for semantic bugs and disharmony.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SemanticEngine } from '../core/engine';
import { ASTSemanticParser } from '../parser/ast-parser';
import { SemanticNamingEngine } from '../naming/semantic-naming';
import { ICEAnalysisResult } from '../core/coordinates';

/**
 * Analysis configuration
 */
export interface HarmonizerConfig {
  threshold?: number;
  suggestNames?: boolean;
  topSuggestions?: number;
  format?: 'text' | 'json';
  verbose?: boolean;
}

/**
 * File analysis result
 */
export interface FileAnalysisResult {
  filePath: string;
  functions: FunctionAnalysisResult[];
  summary: {
    totalFunctions: number;
    harmonious: number;
    disharmonious: number;
    avgDisharmony: number;
    severityCounts: Record<string, number>;
  };
}

/**
 * Individual function analysis result
 */
export interface FunctionAnalysisResult {
  name: string;
  line?: number;
  disharmony: number;
  severity: string;
  intent: {
    coordinates: string;
    dominant: string;
  };
  execution: {
    coordinates: string;
    dominant: string;
  };
  suggestions?: Array<{
    name: string;
    similarity: number;
  }>;
  trajectory?: {
    love: { intent: number; execution: number; delta: number };
    justice: { intent: number; execution: number; delta: number };
    power: { intent: number; execution: number; delta: number };
    wisdom: { intent: number; execution: number; delta: number };
  };
  baselines?: {
    robustness: number;
    effectiveness: number;
    growthPotential: number;
    harmony: number;
    compositeScore: number;
    distanceFromNaturalEquilibrium: number;
    interpretation: string;
  };
}

/**
 * CodeHarmonizer - Main analysis class
 */
export class CodeHarmonizer {
  private engine: SemanticEngine;
  private parser: ASTSemanticParser;
  private namingEngine: SemanticNamingEngine;
  private config: Required<HarmonizerConfig>;

  constructor(config: HarmonizerConfig = {}) {
    this.config = {
      threshold: config.threshold ?? 0.5,
      suggestNames: config.suggestNames ?? false,
      topSuggestions: config.topSuggestions ?? 3,
      format: config.format ?? 'text',
      verbose: config.verbose ?? false,
    };

    this.engine = new SemanticEngine();
    this.parser = new ASTSemanticParser(this.engine.getVocabulary());
    this.namingEngine = new SemanticNamingEngine();
  }

  /**
   * Analyze a JavaScript/TypeScript file
   */
  async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    const code = fs.readFileSync(filePath, 'utf-8');
    const functions = this.parser.extractFunctions(code);

    const results: FunctionAnalysisResult[] = [];
    let totalDisharmony = 0;
    const severityCounts: Record<string, number> = {
      excellent: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const { node, metadata } of functions) {
      const parseResult = this.parser.analyzeFunction(node, metadata);

      // Perform ICE analysis
      const iceAnalysis = this.engine.performICEAnalysis(
        parseResult.intent,
        ['javascript', 'function', path.basename(filePath)],
        parseResult.execution
      );

      totalDisharmony += iceAnalysis.disharmony;
      severityCounts[iceAnalysis.severity]++;

      // Generate naming suggestions if requested
      let suggestions;
      if (this.config.suggestNames) {
        const namingSuggestions = this.namingEngine.suggestNames(
          iceAnalysis.execution,
          undefined,
          this.config.topSuggestions
        );
        suggestions = namingSuggestions.map((s) => ({
          name: s.name,
          similarity: s.similarity,
        }));
      }

      // Calculate trajectory
      const trajectory = this.calculateTrajectory(iceAnalysis);

      results.push({
        name: metadata.name,
        line: metadata.location?.start.line,
        disharmony: iceAnalysis.disharmony,
        severity: iceAnalysis.severity,
        intent: {
          coordinates: iceAnalysis.intent.toString(),
          dominant: iceAnalysis.intent.getDominantDimension(),
        },
        execution: {
          coordinates: iceAnalysis.execution.toString(),
          dominant: iceAnalysis.execution.getDominantDimension(),
        },
        suggestions,
        trajectory,
      });
    }

    const harmonious = results.filter((r) => r.disharmony <= this.config.threshold).length;

    return {
      filePath,
      functions: results,
      summary: {
        totalFunctions: results.length,
        harmonious,
        disharmonious: results.length - harmonious,
        avgDisharmony: results.length > 0 ? totalDisharmony / results.length : 0,
        severityCounts,
      },
    };
  }

  /**
   * Calculate semantic trajectory (dimension-by-dimension changes)
   */
  private calculateTrajectory(iceAnalysis: ICEAnalysisResult) {
    return {
      love: {
        intent: iceAnalysis.intent.love,
        execution: iceAnalysis.execution.love,
        delta: iceAnalysis.execution.love - iceAnalysis.intent.love,
      },
      justice: {
        intent: iceAnalysis.intent.justice,
        execution: iceAnalysis.execution.justice,
        delta: iceAnalysis.execution.justice - iceAnalysis.intent.justice,
      },
      power: {
        intent: iceAnalysis.intent.power,
        execution: iceAnalysis.execution.power,
        delta: iceAnalysis.execution.power - iceAnalysis.intent.power,
      },
      wisdom: {
        intent: iceAnalysis.intent.wisdom,
        execution: iceAnalysis.execution.wisdom,
        delta: iceAnalysis.execution.wisdom - iceAnalysis.intent.wisdom,
      },
    };
  }

  /**
   * Format results as text
   */
  formatTextOutput(result: FileAnalysisResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(70));
    lines.push('JavaScript Code Harmonizer v0.2.0');
    lines.push('Semantic Bug Detection & Code Analysis');
    lines.push('='.repeat(70));
    lines.push('');
    lines.push(`File: ${result.filePath}`);
    lines.push(`Functions analyzed: ${result.summary.totalFunctions}`);
    lines.push('');

    if (result.functions.length === 0) {
      lines.push('No functions found in file.');
      return lines.join('\n');
    }

    lines.push('ANALYSIS RESULTS:');
    lines.push('─'.repeat(70));
    lines.push('');

    for (const func of result.functions) {
      const status = func.disharmony <= this.config.threshold ? '✅' : '⚠️ ';
      const severityEmoji = this.getSeverityEmoji(func.severity);

      lines.push(`${status} ${func.name}${func.line ? `:${func.line}` : ''}`);
      lines.push(`   Disharmony: ${func.disharmony.toFixed(3)} ${severityEmoji} ${func.severity.toUpperCase()}`);

      if (this.config.verbose) {
        lines.push(`   Intent:     ${func.intent.coordinates}`);
        lines.push(`   Execution:  ${func.execution.coordinates}`);

        // Show trajectory
        lines.push('');
        lines.push('   📍 SEMANTIC TRAJECTORY:');
        lines.push('   ┌────────────────────────────────────────────────────────┐');
        lines.push('   │ Dimension    Intent   →   Execution      Δ            │');
        lines.push('   ├────────────────────────────────────────────────────────┤');

        if (func.trajectory) {
          for (const [dim, values] of Object.entries(func.trajectory)) {
            const deltaStr = values.delta >= 0 ? `+${values.delta.toFixed(2)}` : values.delta.toFixed(2);
            const indicator = Math.abs(values.delta) > 0.3 ? '⚠️' : '~';
            const dimName = dim.charAt(0).toUpperCase() + dim.slice(1);
            lines.push(
              `   │ ${dimName.padEnd(12)} ${values.intent.toFixed(2)}  →  ${values.execution.toFixed(
                2
              )}      ${deltaStr.padEnd(6)} ${indicator} │`
            );
          }
        }

        lines.push('   └────────────────────────────────────────────────────────┘');
      }

      if (func.suggestions && func.suggestions.length > 0) {
        lines.push('');
        lines.push('   💡 BETTER NAME SUGGESTIONS:');
        func.suggestions.forEach((sug, i) => {
          lines.push(`      ${i + 1}. ${sug.name} (similarity: ${sug.similarity.toFixed(3)})`);
        });
      }

      lines.push('');
    }

    lines.push('─'.repeat(70));
    lines.push('SUMMARY:');
    lines.push(`   Total Functions:    ${result.summary.totalFunctions}`);
    lines.push(`   Harmonious:         ${result.summary.harmonious} ✅`);
    lines.push(`   Disharmonious:      ${result.summary.disharmonious} ⚠️`);
    lines.push(`   Average Disharmony: ${result.summary.avgDisharmony.toFixed(3)}`);
    lines.push('');
    lines.push('   Severity Breakdown:');
    lines.push(`      Excellent: ${result.summary.severityCounts.excellent}`);
    lines.push(`      Low:       ${result.summary.severityCounts.low}`);
    lines.push(`      Medium:    ${result.summary.severityCounts.medium}`);
    lines.push(`      High:      ${result.summary.severityCounts.high}`);
    lines.push(`      Critical:  ${result.summary.severityCounts.critical}`);
    lines.push('');
    lines.push('='.repeat(70));

    return lines.join('\n');
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      excellent: '✨',
      low: '📗',
      medium: '📙',
      high: '📕',
      critical: '🚨',
    };
    return emojis[severity] || '❓';
  }

  /**
   * Format results as JSON
   */
  formatJsonOutput(result: FileAnalysisResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate output based on config format
   */
  generateOutput(result: FileAnalysisResult): string {
    if (this.config.format === 'json') {
      return this.formatJsonOutput(result);
    }
    return this.formatTextOutput(result);
  }
}

/**
 * Main CLI entry point - delegates to enhanced CLI
 */
export async function main(_args: string[]) {
  // Delegate to the enhanced CLI with all interactive features
  const { main: cliMain } = await import('./harmonizer-cli');
  await cliMain();
}

// Run CLI if executed directly
if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
