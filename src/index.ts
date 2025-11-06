/**
 * JavaScript Code Harmonizer
 *
 * A TypeScript-based code harmonizer using LJPW (Levenshtein-Jensen-Perceptual-Weighting)
 * similarity metrics for code comparison and analysis.
 */

// Export core LJPW functionality
export {
  levenshteinDistance,
  levenshteinSimilarity,
  calculateCharFrequency,
  klDivergence,
  jensenShannonDivergence,
  jensenShannonSimilarity,
  ljpwSimilarity,
  ljpwSimilarityWeighted,
  DEFAULT_WEIGHTS,
  type PerceptualWeights,
} from './core/ljpw';

// Version info
export const VERSION = '0.1.0';
