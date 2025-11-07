/**
 * JavaScript Code Harmonizer
 *
 * A TypeScript-based code harmonizer built on the LJPW (Love-Justice-Power-Wisdom)
 * semantic framework for intelligent code comparison and semantic bug detection.
 */

// Core LJPW similarity metrics
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

// Semantic coordinate system
export {
  Coordinates,
  type SemanticResult,
  type ICEAnalysisResult,
  type FunctionAnalysis,
} from './core/coordinates';

// LJPW Mathematical Baselines
export {
  LJPWBaselines,
  NUMERICAL_EQUIVALENTS,
  REFERENCE_POINTS,
  COUPLING_MATRIX,
  type AbsoluteCoordinates,
  type EffectiveDimensions,
  type LJPWDiagnostic,
} from './core/ljpw-baselines';

// Vocabulary and semantic engine
export { VocabularyManager, PROGRAMMING_VERBS, COMPOUND_PATTERNS, type Dimension } from './core/vocabulary';
export {
  SemanticEngine,
  SemanticAnalyzer,
  ICEAnalyzer,
  DISHARMONY_THRESHOLDS,
} from './core/engine';

// AST parser
export {
  ASTSemanticParser,
  type FunctionMetadata,
  type ParseResult,
  type ExecutionMapping,
} from './parser/ast-parser';

// Semantic naming
export {
  SemanticNamingEngine,
  type ActionVerb,
  type NamingSuggestion,
} from './naming/semantic-naming';

// CLI and analysis
export {
  CodeHarmonizer,
  type HarmonizerConfig,
  type FileAnalysisResult,
  type FunctionAnalysisResult,
} from './cli/harmonizer';

// Version info
export const VERSION = '0.2.0';
