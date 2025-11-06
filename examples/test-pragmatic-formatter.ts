/**
 * Test pragmatic formatter output
 */

import { PragmaticFormatter } from '../src/output/pragmatic-formatter';

// Mock function data
const mockFunc = {
  name: 'getUserData',
  line: 42,
  disharmony: 0.849,
  severity: 'HIGH',
  intent: {
    dominant: 'wisdom',
  },
  execution: {
    dominant: 'power',
  },
  suggestions: [
    { name: 'deleteUserData', similarity: 0.85 },
    { name: 'removeUserData', similarity: 0.82 },
    { name: 'destroyUserData', similarity: 0.78 },
  ],
};

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('         Testing Pragmatic Formatter');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

console.log('TEST 1: Format Function Issue');
console.log('─'.repeat(60));
const output = PragmaticFormatter.formatFunctionIssue(mockFunc, 'src/user.js', {
  showSuggestions: true,
  minConfidence: 0.7,
});
console.log(output);

console.log('TEST 2: Format File Summary (with issues)');
console.log('─'.repeat(60));
const mockFileResult: any = {
  relativePath: 'src/auth.js',
  status: 'success',
  functions: [
    {
      name: 'validateUser',
      line: 10,
      disharmony: 0.9,
      severity: 'HIGH',
    },
    {
      name: 'checkPermission',
      line: 25,
      disharmony: 0.6,
      severity: 'MEDIUM',
    },
    {
      name: 'loadUser',
      line: 40,
      disharmony: 0.4,
      severity: 'LOW',
    },
    {
      name: 'getUser',
      line: 55,
      disharmony: 0.2,
      severity: 'EXCELLENT',
    },
  ],
};

const fileSummary = PragmaticFormatter.formatFileSummary(mockFileResult);
console.log(fileSummary);

console.log('TEST 3: Format File Summary (no issues)');
console.log('─'.repeat(60));
const cleanFileResult: any = {
  relativePath: 'src/utils.js',
  status: 'success',
  functions: [
    {
      name: 'formatDate',
      line: 5,
      disharmony: 0.1,
      severity: 'EXCELLENT',
    },
    {
      name: 'validateEmail',
      line: 15,
      disharmony: 0.2,
      severity: 'EXCELLENT',
    },
  ],
};

const cleanSummary = PragmaticFormatter.formatFileSummary(cleanFileResult);
console.log(cleanSummary);

console.log('TEST 4: Format Project Summary');
console.log('─'.repeat(60));
const mockResults: any[] = [mockFileResult, cleanFileResult];
const projectSummary = PragmaticFormatter.formatProjectSummary(mockResults);
console.log(projectSummary);

console.log('═══════════════════════════════════════════════════════════');
console.log('         All Pragmatic Formatter Tests Complete!');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
