/**
 * HTML Report Generator
 * Creates beautiful, interactive HTML reports with charts and tables
 */

import { ProjectAnalysisResult } from '../project/project-analyzer';
import * as fs from 'fs';
import * as path from 'path';

export interface HtmlReportOptions {
  title?: string;
  includeCharts?: boolean;
  includeFileDetails?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * HTML Report Generator
 */
export class HtmlReporter {
  /**
   * Generate HTML report from analysis result
   */
  static generate(
    result: ProjectAnalysisResult,
    options: HtmlReportOptions = {}
  ): string {
    const {
      title = 'Code Harmonizer Report',
      includeCharts = true,
      includeFileDetails = true,
      theme = 'light',
    } = options;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    ${includeCharts ? '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>' : ''}
    <style>
        ${this.getStyles(theme)}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader(result, title)}
        ${this.generateSummary(result)}
        ${includeCharts ? this.generateCharts(result) : ''}
        ${this.generateIssuesList(result)}
        ${includeFileDetails ? this.generateFileDetails(result) : ''}
        ${this.generateFooter(result)}
    </div>
    ${includeCharts ? this.generateChartScript(result) : ''}
</body>
</html>`;

    return html;
  }

  /**
   * Save HTML report to file
   */
  static save(
    result: ProjectAnalysisResult,
    filePath: string,
    options: HtmlReportOptions = {}
  ): void {
    const html = this.generate(result, options);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, html, 'utf-8');
  }

  /**
   * Get CSS styles
   */
  private static getStyles(theme: 'light' | 'dark'): string {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1e1e1e' : '#f5f7fa';
    const cardBg = isDark ? '#2d2d2d' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#2c3e50';
    const borderColor = isDark ? '#404040' : '#e1e8ed';

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: ${cardBg};
            padding: 25px;
            border-radius: 12px;
            border: 1px solid ${borderColor};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .summary-card h3 {
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8b95a5;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: 700;
            color: ${textColor};
        }

        .summary-card .subtitle {
            font-size: 0.9em;
            color: #8b95a5;
            margin-top: 5px;
        }

        .charts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .chart-card {
            background: ${cardBg};
            padding: 25px;
            border-radius: 12px;
            border: 1px solid ${borderColor};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .chart-card h2 {
            font-size: 1.3em;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .chart-container {
            position: relative;
            height: 300px;
        }

        .section {
            background: ${cardBg};
            padding: 30px;
            border-radius: 12px;
            border: 1px solid ${borderColor};
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .section h2 {
            font-size: 1.5em;
            margin-bottom: 20px;
            font-weight: 600;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        .issue-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .issue-item {
            padding: 20px;
            background: ${isDark ? '#252525' : '#f8f9fa'};
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: all 0.2s;
        }

        .issue-item:hover {
            border-left-width: 6px;
            padding-left: 18px;
        }

        .issue-item.severity-high {
            border-left-color: #e74c3c;
        }

        .issue-item.severity-medium {
            border-left-color: #f39c12;
        }

        .issue-item.severity-low {
            border-left-color: #3498db;
        }

        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .issue-title {
            font-size: 1.1em;
            font-weight: 600;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .issue-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-high {
            background: #e74c3c;
            color: white;
        }

        .badge-medium {
            background: #f39c12;
            color: white;
        }

        .badge-low {
            background: #3498db;
            color: white;
        }

        .issue-location {
            font-size: 0.9em;
            color: #8b95a5;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .issue-score {
            margin-top: 10px;
            font-size: 0.95em;
        }

        .score-value {
            font-weight: 700;
            color: #667eea;
        }

        .suggestions {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid ${borderColor};
        }

        .suggestions-title {
            font-size: 0.85em;
            color: #8b95a5;
            margin-bottom: 5px;
        }

        .suggestion-tag {
            display: inline-block;
            padding: 4px 10px;
            margin: 3px;
            background: ${isDark ? '#3a3a3a' : '#e9ecef'};
            border-radius: 15px;
            font-size: 0.85em;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .baselines-metrics {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid ${borderColor};
        }

        .baselines-title {
            font-size: 0.85em;
            color: #8b95a5;
            margin-bottom: 8px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 8px;
        }

        .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 10px;
            background: ${isDark ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 6px;
            font-size: 0.85em;
        }

        .metric-label {
            color: #8b95a5;
            font-weight: 500;
        }

        .metric-value {
            font-weight: 700;
            color: #667eea;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .baselines-interpretation {
            font-size: 0.85em;
            color: ${isDark ? '#9ca3af' : '#6b7280'};
            font-style: italic;
            padding: 6px 10px;
            background: ${isDark ? '#1f2937' : '#f3f4f6'};
            border-radius: 6px;
            border-left: 3px solid #667eea;
        }

        .file-details {
            margin-top: 20px;
        }

        .file-card {
            background: ${isDark ? '#252525' : '#f8f9fa'};
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }

        .file-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .file-path {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-weight: 600;
        }

        .file-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
            color: #8b95a5;
        }

        .footer {
            text-align: center;
            padding: 30px;
            color: #8b95a5;
            font-size: 0.9em;
        }

        .badge-success {
            background: #27ae60;
            color: white;
        }

        @media (max-width: 768px) {
            .charts {
                grid-template-columns: 1fr;
            }

            .summary {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 1.8em;
            }
        }
    `;
  }

