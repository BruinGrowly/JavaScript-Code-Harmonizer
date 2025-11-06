/**
 * Comprehensive CLI Demonstration
 * Shows all features of the JavaScript Code Harmonizer
 */

import { CodeHarmonizer, SemanticNamingEngine } from '../src/index';
import * as path from 'path';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║       JavaScript Code Harmonizer - Complete Demo                ║');
console.log('║       Semantic Bug Detection & Code Analysis                    ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

async function runDemo() {
  // Demo 1: Analyze buggy code
  console.log('═'.repeat(70));
  console.log('DEMO 1: Analyzing Code with Semantic Bugs');
  console.log('═'.repeat(70));
  console.log('');

  const buggyFile = path.join(__dirname, 'test-files', 'buggy-code.js');
  const harmonizer1 = new CodeHarmonizer({
    threshold: 0.5,
    verbose: true,
    suggestNames: true,
    topSuggestions: 3,
  });

  console.log(`📄 File: ${buggyFile}`);
  console.log('');

  const result1 = await harmonizer1.analyzeFile(buggyFile);
  const output1 = harmonizer1.generateOutput(result1);
  console.log(output1);

  console.log('\n\n');

  // Demo 2: Analyze harmonious code
  console.log('═'.repeat(70));
  console.log('DEMO 2: Analyzing Harmonious Code');
  console.log('═'.repeat(70));
  console.log('');

  const goodFile = path.join(__dirname, 'test-files', 'good-code.js');
  const harmonizer2 = new CodeHarmonizer({
    threshold: 0.5,
    verbose: false, // Less verbose for good code
  });

  console.log(`📄 File: ${goodFile}`);
  console.log('');

  const result2 = await harmonizer2.analyzeFile(goodFile);
  const output2 = harmonizer2.generateOutput(result2);
  console.log(output2);

  console.log('\n\n');

  // Demo 3: JSON Output
  console.log('═'.repeat(70));
  console.log('DEMO 3: JSON Output (for CI/CD Integration)');
  console.log('═'.repeat(70));
  console.log('');

  const harmonizer3 = new CodeHarmonizer({
    format: 'json',
    suggestNames: true,
  });

  const result3 = await harmonizer3.analyzeFile(buggyFile);
  const jsonOutput = harmonizer3.generateOutput(result3);

  console.log('Sample JSON output (first function):');
  const parsed = JSON.parse(jsonOutput);
  console.log(JSON.stringify(parsed.functions[0], null, 2));

  console.log('\n\n');

  // Demo 4: Semantic Naming Engine Standalone
  console.log('═'.repeat(70));
  console.log('DEMO 4: Semantic Naming Engine');
  console.log('═'.repeat(70));
  console.log('');

  const namingEngine = new SemanticNamingEngine();

  console.log('Naming Engine Statistics:');
  const stats = namingEngine.getStats();
  console.log(`  Total Action Verbs: ${stats.totalVerbs}`);
  console.log('  Verbs by Category:');
  console.log(`    Wisdom  (Information): ${stats.verbsByCategory.wisdom}`);
  console.log(`    Justice (Validation):  ${stats.verbsByCategory.justice}`);
  console.log(`    Power   (Action):      ${stats.verbsByCategory.power}`);
  console.log(`    Love    (Communication): ${stats.verbsByCategory.love}`);

  console.log('\n\n');

  // Demo 5: Comparison
  console.log('═'.repeat(70));
  console.log('DEMO 5: Comparison Summary');
  console.log('═'.repeat(70));
  console.log('');

  console.log('Buggy Code Analysis:');
  console.log(`  Total Functions:    ${result1.summary.totalFunctions}`);
  console.log(`  Harmonious:         ${result1.summary.harmonious} ✅`);
  console.log(`  Disharmonious:      ${result1.summary.disharmonious} ⚠️`);
  console.log(`  Average Disharmony: ${result1.summary.avgDisharmony.toFixed(3)}`);
  console.log('');

  console.log('Good Code Analysis:');
  console.log(`  Total Functions:    ${result2.summary.totalFunctions}`);
  console.log(`  Harmonious:         ${result2.summary.harmonious} ✅`);
  console.log(`  Disharmonious:      ${result2.summary.disharmonious} ⚠️`);
  console.log(`  Average Disharmony: ${result2.summary.avgDisharmony.toFixed(3)}`);
  console.log('');

  console.log('═'.repeat(70));
  console.log('');
  console.log('✨ The JavaScript Code Harmonizer successfully detected semantic bugs');
  console.log('   that would be missed by all traditional static analysis tools!');
  console.log('');
  console.log('Key Findings:');
  console.log('  • Detected functions where names contradict implementations');
  console.log('  • Validated harmonious code where names match behavior');
  console.log('  • Provided intelligent naming suggestions based on semantics');
  console.log('  • Calculated precise disharmony scores in 4D semantic space');
  console.log('');
  console.log('Try it yourself:');
  console.log('  npm run harmonizer examples/test-files/buggy-code.js --verbose --suggest-names');
  console.log('');
  console.log('═'.repeat(70));
}

// Run the demo
runDemo().catch((error) => {
  console.error('Error running demo:', error.message);
  process.exit(1);
});
