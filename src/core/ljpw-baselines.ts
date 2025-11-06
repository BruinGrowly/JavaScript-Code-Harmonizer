/**
 * LJPW Mathematical Baselines
 *
 * Implements the validated mathematical foundations from LJPW-MATHEMATICAL-BASELINES.md
 * Version: 1.0
 *
 * Provides:
 * - Numerical Equivalents (fundamental constants)
 * - Natural Equilibrium and Anchor Point
 * - Coupling Coefficient Matrix
 * - Mixing Algorithms (harmonic, geometric, coupling-aware)
 * - Distance metrics and diagnostics
 *
 * NOTE: This module uses ABSOLUTE coordinates (not normalized to sum=1.0)
 * This is different from the Coordinates class which normalizes values.
 */

/**
 * Absolute LJPW coordinates (not normalized)
 * Used for mathematical baselines calculations
 */
export interface AbsoluteCoordinates {
  love: number;
  justice: number;
  power: number;
  wisdom: number;
}

/**
 * Numerical Equivalents - Fundamental mathematical constants for LJPW dimensions
 *
 * These are derived from information theory and natural phenomena:
 * - Love (φ⁻¹): Golden ratio inverse - optimal resource distribution
 * - Justice (√2-1): Pythagorean ratio - constraint satisfaction
 * - Power (e-2): Exponential base - channel capacity
 * - Wisdom (ln 2): Natural log of 2 - information unit
 */
export const NUMERICAL_EQUIVALENTS = {
  /**
   * Love: Golden Ratio Inverse
   * φ⁻¹ = (√5 - 1) / 2 ≈ 0.618034
   */
  LOVE: 0.618034,

  /**
   * Justice: Pythagorean Ratio
   * √2 - 1 ≈ 0.414214
   */
  JUSTICE: 0.414214,

  /**
   * Power: Exponential Base
   * e - 2 ≈ 0.718282
   */
  POWER: 0.718282,

  /**
   * Wisdom: Information Unit
   * ln(2) ≈ 0.693147
   */
  WISDOM: 0.693147,
};

/**
 * Reference Points in LJPW space (absolute coordinates)
 */
export const REFERENCE_POINTS = {
  /**
   * Anchor Point: Divine Perfection
   * Perfect, transcendent ideal (asymptotic goal)
   */
  ANCHOR_POINT: {
    love: 1.0,
    justice: 1.0,
    power: 1.0,
    wisdom: 1.0,
  } as AbsoluteCoordinates,

  /**
   * Natural Equilibrium: Physical Optimum
   * Physically achievable optimal balance point derived from fundamental constants
   */
  NATURAL_EQUILIBRIUM: {
    love: NUMERICAL_EQUIVALENTS.LOVE,
    justice: NUMERICAL_EQUIVALENTS.JUSTICE,
    power: NUMERICAL_EQUIVALENTS.POWER,
    wisdom: NUMERICAL_EQUIVALENTS.WISDOM,
  } as AbsoluteCoordinates,
};

/**
 * Coupling Coefficient Matrix
 *
 * Defines how LJPW dimensions interact and amplify each other.
 * κᵢⱼ represents the coupling strength from dimension i to dimension j.
 *
 * Key insights:
 * - Love acts as a force multiplier for all other dimensions
 * - κ_LJ = 1.4: Love amplifies Justice by 40%
 * - κ_LP = 1.3: Love amplifies Power by 30%
 * - κ_LW = 1.5: Love amplifies Wisdom by 50% (strongest coupling)
 */
export const COUPLING_MATRIX = {
  // Love row
  LL: 1.0,
  LJ: 1.4, // Love → Justice: +40%
  LP: 1.3, // Love → Power: +30%
  LW: 1.5, // Love → Wisdom: +50%

  // Justice row
  JL: 0.9,
  JJ: 1.0,
  JP: 0.7,
  JW: 1.2, // Justice → Wisdom: mutual reinforcement

  // Power row
  PL: 0.6,
  PJ: 0.8,
  PP: 1.0,
  PW: 0.5, // Power ↔ Wisdom: tension (efficiency vs. deliberation)

  // Wisdom row
  WL: 1.3,
  WJ: 1.1,
  WP: 1.0,
  WW: 1.0,
};

/**
 * Effective Dimensions interface
 */
export interface EffectiveDimensions {
  effective_L: number;
  effective_J: number;
  effective_P: number;
  effective_W: number;
}

