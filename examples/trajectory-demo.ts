/**
 * Demonstration of Semantic Trajectory Maps
 * Shows how to visualize semantic drift in 4D LJPW space
 */

import { TrajectoryMapGenerator } from '../src/visualization/trajectory-maps';
import { Coordinates } from '../src/core/coordinates';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║    SEMANTIC TRAJECTORY MAPS DEMONSTRATION                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Example 1: Severe drift - validate function that actually deletes
console.log('EXAMPLE 1: Severe Semantic Drift\n');

const validateIntent = new Coordinates(0.0, 1.0, 0.0, 0.0); // Pure Justice
const deleteExecution = new Coordinates(0.0, 0.0, 1.0, 0.0); // Pure Power

const map1 = TrajectoryMapGenerator.generateASCIIMap(
  validateIntent,
  deleteExecution,
  'validateUser',
  { showGrid: true, colorize: true }
);

console.log(map1);
console.log('\n' + '='.repeat(60) + '\n');

// Example 2: Moderate drift - get function that also updates
console.log('EXAMPLE 2: Moderate Semantic Drift\n');

const getIntent = new Coordinates(0.1, 0.1, 0.1, 0.7); // Mostly Wisdom
const getUpdateExecution = new Coordinates(0.1, 0.2, 0.4, 0.3); // Mixed Power/Wisdom

const map2 = TrajectoryMapGenerator.generateASCIIMap(
  getIntent,
  getUpdateExecution,
  'getUserData',
  { showGrid: true, colorize: true }
);

console.log(map2);
console.log('\n' + '='.repeat(60) + '\n');

// Example 3: Well-aligned - calculate function that calculates
console.log('EXAMPLE 3: Well-Aligned (Minimal Drift)\n');

const calculateIntent = new Coordinates(0.05, 0.15, 0.1, 0.7); // Mostly Wisdom
const calculateExecution = new Coordinates(0.1, 0.1, 0.05, 0.75); // Also mostly Wisdom

const map3 = TrajectoryMapGenerator.generateASCIIMap(
  calculateIntent,
  calculateExecution,
  'calculateDiscount',
  { showGrid: true, colorize: true }
);

console.log(map3);
console.log('\n' + '='.repeat(60) + '\n');

console.log('✓ Demonstration complete!\n');
console.log('Key Insights:');
console.log('  • 2D projections show trajectory in different planes');
console.log('  • "I" marks intent (what name promises)');
console.log('  • "E" marks execution (what code does)');
console.log('  • "*" shows the semantic drift path');
console.log('  • Primary drift dimension indicates biggest mismatch\n');
