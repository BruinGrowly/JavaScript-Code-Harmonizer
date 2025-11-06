/**
 * Utility helper functions for code harmonization
 */

/**
 * Normalize whitespace in code string
 * Reduces multiple spaces/tabs to single space, normalizes line endings
 *
 * @param code - Code string to normalize
 * @returns Normalized code string
 */
export function normalizeWhitespace(code: string): string {
  return code
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ') // Convert tabs to spaces
    .replace(/ +/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Remove comments from JavaScript/TypeScript code (simple version)
 * Note: This is a basic implementation, may not handle all edge cases
 *
 * @param code - Code string
 * @returns Code with comments removed
 */
export function removeComments(code: string): string {
  // Remove single-line comments
  let result = code.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  return result;
}

/**
 * Extract function names from code (simple regex-based)
 * Note: This is a basic implementation, use AST parsing for production
 *
 * @param code - Code string
 * @returns Array of function names
 */
export function extractFunctionNames(code: string): string[] {
  const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const arrowFunctionPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g;

  const names: string[] = [];

  let match;
  while ((match = functionPattern.exec(code)) !== null) {
    names.push(match[1]);
  }

  while ((match = arrowFunctionPattern.exec(code)) !== null) {
    names.push(match[1]);
  }

  return names;
}

/**
 * Calculate percentage difference between two numbers
 *
 * @param a - First number
 * @param b - Second number
 * @returns Percentage difference (0-100)
 */
export function percentageDifference(a: number, b: number): number {
  if (a === b) return 0;
  if (a === 0 && b === 0) return 0;

  const max = Math.max(Math.abs(a), Math.abs(b));
  if (max === 0) return 0;

  return (Math.abs(a - b) / max) * 100;
}

/**
 * Clamp a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Check if a string is valid JavaScript identifier
 *
 * @param str - String to check
 * @returns True if valid identifier
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}

/**
 * Split code into lines and return non-empty lines
 *
 * @param code - Code string
 * @returns Array of non-empty lines
 */
export function getNonEmptyLines(code: string): string[] {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