/**
 * Full diagnostic result
 */
export interface LJPWDiagnostic {
  coordinates: {
    L: number;
    J: number;
    P: number;
    W: number;
  };
  effective_dimensions: EffectiveDimensions;
  distances: {
    from_anchor: number;
    from_natural_equilibrium: number;
  };
  metrics: {
    harmonic_mean: number;
    geometric_mean: number;
    coupling_aware_sum: number;
    harmony_index: number;
    composite_score: number;
  };
}

/**
 * LJPW Mathematical Baselines
 *
 * Provides validated algorithms and metrics for LJPW analysis
 */
export class LJPWBaselines {
  /**
   * Helper: Calculate Euclidean distance between two absolute coordinates
   */
  private static distance(
    a: AbsoluteCoordinates,
    b: AbsoluteCoordinates
  ): number {
    const dL = a.love - b.love;
    const dJ = a.justice - b.justice;
    const dP = a.power - b.power;
    const dW = a.wisdom - b.wisdom;
    return Math.sqrt(dL * dL + dJ * dJ + dP * dP + dW * dW);
  }

  /**
   * Calculate coupling-adjusted effective dimensions
   *
   * Love acts as a force multiplier:
   * - J_eff = J × (1 + 1.4×L)
   * - P_eff = P × (1 + 1.3×L)
   * - W_eff = W × (1 + 1.5×L)
   *
   * @param coords - LJPW absolute coordinates
   * @returns Effective dimensions accounting for coupling
   */
  static effectiveDimensions(coords: AbsoluteCoordinates): EffectiveDimensions {
    const L = coords.love;
    const J = coords.justice;
    const P = coords.power;
    const W = coords.wisdom;

    return {
      effective_L: L, // Love is the source, not amplified
      effective_J: J * (1 + COUPLING_MATRIX.LJ * L),
      effective_P: P * (1 + COUPLING_MATRIX.LP * L),
      effective_W: W * (1 + COUPLING_MATRIX.LW * L),
    };
  }

  /**
   * Harmonic Mean - Robustness (weakest link)
   *
   * System robustness is limited by the weakest dimension.
   * Use for: Fault tolerance, minimum guarantees
   *
   * Interpretation:
   * - Near 0: At least one dimension critically weak
   * - ≈ 0.5: All dimensions above 0.5 (competent)
   * - ≈ 0.7: All dimensions strong
   *
   * @param coords - LJPW absolute coordinates
   * @returns Harmonic mean (robustness score)
   */
  static harmonicMean(coords: AbsoluteCoordinates): number {
    const L = coords.love;
    const J = coords.justice;
    const P = coords.power;
    const W = coords.wisdom;

    // Guard against division by zero
    if (L <= 0 || J <= 0 || P <= 0 || W <= 0) {
      return 0.0;
    }

    return 4.0 / (1 / L + 1 / J + 1 / P + 1 / W);
  }

  /**
   * Geometric Mean - Effectiveness (multiplicative interaction)
   *
   * All dimensions needed proportionally.
   * Use for: Overall effectiveness, balanced performance
   *
   * Interpretation:
   * - < 0.5: System struggling in multiple areas
   * - ≈ 0.6: Functional but not optimal
   * - ≈ 0.8: High-performing system
   *
   * @param coords - LJPW absolute coordinates
   * @returns Geometric mean (effectiveness score)
   */
  static geometricMean(coords: AbsoluteCoordinates): number {
    const L = coords.love;
    const J = coords.justice;
    const P = coords.power;
    const W = coords.wisdom;

    return Math.pow(L * J * P * W, 0.25);
  }

  /**
   * Coupling-Aware Sum - Growth Potential
   *
   * Love-amplified weighted sum using effective dimensions.
   * Use for: Growth potential, scalability, future performance
   *
   * Interpretation:
   * - < 1.0: Limited growth potential
   * - ≈ 1.4: Good growth trajectory (coupling active)
   * - > 1.8: Exceptional growth potential
   *
   * Note: Can exceed 1.0 due to coupling amplification
   *
   * @param coords - LJPW absolute coordinates
   * @returns Coupling-aware sum (growth potential score)
   */
  static couplingAwareSum(coords: AbsoluteCoordinates): number {
    const L = coords.love;
    const eff = this.effectiveDimensions(coords);

    return (
      0.35 * L +
      0.25 * eff.effective_J +
      0.2 * eff.effective_P +
      0.2 * eff.effective_W
    );
  }

