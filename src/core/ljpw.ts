/**
 * LJPW (Levenshtein-Jensen-Perceptual-Weighting) Similarity Metric
 *
 * This module implements a sophisticated similarity metric for code comparison
 * that combines:
 * - Levenshtein distance for edit-based similarity
 * - Jensen-Shannon divergence for statistical similarity
 * - Perceptual weighting for domain-specific adjustments
 */

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming for optimal edit distance calculation
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns The minimum number of edits (insertions, deletions, substitutions) needed
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;

  // Create a matrix to store distances
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[len1][len2];
}

/**
 * Calculate normalized Levenshtein similarity (0 to 1)
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns Similarity score from 0 (completely different) to 1 (identical)
 */
export function levenshteinSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 && s2.length === 0) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);

  return 1.0 - distance / maxLen;
}

/**
 * Calculate character frequency distribution for a string
 * Used in Jensen-Shannon divergence calculation
 *
 * @param s - Input string
 * @returns Map of character to frequency (probability)
 */
export function calculateCharFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();

  if (s.length === 0) return freq;

  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  // Normalize to probabilities
  for (const [char, count] of freq.entries()) {
    freq.set(char, count / s.length);
  }

  return freq;
}

/**
 * Calculate Kullback-Leibler divergence between two probability distributions
 *
 * @param p - First probability distribution
 * @param q - Second probability distribution
 * @returns KL divergence value
 */
export function klDivergence(
  p: Map<string, number>,
  q: Map<string, number>
): number {
  let divergence = 0;

  // Get all unique characters
  const allChars = new Set([...p.keys(), ...q.keys()]);

  for (const char of allChars) {
    const pProb = p.get(char) || 0;
    const qProb = q.get(char) || 1e-10; // Small epsilon to avoid log(0)

    if (pProb > 0) {
      divergence += pProb * Math.log(pProb / qProb);
    }
  }

  return divergence;
}

/**
 * Calculate Jensen-Shannon divergence between two strings
 * A symmetrized and smoothed version of KL divergence
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns JS divergence value (0 means identical distributions)
 */
export function jensenShannonDivergence(s1: string, s2: string): number {
  const p = calculateCharFrequency(s1);
  const q = calculateCharFrequency(s2);

  // Calculate average distribution M = (P + Q) / 2
  const m = new Map<string, number>();
  const allChars = new Set([...p.keys(), ...q.keys()]);

  for (const char of allChars) {
    const pProb = p.get(char) || 0;
    const qProb = q.get(char) || 0;
    m.set(char, (pProb + qProb) / 2);
  }

  // JS divergence = (KL(P||M) + KL(Q||M)) / 2
  const jsd = (klDivergence(p, m) + klDivergence(q, m)) / 2;

  return jsd;
}

/**
 * Calculate Jensen-Shannon similarity (0 to 1)
 * Converts divergence to similarity measure
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @returns Similarity score from 0 to 1
 */
export function jensenShannonSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 && s2.length === 0) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const jsd = jensenShannonDivergence(s1, s2);

  // Convert divergence to similarity: similarity = 1 / (1 + divergence)
  return 1.0 / (1.0 + jsd);
}

/**
 * Perceptual weighting factors for different code elements
 * Higher weights mean more important for similarity calculation
 */
export interface PerceptualWeights {
  identifier: number;        // Variable/function names
  keyword: number;           // Language keywords
  operator: number;          // Operators
  literal: number;           // String/number literals
  whitespace: number;        // Whitespace and formatting
  comment: number;           // Comments
  structure: number;         // Structural elements (braces, parentheses)
}

/**
 * Default perceptual weights for code comparison
 */
export const DEFAULT_WEIGHTS: PerceptualWeights = {
  identifier: 1.0,
  keyword: 0.9,
  operator: 0.7,
  literal: 0.5,
  whitespace: 0.1,
  comment: 0.3,
  structure: 0.8,
};

/**
 * Calculate LJPW similarity between two strings
 * Combines Levenshtein and Jensen-Shannon metrics with configurable weighting
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @param levenshteinWeight - Weight for Levenshtein component (default: 0.6)
 * @param jensenShannonWeight - Weight for Jensen-Shannon component (default: 0.4)
 * @returns Combined similarity score from 0 to 1
 */
export function ljpwSimilarity(
  s1: string,
  s2: string,
  levenshteinWeight: number = 0.6,
  jensenShannonWeight: number = 0.4
): number {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 && s2.length === 0) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Validate weights
  const totalWeight = levenshteinWeight + jensenShannonWeight;
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(
      `Weights must sum to 1.0, got ${totalWeight} (L: ${levenshteinWeight}, JS: ${jensenShannonWeight})`
    );
  }

  const levSim = levenshteinSimilarity(s1, s2);
  const jsSim = jensenShannonSimilarity(s1, s2);

  return levenshteinWeight * levSim + jensenShannonWeight * jsSim;
}

/**
 * Calculate LJPW similarity with perceptual weighting
 * This version will be extended to handle tokenized code with different weights
 *
 * @param s1 - First string
 * @param s2 - Second string
 * @param weights - Perceptual weights (currently unused, for future token-based comparison)
 * @returns Similarity score from 0 to 1
 */
export function ljpwSimilarityWeighted(
  s1: string,
  s2: string,
  weights: PerceptualWeights = DEFAULT_WEIGHTS
): number {
  // For now, use standard LJPW similarity
  // This will be extended when we add tokenization support
  return ljpwSimilarity(s1, s2);
}