  /**
   * Generate header section
   */
  private static generateHeader(result: ProjectAnalysisResult, title: string): string {
    return `
        <div class="header">
            <h1>${this.escapeHtml(title)}</h1>
            <p>Generated on ${new Date(result.timestamp).toLocaleString()}</p>
            <p>Project: ${this.escapeHtml(result.projectPath)}</p>
        </div>
    `;
  }

  /**
   * Generate summary cards
   */
  private static generateSummary(result: ProjectAnalysisResult): string {
    const { summary } = result;
    const passRate = summary.totalFunctions > 0
      ? (((summary.totalFunctions - summary.disharmoniousFunctions) / summary.totalFunctions) * 100).toFixed(1)
      : '0.0';

    return `
        <div class="summary">
            <div class="summary-card">
                <h3>Files Analyzed</h3>
                <div class="value">${summary.analyzedFiles}</div>
                <div class="subtitle">of ${summary.totalFiles} total</div>
            </div>
            <div class="summary-card">
                <h3>Total Functions</h3>
                <div class="value">${summary.totalFunctions}</div>
                <div class="subtitle">${summary.disharmoniousFunctions} with issues</div>
            </div>
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="value">${passRate}%</div>
                <div class="subtitle">functions in harmony</div>
            </div>
            <div class="summary-card">
                <h3>Avg Disharmony</h3>
                <div class="value">${summary.averageDisharmony.toFixed(3)}</div>
                <div class="subtitle">max: ${summary.maxDisharmony.toFixed(3)}</div>
            </div>
        </div>
    `;
  }

