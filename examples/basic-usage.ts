/**
 * Basic usage examples for JavaScript Code Harmonizer
 */

import {
  SemanticEngine,
  ASTSemanticParser,
  VocabularyManager,
  Coordinates,
  DISHARMONY_THRESHOLDS,
} from '../src/index';

console.log('JavaScript Code Harmonizer - Basic Usage Examples\n');
console.log('='.repeat(60));

// Example 1: Detect a semantic bug
console.log('\n1. DETECTING A SEMANTIC BUG\n');

const buggyCode = `
function getUserData(userId) {
  // This function claims to "get" but actually "deletes"!
  database.delete(userId);
  cache.remove(userId);
  return userId;
}
`;

const engine = new SemanticEngine();
const parser = new ASTSemanticParser(engine.getVocabulary());

try {
  const result = parser.analyzeCode(buggyCode, 'getUserData');

  console.log('Function:', result.metadata.name);
  console.log('\nIntent concepts (from name):');
  console.log('  ', result.intent.join(', '));

  console.log('\nExecution concepts (from code):');
  console.log('  ', result.execution.join(', '));

  // Perform ICE analysis
  const iceAnalysis = engine.performICEAnalysis(result.intent, ['javascript', 'function'], result.execution);

  console.log('\nSemantic Analysis Results:');
  console.log('  Intent coordinates:   ', iceAnalysis.intent.toString());
  console.log('  Execution coordinates:', iceAnalysis.execution.toString());
  console.log('\n  Disharmony score:', iceAnalysis.disharmony.toFixed(3));
  console.log('  Severity:', iceAnalysis.severity.toUpperCase());

  if (iceAnalysis.severity !== 'excellent') {
    console.log('\n  ⚠️  SEMANTIC BUG DETECTED!');
    console.log('  Function name says "get" (Wisdom) but executes "delete" (Power)');
  }
} catch (error) {
  console.error('Error:', (error as Error).message);
}

// Example 2: Harmonious code
console.log('\n' + '='.repeat(60));
console.log('\n2. HARMONIOUS CODE\n');

const goodCode = `
function calculateTotal(items) {
  // Function name matches what it does
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  return sum;
}
`;

try {
  const result = parser.analyzeCode(goodCode, 'calculateTotal');

  console.log('Function:', result.metadata.name);
  console.log('\nIntent concepts:', result.intent.join(', '));
  console.log('Execution concepts:', result.execution.slice(0, 5).join(', '), '...');

  const iceAnalysis = engine.performICEAnalysis(result.intent, ['javascript', 'function'], result.execution);

  console.log('\n  Disharmony score:', iceAnalysis.disharmony.toFixed(3));
  console.log('  Severity:', iceAnalysis.severity.toUpperCase());

  if (iceAnalysis.severity === 'excellent') {
    console.log('\n  ✅ HARMONIOUS - Function name matches implementation!');
  }
} catch (error) {
  console.error('Error:', (error as Error).message);
}

// Example 3: Using coordinates directly
console.log('\n' + '='.repeat(60));
console.log('\n3. WORKING WITH SEMANTIC COORDINATES\n');

const pureWisdom = Coordinates.wisdom();
const purePower = Coordinates.power();

console.log('Pure Wisdom (get, read, calculate):', pureWisdom.toString());
console.log('Pure Power (create, delete, modify):', purePower.toString());
console.log('\nDistance between them:', pureWisdom.distanceTo(purePower).toFixed(3));
console.log('(Large distance = semantically opposite)\n');

// Example 4: Analyzing text semantically
console.log('='.repeat(60));
console.log('\n4. SEMANTIC TEXT ANALYSIS\n');

const textExamples = [
  'validate_user_input_and_check_permissions',
  'create_new_database_record',
  'get_user_profile_data',
  'send_notification_to_subscribers',
];

for (const text of textExamples) {
  const coords = engine.analyzeText(text);
  const dominant = coords.getDominantDimension();
  console.log(`${text}`);
  console.log(`  → ${dominant.toUpperCase()} dominant`, coords.toString());
}

console.log('\n' + '='.repeat(60));
console.log('\nVocabulary Statistics:');
const stats = engine.getVocabularyStats();
console.log(`  Total verbs: ${stats.totalVerbs}`);
console.log(`  Total compound patterns: ${stats.totalCompoundPatterns}`);
console.log(`  Verbs per dimension:`);
console.log(`    - Love: ${stats.verbsPerDimension.love}`);
console.log(`    - Justice: ${stats.verbsPerDimension.justice}`);
console.log(`    - Power: ${stats.verbsPerDimension.power}`);
console.log(`    - Wisdom: ${stats.verbsPerDimension.wisdom}`);

console.log('\n' + '='.repeat(60));
console.log('\nDisharmony Thresholds:');
console.log(`  Excellent: ${DISHARMONY_THRESHOLDS.EXCELLENT} (code says what it means)`);
console.log(`  Low: ${DISHARMONY_THRESHOLDS.LOW} (minor drift)`);
console.log(`  Medium: ${DISHARMONY_THRESHOLDS.MEDIUM} (concerning)`);
console.log(`  High: ${DISHARMONY_THRESHOLDS.HIGH} (critical)`);

console.log('\n' + '='.repeat(60));
console.log('\n✨ JavaScript Code Harmonizer Ready!\n');
