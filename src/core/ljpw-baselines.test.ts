/**
 * Tests for LJPW Mathematical Baselines
 */

import {
  NUMERICAL_EQUIVALENTS,
  REFERENCE_POINTS,
  COUPLING_MATRIX,
  LJPWBaselines,
  AbsoluteCoordinates,
} from './ljpw-baselines';

describe('LJPW Mathematical Baselines', () => {
  describe('Numerical Equivalents', () => {
    test('Love (Golden Ratio Inverse) ≈ 0.618034', () => {
      expect(NUMERICAL_EQUIVALENTS.LOVE).toBeCloseTo(0.618034, 5);
      // Verify it's actually φ - 1
      const phi = (1 + Math.sqrt(5)) / 2;
      expect(NUMERICAL_EQUIVALENTS.LOVE).toBeCloseTo(phi - 1, 5);
    });

    test('Justice (Pythagorean Ratio) ≈ 0.414214', () => {
      expect(NUMERICAL_EQUIVALENTS.JUSTICE).toBeCloseTo(0.414214, 5);
      // Verify it's actually √2 - 1
      expect(NUMERICAL_EQUIVALENTS.JUSTICE).toBeCloseTo(Math.sqrt(2) - 1, 5);
    });

    test('Power (Exponential Base) ≈ 0.718282', () => {
      expect(NUMERICAL_EQUIVALENTS.POWER).toBeCloseTo(0.718282, 5);
      // Verify it's actually e - 2
      expect(NUMERICAL_EQUIVALENTS.POWER).toBeCloseTo(Math.E - 2, 5);
    });

    test('Wisdom (Information Unit) ≈ 0.693147', () => {
      expect(NUMERICAL_EQUIVALENTS.WISDOM).toBeCloseTo(0.693147, 5);
      // Verify it's actually ln(2)
      expect(NUMERICAL_EQUIVALENTS.WISDOM).toBeCloseTo(Math.LN2, 5);
    });
  });

  describe('Reference Points', () => {
    test('Anchor Point is (1.0, 1.0, 1.0, 1.0)', () => {
      const anchor = REFERENCE_POINTS.ANCHOR_POINT;
      expect(anchor.love).toBe(1.0);
      expect(anchor.justice).toBe(1.0);
      expect(anchor.power).toBe(1.0);
      expect(anchor.wisdom).toBe(1.0);
    });

    test('Natural Equilibrium has correct numerical equivalent values', () => {
      const ne = REFERENCE_POINTS.NATURAL_EQUILIBRIUM;
      expect(ne.love).toBeCloseTo(NUMERICAL_EQUIVALENTS.LOVE, 5);
      expect(ne.justice).toBeCloseTo(NUMERICAL_EQUIVALENTS.JUSTICE, 5);
      expect(ne.power).toBeCloseTo(NUMERICAL_EQUIVALENTS.POWER, 5);
      expect(ne.wisdom).toBeCloseTo(NUMERICAL_EQUIVALENTS.WISDOM, 5);
    });
  });

  describe('Coupling Matrix', () => {
    test('Has correct Love coupling coefficients', () => {
      expect(COUPLING_MATRIX.LJ).toBe(1.4); // Love → Justice: +40%
      expect(COUPLING_MATRIX.LP).toBe(1.3); // Love → Power: +30%
      expect(COUPLING_MATRIX.LW).toBe(1.5); // Love → Wisdom: +50%
    });

    test('Diagonal elements are 1.0', () => {
      expect(COUPLING_MATRIX.LL).toBe(1.0);
      expect(COUPLING_MATRIX.JJ).toBe(1.0);
      expect(COUPLING_MATRIX.PP).toBe(1.0);
      expect(COUPLING_MATRIX.WW).toBe(1.0);
    });
  });

  describe('Effective Dimensions', () => {
    test('Love is not amplified (effective_L = L)', () => {
      const coords: AbsoluteCoordinates = { love: 0.8, justice: 0.6, power: 0.5, wisdom: 0.7 };
      const eff = LJPWBaselines.effectiveDimensions(coords);
      expect(eff.effective_L).toBe(coords.love);
    });

    test('Justice is amplified by Love (κ_LJ = 1.4)', () => {
      const L = 0.6;
      const J = 0.5;
      const coords: AbsoluteCoordinates = { love: L, justice: J, power: 0.5, wisdom: 0.5 };
      const eff = LJPWBaselines.effectiveDimensions(coords);

      const expected_J = J * (1 + 1.4 * L);
      expect(eff.effective_J).toBeCloseTo(expected_J, 10);
    });

    test('Power is amplified by Love (κ_LP = 1.3)', () => {
      const L = 0.7;
      const P = 0.6;
      const coords: AbsoluteCoordinates = { love: L, justice: 0.5, power: P, wisdom: 0.5 };
      const eff = LJPWBaselines.effectiveDimensions(coords);

      const expected_P = P * (1 + 1.3 * L);
      expect(eff.effective_P).toBeCloseTo(expected_P, 10);
    });

    test('Wisdom is amplified by Love (κ_LW = 1.5)', () => {
      const L = 0.8;
      const W = 0.7;
      const coords: AbsoluteCoordinates = { love: L, justice: 0.5, power: 0.5, wisdom: W };
      const eff = LJPWBaselines.effectiveDimensions(coords);

      const expected_W = W * (1 + 1.5 * L);
      expect(eff.effective_W).toBeCloseTo(expected_W, 10);
    });

    test('Love multiplier effect at L=0.6', () => {
      // From baselines doc: At L=0.6, multipliers are 1.84×, 1.78×, 1.90×
      const L = 0.6;
      const coords: AbsoluteCoordinates = { love: L, justice: 1.0, power: 1.0, wisdom: 1.0 };
      const eff = LJPWBaselines.effectiveDimensions(coords);

      expect(eff.effective_J).toBeCloseTo(1.84, 2); // J multiplier
      expect(eff.effective_P).toBeCloseTo(1.78, 2); // P multiplier
      expect(eff.effective_W).toBeCloseTo(1.90, 2); // W multiplier
    });
  });

  describe('Harmonic Mean', () => {
    test('Returns 0 if any dimension is 0', () => {
      const coords: AbsoluteCoordinates = { love: 0.5, justice: 0, power: 0.5, wisdom: 0.5 };
      expect(LJPWBaselines.harmonicMean(coords)).toBe(0);
    });

    test('Equals dimension value when all dimensions are equal', () => {
      const coords: AbsoluteCoordinates = { love: 0.6, justice: 0.6, power: 0.6, wisdom: 0.6 };
      expect(LJPWBaselines.harmonicMean(coords)).toBeCloseTo(0.6, 10);
    });

    test('Is dominated by smallest dimension', () => {
      const coords: AbsoluteCoordinates = { love: 0.9, justice: 0.9, power: 0.9, wisdom: 0.3 };
      const hm = LJPWBaselines.harmonicMean(coords);
      // Harmonic mean is dominated by smallest dimension (0.3)
      // For (0.9, 0.9, 0.9, 0.3), HM = 4/(1/0.9 + 1/0.9 + 1/0.9 + 1/0.3) ≈ 0.6
      expect(hm).toBeCloseTo(0.6, 1);
      expect(hm).toBeLessThan(0.7); // Should be well below the high values
      expect(hm).toBeGreaterThan(0.3); // But greater than the min
    });
  });

  describe('Geometric Mean', () => {
    test('Equals dimension value when all dimensions are equal', () => {
      const coords: AbsoluteCoordinates = { love: 0.8, justice: 0.8, power: 0.8, wisdom: 0.8 };
      expect(LJPWBaselines.geometricMean(coords)).toBeCloseTo(0.8, 10);
    });

    test('Returns correct value for mixed dimensions', () => {
      const coords: AbsoluteCoordinates = { love: 0.5, justice: 0.6, power: 0.7, wisdom: 0.8 };
      const gm = LJPWBaselines.geometricMean(coords);
      const expected = Math.pow(0.5 * 0.6 * 0.7 * 0.8, 0.25);
      expect(gm).toBeCloseTo(expected, 10);
    });
  });

  describe('Coupling-Aware Sum', () => {
    test('Can exceed 1.0 due to coupling amplification', () => {
      // High Love should create amplification
      const coords: AbsoluteCoordinates = { love: 0.9, justice: 0.9, power: 0.9, wisdom: 0.9 };
      const cas = LJPWBaselines.couplingAwareSum(coords);
      expect(cas).toBeGreaterThan(1.0);
    });

    test('Returns lower value with low Love', () => {
      const lowLove: AbsoluteCoordinates = { love: 0.2, justice: 0.8, power: 0.8, wisdom: 0.8 };
      const highLove: AbsoluteCoordinates = { love: 0.8, justice: 0.8, power: 0.8, wisdom: 0.8 };

      const casLow = LJPWBaselines.couplingAwareSum(lowLove);
      const casHigh = LJPWBaselines.couplingAwareSum(highLove);

      expect(casHigh).toBeGreaterThan(casLow);
    });
  });

  describe('Harmony Index', () => {
    test('Returns ~1.0 for Anchor Point', () => {
      const anchor = REFERENCE_POINTS.ANCHOR_POINT;
      const harmony = LJPWBaselines.harmonyIndex(anchor);
      // Distance from anchor is 0, so harmony = 1 / (1 + 0) = 1.0
      expect(harmony).toBeCloseTo(1.0, 10);
    });

    test('Returns lower value for points far from Anchor', () => {
      const farPoint: AbsoluteCoordinates = { love: 0.1, justice: 0.1, power: 0.1, wisdom: 0.1 };
      const closePoint: AbsoluteCoordinates = { love: 0.9, justice: 0.9, power: 0.9, wisdom: 0.9 };

      const harmonyFar = LJPWBaselines.harmonyIndex(farPoint);
      const harmonyClose = LJPWBaselines.harmonyIndex(closePoint);

      expect(harmonyClose).toBeGreaterThan(harmonyFar);
    });
  });

  describe('Composite Score', () => {
    test('Returns expected range for Natural Equilibrium', () => {
      const ne = REFERENCE_POINTS.NATURAL_EQUILIBRIUM;
      const composite = LJPWBaselines.compositeScore(ne);
      // NE is physically optimal but not transcendent (Anchor = 1.0 would be higher)
      // Expected composite score ≈ 0.705 based on NE coordinates
      expect(composite).toBeGreaterThan(0.6);
      expect(composite).toBeLessThan(0.8);
    });

    test('Returns higher score for high Love coordinates', () => {
      const lowLove: AbsoluteCoordinates = { love: 0.3, justice: 0.7, power: 0.7, wisdom: 0.7 };
      const highLove: AbsoluteCoordinates = { love: 0.9, justice: 0.7, power: 0.7, wisdom: 0.7 };

      const scoreLow = LJPWBaselines.compositeScore(lowLove);
      const scoreHigh = LJPWBaselines.compositeScore(highLove);

      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });
  });

  describe('Distance from Natural Equilibrium', () => {
    test('Returns 0 for Natural Equilibrium itself', () => {
      const ne = REFERENCE_POINTS.NATURAL_EQUILIBRIUM;
      const distance = LJPWBaselines.distanceFromNaturalEquilibrium(ne);
      expect(distance).toBeCloseTo(0, 10);
    });

    test('Returns positive distance for non-NE points', () => {
      const point: AbsoluteCoordinates = { love: 0.5, justice: 0.5, power: 0.5, wisdom: 0.5 };
      const distance = LJPWBaselines.distanceFromNaturalEquilibrium(point);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('Full Diagnostic', () => {
    test('Returns complete diagnostic structure', () => {
      const coords: AbsoluteCoordinates = { love: 0.7, justice: 0.6, power: 0.8, wisdom: 0.5 };
      const diagnostic = LJPWBaselines.fullDiagnostic(coords);

      // Check structure
      expect(diagnostic).toHaveProperty('coordinates');
      expect(diagnostic).toHaveProperty('effective_dimensions');
      expect(diagnostic).toHaveProperty('distances');
      expect(diagnostic).toHaveProperty('metrics');

      // Check coordinates
      expect(diagnostic.coordinates.L).toBe(coords.love);
      expect(diagnostic.coordinates.J).toBe(coords.justice);
      expect(diagnostic.coordinates.P).toBe(coords.power);
      expect(diagnostic.coordinates.W).toBe(coords.wisdom);

      // Check all metrics are numbers
      expect(typeof diagnostic.metrics.harmonic_mean).toBe('number');
      expect(typeof diagnostic.metrics.geometric_mean).toBe('number');
      expect(typeof diagnostic.metrics.coupling_aware_sum).toBe('number');
      expect(typeof diagnostic.metrics.harmony_index).toBe('number');
      expect(typeof diagnostic.metrics.composite_score).toBe('number');
    });
  });

  describe('Interpretations', () => {
    test('Composite score interpretation is correct', () => {
      expect(LJPWBaselines.interpretCompositeScore(0.4)).toContain('Critical');
      expect(LJPWBaselines.interpretCompositeScore(0.6)).toContain('Struggling');
      expect(LJPWBaselines.interpretCompositeScore(0.8)).toContain('Competent');
      expect(LJPWBaselines.interpretCompositeScore(1.0)).toContain('Strong');
      expect(LJPWBaselines.interpretCompositeScore(1.2)).toContain('Excellent');
      expect(LJPWBaselines.interpretCompositeScore(1.4)).toContain('Elite');
    });

    test('Distance from NE interpretation is correct', () => {
      expect(LJPWBaselines.interpretDistanceFromNE(0.1)).toContain('Near-optimal');
      expect(LJPWBaselines.interpretDistanceFromNE(0.3)).toContain('Good');
      expect(LJPWBaselines.interpretDistanceFromNE(0.6)).toContain('Moderate');
      expect(LJPWBaselines.interpretDistanceFromNE(0.9)).toContain('dysfunction');
    });
  });
});