  /**
   * Generate charts section
   */
  private static generateCharts(_result: ProjectAnalysisResult): string {
    return `
        <div class="charts">
            <div class="chart-card">
                <h2>Severity Distribution</h2>
                <div class="chart-container">
                    <canvas id="severityChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h2>Top 10 Worst Files</h2>
                <div class="chart-container">
                    <canvas id="filesChart"></canvas>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate issues list
   */
  private static generateIssuesList(result: ProjectAnalysisResult): string {
    const issues: Array<{
      file: string;
      func: any;
    }> = [];

    for (const file of result.files) {
      if (file.status === 'success') {
        for (const func of file.functions) {
          if (func.disharmony > 0.5) {
            issues.push({ file: file.relativePath, func });
          }
        }
      }
    }

    issues.sort((a, b) => b.func.disharmony - a.func.disharmony);

    if (issues.length === 0) {
      return `
            <div class="section">
                <h2>Issues Found</h2>
                <div style="text-align: center; padding: 40px; color: #27ae60; font-size: 1.2em;">
                    ✅ No significant issues found! All functions are in harmony.
                </div>
            </div>
        `;
    }

    const issuesHtml = issues
      .slice(0, 50)
      .map((issue) => {
        const severityClass = `severity-${issue.func.severity.toLowerCase()}`;
        const badgeClass = `badge-${issue.func.severity.toLowerCase()}`;

        let suggestionsHtml = '';
        if (issue.func.suggestions && issue.func.suggestions.length > 0) {
          suggestionsHtml = `
                <div class="suggestions">
                    <div class="suggestions-title">💡 Better name suggestions:</div>
                    ${issue.func.suggestions
                      .slice(0, 5)
                      .map(
                        (s: any) =>
                          `<span class="suggestion-tag">${this.escapeHtml(s.name)} (${(s.similarity * 100).toFixed(0)}%)</span>`
                      )
                      .join('')}
                </div>
            `;
        }

        // Add baselines metrics if available
        let baselinesHtml = '';
        if (issue.func.baselines) {
          const b = issue.func.baselines;
          baselinesHtml = `
                <div class="baselines-metrics">
                    <div class="baselines-title">📊 Quality Metrics</div>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Composite:</span>
                            <span class="metric-value">${b.compositeScore.toFixed(2)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Robustness:</span>
                            <span class="metric-value">${b.robustness.toFixed(2)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Effectiveness:</span>
                            <span class="metric-value">${b.effectiveness.toFixed(2)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Growth:</span>
                            <span class="metric-value">${b.growthPotential.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="baselines-interpretation">${this.escapeHtml(b.interpretation)}</div>
                </div>
            `;
        }

        return `
                <div class="issue-item ${severityClass}">
                    <div class="issue-header">
                        <div class="issue-title">${this.escapeHtml(issue.func.name)}()</div>
                        <span class="issue-badge ${badgeClass}">${issue.func.severity}</span>
                    </div>
                    <div class="issue-location">${this.escapeHtml(issue.file)}:${issue.func.line}</div>
                    <div class="issue-score">
                        Disharmony: <span class="score-value">${issue.func.disharmony.toFixed(3)}</span>
                    </div>
                    ${baselinesHtml}
                    ${suggestionsHtml}
                </div>
            `;
      })
      .join('');

    return `
        <div class="section">
            <h2>Issues Found (${issues.length})</h2>
            <div class="issue-list">
                ${issuesHtml}
            </div>
            ${issues.length > 50 ? `<p style="text-align: center; margin-top: 20px; color: #8b95a5;">Showing top 50 of ${issues.length} issues</p>` : ''}
        </div>
    `;
  }

  /**
   * Generate file details section
   */
  private static generateFileDetails(result: ProjectAnalysisResult): string {
    const files = result.files
      .filter((f) => f.status === 'success' && f.metrics.totalFunctions > 0)
      .sort((a, b) => b.metrics.averageDisharmony - a.metrics.averageDisharmony);

    const filesHtml = files
      .map((file) => {
        const healthIcon =
          file.metrics.disharmoniousFunctions === 0
            ? '✅'
            : file.metrics.averageDisharmony > 0.8
              ? '❌'
              : '⚠️';

        return `
                <div class="file-card">
                    <div class="file-header">
                        <div class="file-path">${healthIcon} ${this.escapeHtml(file.relativePath)}</div>
                        <div class="file-stats">
                            <span>${file.metrics.totalFunctions} functions</span>
                            <span>${file.metrics.disharmoniousFunctions} issues</span>
                            <span>avg: ${file.metrics.averageDisharmony.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            `;
      })
      .join('');

    return `
        <div class="section">
            <h2>File Analysis (${files.length} files)</h2>
            <div class="file-details">
                ${filesHtml}
            </div>
        </div>
    `;
  }

  /**
   * Generate footer
   */
  private static generateFooter(result: ProjectAnalysisResult): string {
    return `
        <div class="footer">
            <p>Generated by <strong>JavaScript Code Harmonizer</strong> v0.2.0</p>
            <p>Analysis took ${(result.summary.analysisTime / 1000).toFixed(2)}s</p>
        </div>
    `;
  }

  /**
   * Generate Chart.js script
   */
  private static generateChartScript(result: ProjectAnalysisResult): string {
    // Count severity
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const file of result.files) {
      if (file.status === 'success') {
        for (const func of file.functions) {
          severityCounts[func.severity]++;
        }
      }
    }

    // Get top 10 worst files
    const files = result.files
      .filter((f) => f.status === 'success' && f.metrics.totalFunctions > 0)
      .sort((a, b) => b.metrics.averageDisharmony - a.metrics.averageDisharmony)
      .slice(0, 10);

    const fileLabels = files.map((f) => f.relativePath);
    const fileScores = files.map((f) => f.metrics.averageDisharmony);

    return `
    <script>
        // Severity Chart
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        new Chart(severityCtx, {
            type: 'doughnut',
            data: {
                labels: ['HIGH', 'MEDIUM', 'LOW'],
                datasets: [{
                    data: [${severityCounts.HIGH}, ${severityCounts.MEDIUM}, ${severityCounts.LOW}],
                    backgroundColor: ['#e74c3c', '#f39c12', '#3498db'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Files Chart
        const filesCtx = document.getElementById('filesChart').getContext('2d');
        new Chart(filesCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(fileLabels)},
                datasets: [{
                    label: 'Avg Disharmony',
                    data: ${JSON.stringify(fileScores)},
                    backgroundColor: '#667eea',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 1.5
                    }
                }
            }
        });
    </script>
    `;
  }

  /**
   * Escape HTML entities
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