  /**
   * Harmony Index - Balance
   *
   * Inverse distance from Anchor Point.
   * Use for: Balance, alignment, proximity to ideal
   *
   * Interpretation:
   * - ≈ 0.33: Far from ideal (d ≈ 2.0)
   * - ≈ 0.50: Moderate alignment (d ≈ 1.0)
   * - ≈ 0.71: Strong alignment (d ≈ 0.4)
   *
   * @param coords - LJPW absolute coordinates
   * @returns Harmony index (balance score)
   */
  static harmonyIndex(coords: AbsoluteCoordinates): number {
    const d_anchor = this.distance(coords, REFERENCE_POINTS.ANCHOR_POINT);
    return 1.0 / (1.0 + d_anchor);
  }

  /**
   * Composite Score - Overall Performance
   *
   * Weighted combination of all four metrics:
   * - 35% Growth Potential (coupling-aware sum)
   * - 25% Effectiveness (geometric mean)
   * - 25% Robustness (harmonic mean)
   * - 15% Harmony (balance)
   *
   * Interpretation:
   * - < 0.8: System needs improvement
   * - ≈ 1.0: Solid, functional system
   * - > 1.2: High-performing, growth-oriented system
   *
   * @param coords - LJPW absolute coordinates
   * @returns Composite score (overall performance)
   */
  static compositeScore(coords: AbsoluteCoordinates): number {
    const growth = this.couplingAwareSum(coords);
    const effectiveness = this.geometricMean(coords);
    const robustness = this.harmonicMean(coords);
    const harmony = this.harmonyIndex(coords);

    return (
      0.35 * growth + 0.25 * effectiveness + 0.25 * robustness + 0.15 * harmony
    );
  }

  /**
   * Distance from Natural Equilibrium
   *
   * Euclidean distance from the physically optimal balance point.
   *
   * Interpretation:
   * - < 0.2: Near-optimal balance
   * - 0.2-0.5: Good but improvable
   * - 0.5-0.8: Moderate imbalance
   * - ≥ 0.8: Significant dysfunction
   *
   * @param coords - LJPW absolute coordinates
   * @returns Distance from Natural Equilibrium
   */
  static distanceFromNaturalEquilibrium(coords: AbsoluteCoordinates): number {
    return this.distance(coords, REFERENCE_POINTS.NATURAL_EQUILIBRIUM);
  }

  /**
   * Full Diagnostic Analysis
   *
   * Comprehensive analysis including all metrics and distances.
   *
   * @param coords - LJPW absolute coordinates
   * @returns Complete diagnostic report
   */
  static fullDiagnostic(coords: AbsoluteCoordinates): LJPWDiagnostic {
    return {
      coordinates: {
        L: coords.love,
        J: coords.justice,
        P: coords.power,
        W: coords.wisdom,
      },
      effective_dimensions: this.effectiveDimensions(coords),
      distances: {
        from_anchor: this.distance(coords, REFERENCE_POINTS.ANCHOR_POINT),
        from_natural_equilibrium: this.distanceFromNaturalEquilibrium(coords),
      },
      metrics: {
        harmonic_mean: this.harmonicMean(coords),
        geometric_mean: this.geometricMean(coords),
        coupling_aware_sum: this.couplingAwareSum(coords),
        harmony_index: this.harmonyIndex(coords),
        composite_score: this.compositeScore(coords),
      },
    };
  }

  /**
   * Get human-readable interpretation of composite score
   *
   * @param score - Composite score
   * @returns Interpretation string
   */
  static interpretCompositeScore(score: number): string {
    if (score < 0.5) return 'Critical - Multiple dimensions failing';
    if (score < 0.7) return 'Struggling - Functional but inefficient';
    if (score < 0.9) return 'Competent - Solid baseline performance';
    if (score < 1.1) return 'Strong - Above-average effectiveness';
    if (score < 1.3) return 'Excellent - High-performing, growth active';
    return 'Elite - Exceptional, Love multiplier engaged';
  }

  /**
   * Get human-readable interpretation of distance from Natural Equilibrium
   *
   * @param distance - Distance from NE
   * @returns Interpretation string
   */
  static interpretDistanceFromNE(distance: number): string {
    if (distance < 0.2) return 'Near-optimal balance';
    if (distance < 0.5) return 'Good but improvable';
    if (distance < 0.8) return 'Moderate imbalance';
    return 'Significant dysfunction';
  }
}
