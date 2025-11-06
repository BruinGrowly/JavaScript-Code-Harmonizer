/**
 * Semantic Analysis Engine
 *
 * The DIVE (Divine Invitation Verification Engine) analyzes code semantics
 * using the LJPW framework and ICE (Intent-Context-Execution) methodology.
 */

import { Coordinates, ICEAnalysisResult, SemanticResult } from './coordinates';
import { VocabularyManager } from './vocabulary';

/**
 * Severity thresholds for disharmony scores
 */
export const DISHARMONY_THRESHOLDS = {
  EXCELLENT: 0.3, // Code says what it means
  LOW: 0.5, // Minor drift
  MEDIUM: 0.8, // Concerning
  HIGH: 1.2, // Critical
  CRITICAL: Infinity, // Beyond high
} as const;

/**
 * SemanticAnalyzer - Analyzes concept clusters and calculates semantic metrics
 */
export class SemanticAnalyzer {
  /**
   * Calculate the centroid (average) of a set of coordinates
   */
  calculateCentroid(coordinatesList: Coordinates[]): Coordinates {
    if (coordinatesList.length === 0) {
      return Coordinates.anchor();
    }

    const sums = {
      love: 0,
      justice: 0,
      power: 0,
      wisdom: 0,
    };

    for (const coords of coordinatesList) {
      sums.love += coords.love;
      sums.justice += coords.justice;
      sums.power += coords.power;
      sums.wisdom += coords.wisdom;
    }

    const count = coordinatesList.length;
    return new Coordinates(sums.love / count, sums.justice / count, sums.power / count, sums.wisdom / count);
  }

  /**
   * Calculate harmonic cohesion (how tightly clustered concepts are)
   * Returns 0 (loose cluster) to 1 (tight cluster)
   */
  calculateHarmonicCohesion(coordinatesList: Coordinates[], centroid: Coordinates): number {
    if (coordinatesList.length === 0) return 1.0;

    const distances = coordinatesList.map((coords) => coords.distanceTo(centroid));
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Maximum possible distance in normalized 4D space is ~1.732 (sqrt(3))
    // Cohesion is inverse of average distance
    return Math.max(0, 1 - avgDistance / 1.732);
  }

  /**
   * Analyze a cluster of concepts and return semantic result
   */
  analyzeConceptCluster(concepts: string[], vocabulary: VocabularyManager): SemanticResult {
    if (concepts.length === 0) {
      const defaultCoords = Coordinates.anchor();
      return {
        coordinates: defaultCoords,
        clarity: 0,
        dominantDimension: 'wisdom',
        distanceFromAnchor: defaultCoords.distanceFromAnchor(),
        conceptsAnalyzed: [],
      };
    }

    // Analyze each concept
    const coordinatesList = concepts.map((concept) => vocabulary.analyzeText(concept));

    // Calculate centroid
    const centroid = this.calculateCentroid(coordinatesList);

    return {
      coordinates: centroid,
      clarity: centroid.getSemanticClarity(),
      dominantDimension: centroid.getDominantDimension(),
      distanceFromAnchor: centroid.distanceFromAnchor(),
      conceptsAnalyzed: concepts,
    };
  }
}

/**
 * ICEAnalyzer - Performs Intent-Context-Execution analysis
 *
 * The core framework that detects semantic bugs by comparing:
 * - Intent: What the function name/docs promise
 * - Context: The environment and constraints
 * - Execution: What the code actually does
 */
export class ICEAnalyzer {
  private analyzer: SemanticAnalyzer;

  constructor() {
    this.analyzer = new SemanticAnalyzer();
  }

  /**
   * Perform ICE analysis on a function
   *
   * @param intentConcepts - Words from function name and docstring
   * @param contextConcepts - Environmental context (filename, domain, etc.)
   * @param executionConcepts - Semantic concepts extracted from code body
   * @param vocabulary - Vocabulary manager for text analysis
   */
  performICEAnalysis(
    intentConcepts: string[],
    contextConcepts: string[],
    executionConcepts: string[],
    vocabulary: VocabularyManager
  ): ICEAnalysisResult {
    // Analyze each component
    const intentResult = this.analyzer.analyzeConceptCluster(intentConcepts, vocabulary);
    const contextResult = this.analyzer.analyzeConceptCluster(contextConcepts, vocabulary);
    const executionResult = this.analyzer.analyzeConceptCluster(executionConcepts, vocabulary);

    const intent = intentResult.coordinates;
    const context = contextResult.coordinates;
    const execution = executionResult.coordinates;

    // Calculate Intent-Execution distance (primary disharmony metric)
    const intentExecutionDistance = intent.distanceTo(execution);

    // Calculate ICE coherence (how well all three align)
    const iceCoherence = this.calculateICECoherence(intent, context, execution);

    // Calculate ICE balance (proximity to anchor point)
    const iceBalance = this.calculateICEBalance(intent, context, execution);

    // Calculate benevolence score (measure of positive intent)
    const benevolenceScore = this.calculateBenevolenceScore(intent, execution);

    // Determine severity
    const severity = this.calculateSeverity(intentExecutionDistance);

    return {
      intent,
      context,
      execution,
      intentExecutionDistance,
      iceCoherence,
      iceBalance,
      benevolenceScore,
      disharmony: intentExecutionDistance,
      severity,
    };
  }

