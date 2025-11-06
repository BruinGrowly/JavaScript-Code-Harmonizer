/**
 * Core semantic coordinate system for LJPW framework
 *
 * Represents points in 4-dimensional semantic space where:
 * - Love (L): Connection, relationships, communication
 * - Justice (J): Correctness, validation, truth
 * - Power (P): Action, execution, transformation
 * - Wisdom (W): Knowledge, information, understanding
 */

/**
 * Immutable 4D semantic vector in LJPW space
 * All values are normalized to [0,1] range and sum to 1.0
 */
export class Coordinates {
  readonly love: number;
  readonly justice: number;
  readonly power: number;
  readonly wisdom: number;

  constructor(love: number, justice: number, power: number, wisdom: number) {
    // Validate inputs
    if (love < 0 || justice < 0 || power < 0 || wisdom < 0) {
      throw new Error('All coordinate values must be non-negative');
    }

    // Normalize to sum to 1.0
    const total = love + justice + power + wisdom;
    if (total === 0) {
      // If all zeros, distribute evenly
      this.love = 0.25;
      this.justice = 0.25;
      this.power = 0.25;
      this.wisdom = 0.25;
    } else {
      this.love = love / total;
      this.justice = justice / total;
      this.power = power / total;
      this.wisdom = wisdom / total;
    }
  }

  /**
   * Create coordinates from an object
   */
  static from(obj: {
    love: number;
    justice: number;
    power: number;
    wisdom: number;
  }): Coordinates {
    return new Coordinates(obj.love, obj.justice, obj.power, obj.wisdom);
  }

  /**
   * Create pure Love coordinates (1, 0, 0, 0)
   */
  static love(): Coordinates {
    return new Coordinates(1, 0, 0, 0);
  }

  /**
   * Create pure Justice coordinates (0, 1, 0, 0)
   */
  static justice(): Coordinates {
    return new Coordinates(0, 1, 0, 0);
  }

  /**
   * Create pure Power coordinates (0, 0, 1, 0)
   */
  static power(): Coordinates {
    return new Coordinates(0, 0, 1, 0);
  }

  /**
   * Create pure Wisdom coordinates (0, 0, 0, 1)
   */
  static wisdom(): Coordinates {
    return new Coordinates(0, 0, 0, 1);
  }

  /**
   * Create the Anchor Point (1, 1, 1, 1) - perfect harmony
   */
  static anchor(): Coordinates {
    return new Coordinates(1, 1, 1, 1);
  }

  /**
   * Convert to array [L, J, P, W]
   */
  toArray(): [number, number, number, number] {
    return [this.love, this.justice, this.power, this.wisdom];
  }

  /**
   * Convert to object
   */
  toObject(): { love: number; justice: number; power: number; wisdom: number } {
    return {
      love: this.love,
      justice: this.justice,
      power: this.power,
      wisdom: this.wisdom,
    };
  }

  /**
   * Calculate Euclidean distance to another point in 4D space
   */
  distanceTo(other: Coordinates): number {
    const dl = this.love - other.love;
    const dj = this.justice - other.justice;
    const dp = this.power - other.power;
    const dw = this.wisdom - other.wisdom;

    return Math.sqrt(dl * dl + dj * dj + dp * dp + dw * dw);
  }

  /**
   * Calculate distance from the Anchor Point (perfect harmony)
   */
  distanceFromAnchor(): number {
    return this.distanceTo(Coordinates.anchor());
  }

  /**
   * Calculate cosine similarity with another coordinate
   * Returns value from -1 (opposite) to 1 (identical)
   */
  cosineSimilarity(other: Coordinates): number {
    const dotProduct =
      this.love * other.love +
      this.justice * other.justice +
      this.power * other.power +
      this.wisdom * other.wisdom;

    const mag1 = Math.sqrt(
      this.love ** 2 + this.justice ** 2 + this.power ** 2 + this.wisdom ** 2
    );
    const mag2 = Math.sqrt(
      other.love ** 2 + other.justice ** 2 + other.power ** 2 + other.wisdom ** 2
    );

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
  }

  /**
   * Get the dominant dimension (which has the highest value)
   */
  getDominantDimension(): 'love' | 'justice' | 'power' | 'wisdom' {
    const dims = [
      { name: 'love' as const, value: this.love },
      { name: 'justice' as const, value: this.justice },
      { name: 'power' as const, value: this.power },
      { name: 'wisdom' as const, value: this.wisdom },
    ];

    return dims.reduce((max, dim) => (dim.value > max.value ? dim : max)).name;
  }

  /**
   * Calculate semantic clarity (how focused the coordinates are)
   * Returns 0 (evenly distributed) to 1 (pure single dimension)
   */
  getSemanticClarity(): number {
    const values = [this.love, this.justice, this.power, this.wisdom];
    const mean = values.reduce((sum, v) => sum + v, 0) / 4;

    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / 4;
    const stdDev = Math.sqrt(variance);

    // Clarity is directly proportional to standard deviation
    // Max std dev for 4 normalized values summing to 1 is sqrt(3)/4 ≈ 0.433
    const maxStdDev = Math.sqrt(3) / 4;
    return Math.min(1, stdDev / maxStdDev);
  }

  /**
   * String representation
   */
  toString(): string {
    return `Coordinates(L=${this.love.toFixed(2)}, J=${this.justice.toFixed(
      2
    )}, P=${this.power.toFixed(2)}, W=${this.wisdom.toFixed(2)})`;
  }

  /**
   * Check equality (within epsilon for floating point)
   */
  equals(other: Coordinates, epsilon: number = 0.0001): boolean {
    return (
      Math.abs(this.love - other.love) < epsilon &&
      Math.abs(this.justice - other.justice) < epsilon &&
      Math.abs(this.power - other.power) < epsilon &&
      Math.abs(this.wisdom - other.wisdom) < epsilon
    );
  }
}

/**
 * Semantic analysis result
 */
export interface SemanticResult {
  coordinates: Coordinates;
  clarity: number; // 0-1, how focused
  dominantDimension: 'love' | 'justice' | 'power' | 'wisdom';
  distanceFromAnchor: number;
  conceptsAnalyzed: string[];
}

/**
 * ICE (Intent-Context-Execution) analysis result
 */
export interface ICEAnalysisResult {
  intent: Coordinates;
  context: Coordinates;
  execution: Coordinates;
  intentExecutionDistance: number;
  iceCoherence: number; // 0-1
  iceBalance: number; // proximity to anchor
  benevolenceScore: number;
  disharmony: number; // same as intentExecutionDistance
  severity: 'excellent' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Function analysis result
 */
export interface FunctionAnalysis {
  name: string;
  ice: ICEAnalysisResult;
  semanticTrajectory: {
    love: { intent: number; execution: number; delta: number };
    justice: { intent: number; execution: number; delta: number };
    power: { intent: number; execution: number; delta: number };
    wisdom: { intent: number; execution: number; delta: number };
  };
  primaryMisalignment?: 'love' | 'justice' | 'power' | 'wisdom';
  suggestions?: {
    names: Array<{ name: string; similarity: number }>;
    refactoring?: string;
  };
}
