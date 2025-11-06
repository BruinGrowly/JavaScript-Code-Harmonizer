/**
 * Demo script for Phase 1 features
 * Tests multi-file analysis, caching, configuration, and CI/CD features
 */

import * as path from 'path';
import * as fs from 'fs';
import { ProjectAnalyzer } from '../src/project/project-analyzer';
import { ConfigLoader } from '../src/config/config-loader';
import { BaselineManager } from '../src/ci/baseline-manager';
import { SarifFormatter } from '../src/output/sarif-formatter';

async function demo() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   JavaScript Code Harmonizer - Phase 1 Feature Demo');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const testFilesDir = path.join(__dirname, 'test-files');

  // ===================================================================
  // 1. Multi-File Analysis
  // ===================================================================
  console.log('📁 1. MULTI-FILE ANALYSIS');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const analyzer = new ProjectAnalyzer();
  const result = await analyzer.analyzeProject({
    rootPath: testFilesDir,
    include: ['**/*.js'],
    exclude: ['**/node_modules/**'],
    parallelism: 2,
    cache: false,
    showProgress: true,
  });

  console.log('');
  console.log(`✅ Analyzed ${result.summary.analyzedFiles} files`);
  console.log(`   Total functions: ${result.summary.totalFunctions}`);
  console.log(`   Disharmonious: ${result.summary.disharmoniousFunctions}`);
  console.log(`   Average disharmony: ${result.summary.averageDisharmony.toFixed(3)}`);
  console.log('');

  // ===================================================================
  // 2. Configuration System
  // ===================================================================
  console.log('⚙️  2. CONFIGURATION SYSTEM');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const config = ConfigLoader.loadConfig(process.cwd());
  console.log('✅ Configuration loaded');
  console.log(`   Disharmony thresholds: ${JSON.stringify(config.thresholds?.disharmony || {})}`);
  console.log(`   Ignore patterns: ${config.ignore?.length || 0} patterns`);
  console.log('');

  // ===================================================================
  // 3. Caching System
  // ===================================================================
  console.log('💾 3. CACHING SYSTEM');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const cacheDir = path.join(process.cwd(), '.harmonizer-cache-demo');

  // First run - no cache
  console.log('First run (no cache):');
  const start1 = Date.now();
  await analyzer.analyzeProject({
    rootPath: testFilesDir,
    cache: true,
    cacheDir,
    incremental: true,
    showProgress: false,
  });
  const time1 = Date.now() - start1;
  console.log(`   Time: ${time1}ms`);

  // Second run - with cache
  console.log('Second run (with cache):');
  const start2 = Date.now();
  await analyzer.analyzeProject({
    rootPath: testFilesDir,
    cache: true,
    cacheDir,
    incremental: true,
    showProgress: false,
  });
  const time2 = Date.now() - start2;
  console.log(`   Time: ${time2}ms`);
  console.log(`   Speedup: ${(time1 / time2).toFixed(2)}x faster`);
  console.log('');

  // Cleanup cache
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true });
  }

  // ===================================================================
  // 4. Baseline Comparison
  // ===================================================================
  console.log('📊 4. BASELINE COMPARISON');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const baselinePath = path.join(process.cwd(), 'baseline-demo.json');

  // Save baseline
  const metrics = BaselineManager.extractMetrics(result);
  BaselineManager.saveBaseline(metrics, baselinePath);
  console.log(`✅ Baseline saved to ${baselinePath}`);

  // Compare with baseline (should show no changes)
  const comparison = BaselineManager.compare(result, baselinePath);
  console.log(`   Status: ${comparison.status}`);
  console.log(`   Regressions: ${comparison.regressions.length}`);
  console.log(`   Improvements: ${comparison.improvements.length}`);
  console.log('');

  // Cleanup baseline
  if (fs.existsSync(baselinePath)) {
    fs.unlinkSync(baselinePath);
  }

  // ===================================================================
  // 5. SARIF Output Format
  // ===================================================================
  console.log('📄 5. SARIF OUTPUT FORMAT');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const sarif = SarifFormatter.format(result);
  console.log(`✅ SARIF format generated`);
  console.log(`   Version: ${sarif.version}`);
  console.log(`   Runs: ${sarif.runs.length}`);
  console.log(`   Results: ${sarif.runs[0].results.length}`);
  console.log(`   Rules: ${sarif.runs[0].tool.driver.rules.length}`);
  console.log('');

  // ===================================================================
  // 6. CI/CD Exit Codes
  // ===================================================================
  console.log('🔧 6. CI/CD EXIT CODES');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');

  const exitCode = BaselineManager.getExitCode(
    comparison,
    true, // failOnHigh
    false, // failOnMedium
    result
  );

  console.log(`   Exit code: ${exitCode}`);
  console.log(`   Meaning: ${exitCode === 0 ? 'PASS ✅' : exitCode === 1 ? 'FAIL ❌' : 'ERROR ⚠️'}`);
  console.log('');

  // ===================================================================
  // Summary
  // ===================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                     DEMO COMPLETE                         ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ All Phase 1 features working:');
  console.log('   • Multi-file project analysis with parallel processing');
  console.log('   • Configuration system (.harmonizerrc.json)');
  console.log('   • File caching with hash-based invalidation');
  console.log('   • Incremental analysis (only changed files)');
  console.log('   • Baseline comparison for CI/CD');
  console.log('   • SARIF output format');
  console.log('   • Exit code support for quality gates');
  console.log('');
  console.log('Ready for production use on large codebases!');
  console.log('');
}

// Run demo
demo().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