  /**
   * Calculate ICE coherence - how well Intent, Context, and Execution align
   * Returns 0 (completely misaligned) to 1 (perfectly aligned)
   */
  private calculateICECoherence(
    intent: Coordinates,
    context: Coordinates,
    execution: Coordinates
  ): number {
    // Calculate pairwise distances
    const intentContextDist = intent.distanceTo(context);
    const intentExecutionDist = intent.distanceTo(execution);
    const contextExecutionDist = context.distanceTo(execution);

    // Average distance
    const avgDistance = (intentContextDist + intentExecutionDist + contextExecutionDist) / 3;

    // Coherence is inverse of average distance
    return Math.max(0, 1 - avgDistance / 1.732);
  }

  /**
   * Calculate ICE balance - how close the ICE triangle is to the anchor point
   * Returns 0 (far from anchor) to 1 (at anchor)
   */
  private calculateICEBalance(
    intent: Coordinates,
    context: Coordinates,
    execution: Coordinates
  ): number {
    const anchor = Coordinates.anchor();

    // Calculate average distance from anchor
    const avgDistanceFromAnchor =
      (intent.distanceFromAnchor() + context.distanceFromAnchor() + execution.distanceFromAnchor()) / 3;

    // Balance is inverse of average distance
    return Math.max(0, 1 - avgDistanceFromAnchor / 1.732);
  }

  /**
   * Calculate benevolence score - measure of constructive vs destructive intent
   * Returns 0 (destructive) to 1 (constructive)
   */
  private calculateBenevolenceScore(intent: Coordinates, execution: Coordinates): number {
    // Benevolence favors Love and Wisdom, neutral on Justice, cautious on Power
    const intentScore = intent.love * 0.4 + intent.wisdom * 0.4 + intent.justice * 0.15 + intent.power * 0.05;
    const executionScore =
      execution.love * 0.4 + execution.wisdom * 0.4 + execution.justice * 0.15 + execution.power * 0.05;

    return (intentScore + executionScore) / 2;
  }

  /**
   * Determine severity level based on disharmony score
   */
  private calculateSeverity(disharmony: number): ICEAnalysisResult['severity'] {
    if (disharmony <= DISHARMONY_THRESHOLDS.EXCELLENT) return 'excellent';
    if (disharmony <= DISHARMONY_THRESHOLDS.LOW) return 'low';
    if (disharmony <= DISHARMONY_THRESHOLDS.MEDIUM) return 'medium';
    if (disharmony <= DISHARMONY_THRESHOLDS.HIGH) return 'high';
    return 'critical';
  }
}

/**
 * SemanticEngine - Main facade for all semantic analysis operations
 */
export class SemanticEngine {
  private vocabulary: VocabularyManager;
  private semanticAnalyzer: SemanticAnalyzer;
  private iceAnalyzer: ICEAnalyzer;

  /**
   * The Anchor Point - represents perfect logical harmony (1,1,1,1)
   */
  readonly ANCHOR_POINT = Coordinates.anchor();

  constructor(customVocabulary?: Record<string, any>) {
    this.vocabulary = new VocabularyManager(customVocabulary);
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.iceAnalyzer = new ICEAnalyzer();
  }

  /**
   * Perform ICE analysis (main analysis method)
   */
  performICEAnalysis(
    intentConcepts: string[],
    contextConcepts: string[],
    executionConcepts: string[]
  ): ICEAnalysisResult {
    return this.iceAnalyzer.performICEAnalysis(
      intentConcepts,
      contextConcepts,
      executionConcepts,
      this.vocabulary
    );
  }

  /**
   * Analyze arbitrary text and return coordinates
   */
  analyzeText(text: string): Coordinates {
    return this.vocabulary.analyzeText(text);
  }

  /**
   * Analyze a concept cluster
   */
  analyzeConceptCluster(concepts: string[]): SemanticResult {
    return this.semanticAnalyzer.analyzeConceptCluster(concepts, this.vocabulary);
  }

  /**
   * Get the vocabulary manager
   */
  getVocabulary(): VocabularyManager {
    return this.vocabulary;
  }

  /**
   * Calculate semantic similarity between two text strings
   * Returns 0 (completely different) to 1 (identical meaning)
   */
  calculateSemanticSimilarity(text1: string, text2: string): number {
    const coords1 = this.analyzeText(text1);
    const coords2 = this.analyzeText(text2);

    return coords1.cosineSimilarity(coords2);
  }

  /**
   * Determine if a function name matches its implementation
   * Returns true if harmonious, false if disharmonious
   */
  isHarmonious(
    functionName: string,
    implementationConcepts: string[],
    threshold: number = DISHARMONY_THRESHOLDS.EXCELLENT
  ): boolean {
    const intent = this.analyzeText(functionName);
    const execution = this.semanticAnalyzer.analyzeConceptCluster(
      implementationConcepts,
      this.vocabulary
    );

    const disharmony = intent.distanceTo(execution.coordinates);
    return disharmony <= threshold;
  }

  /**
   * Get disharmony threshold for a severity level
   */
  getThreshold(severity: 'excellent' | 'low' | 'medium' | 'high'): number {
    return DISHARMONY_THRESHOLDS[severity.toUpperCase() as keyof typeof DISHARMONY_THRESHOLDS];
  }

  /**
   * Get statistics about the vocabulary
   */
  getVocabularyStats() {
    return this.vocabulary.getVocabularyStats();
  }
}
