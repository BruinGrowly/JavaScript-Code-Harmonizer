import { Coordinates } from './coordinates';

describe('Coordinates', () => {
  describe('construction and normalization', () => {
    it('should normalize values to sum to 1', () => {
      const coords = new Coordinates(2, 2, 2, 2);
      expect(coords.love).toBeCloseTo(0.25, 5);
      expect(coords.justice).toBeCloseTo(0.25, 5);
      expect(coords.power).toBeCloseTo(0.25, 5);
      expect(coords.wisdom).toBeCloseTo(0.25, 5);
    });

    it('should handle zero total by distributing evenly', () => {
      const coords = new Coordinates(0, 0, 0, 0);
      expect(coords.love).toBe(0.25);
      expect(coords.justice).toBe(0.25);
      expect(coords.power).toBe(0.25);
      expect(coords.wisdom).toBe(0.25);
    });

    it('should throw error for negative values', () => {
      expect(() => new Coordinates(-1, 0, 0, 0)).toThrow();
      expect(() => new Coordinates(0, -1, 0, 0)).toThrow();
    });

    it('should preserve ratios when normalizing', () => {
      const coords = new Coordinates(3, 1, 0, 0);
      expect(coords.love).toBeCloseTo(0.75, 5);
      expect(coords.justice).toBeCloseTo(0.25, 5);
      expect(coords.power).toBeCloseTo(0, 5);
      expect(coords.wisdom).toBeCloseTo(0, 5);
    });
  });

  describe('factory methods', () => {
    it('should create pure Love coordinates', () => {
      const coords = Coordinates.love();
      expect(coords.love).toBe(1);
      expect(coords.justice).toBe(0);
      expect(coords.power).toBe(0);
      expect(coords.wisdom).toBe(0);
    });

    it('should create pure Justice coordinates', () => {
      const coords = Coordinates.justice();
      expect(coords.love).toBe(0);
      expect(coords.justice).toBe(1);
      expect(coords.power).toBe(0);
      expect(coords.wisdom).toBe(0);
    });

    it('should create pure Power coordinates', () => {
      const coords = Coordinates.power();
      expect(coords.love).toBe(0);
      expect(coords.justice).toBe(0);
      expect(coords.power).toBe(1);
      expect(coords.wisdom).toBe(0);
    });

    it('should create pure Wisdom coordinates', () => {
      const coords = Coordinates.wisdom();
      expect(coords.love).toBe(0);
      expect(coords.justice).toBe(0);
      expect(coords.power).toBe(0);
      expect(coords.wisdom).toBe(1);
    });

    it('should create Anchor Point coordinates', () => {
      const coords = Coordinates.anchor();
      expect(coords.love).toBeCloseTo(0.25, 5);
      expect(coords.justice).toBeCloseTo(0.25, 5);
      expect(coords.power).toBeCloseTo(0.25, 5);
      expect(coords.wisdom).toBeCloseTo(0.25, 5);
    });

    it('should create from object', () => {
      const coords = Coordinates.from({ love: 1, justice: 1, power: 1, wisdom: 1 });
      expect(coords.love).toBeCloseTo(0.25, 5);
    });
  });

  describe('distance calculations', () => {
    it('should calculate distance between coordinates', () => {
      const c1 = Coordinates.love(); // (1, 0, 0, 0)
      const c2 = Coordinates.wisdom(); // (0, 0, 0, 1)

      const distance = c1.distanceTo(c2);
      // Distance should be sqrt(1^2 + 0^2 + 0^2 + 1^2) = sqrt(2)
      expect(distance).toBeCloseTo(1.414, 2); // sqrt(2)
    });

    it('should return 0 for identical coordinates', () => {
      const c1 = new Coordinates(1, 2, 3, 4);
      const c2 = new Coordinates(1, 2, 3, 4);

      expect(c1.distanceTo(c2)).toBeCloseTo(0, 5);
    });

    it('should calculate distance from anchor', () => {
      const pure = Coordinates.love();
      const distance = pure.distanceFromAnchor();

      // Pure dimension is far from balanced anchor
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('cosine similarity', () => {
    it('should return 1 for identical coordinates', () => {
      const c1 = new Coordinates(1, 2, 3, 4);
      const c2 = new Coordinates(1, 2, 3, 4);

      expect(c1.cosineSimilarity(c2)).toBeCloseTo(1, 5);
    });

    it('should return high similarity for similar coordinates', () => {
      const c1 = new Coordinates(3, 1, 0, 0);
      const c2 = new Coordinates(4, 1, 0, 0);

      const similarity = c1.cosineSimilarity(c2);
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should return low similarity for opposite coordinates', () => {
      const c1 = Coordinates.love();
      const c2 = Coordinates.power();

      const similarity = c1.cosineSimilarity(c2);
      expect(similarity).toBeCloseTo(0, 5);
    });
  });

  describe('dominant dimension', () => {
    it('should identify Love as dominant', () => {
      const coords = new Coordinates(10, 1, 1, 1);
      expect(coords.getDominantDimension()).toBe('love');
    });

    it('should identify Justice as dominant', () => {
      const coords = new Coordinates(1, 10, 1, 1);
      expect(coords.getDominantDimension()).toBe('justice');
    });

    it('should identify Power as dominant', () => {
      const coords = new Coordinates(1, 1, 10, 1);
      expect(coords.getDominantDimension()).toBe('power');
    });

    it('should identify Wisdom as dominant', () => {
      const coords = new Coordinates(1, 1, 1, 10);
      expect(coords.getDominantDimension()).toBe('wisdom');
    });
  });

  describe('semantic clarity', () => {
    it('should return 1.0 for pure dimension (maximum clarity)', () => {
      const pure = Coordinates.love();
      const clarity = pure.getSemanticClarity();
      expect(clarity).toBeGreaterThan(0.9);
    });

    it('should return low value for evenly distributed (minimum clarity)', () => {
      const balanced = Coordinates.anchor();
      const clarity = balanced.getSemanticClarity();
      expect(clarity).toBeLessThan(0.2); // Evenly distributed has low clarity
    });

    it('should return intermediate values for partially focused coordinates', () => {
      const coords = new Coordinates(3, 1, 0, 0);
      const clarity = coords.getSemanticClarity();
      expect(clarity).toBeGreaterThan(0.3);
      expect(clarity).toBeLessThan(0.9);
    });
  });

  describe('serialization', () => {
    it('should convert to array', () => {
      const coords = new Coordinates(1, 2, 3, 4);
      const arr = coords.toArray();

      expect(arr.length).toBe(4);
      expect(arr[0]).toBeCloseTo(0.1, 5); // 1/10
      expect(arr[1]).toBeCloseTo(0.2, 5); // 2/10
      expect(arr[2]).toBeCloseTo(0.3, 5); // 3/10
      expect(arr[3]).toBeCloseTo(0.4, 5); // 4/10
    });

    it('should convert to object', () => {
      const coords = new Coordinates(1, 2, 3, 4);
      const obj = coords.toObject();

      expect(obj.love).toBeCloseTo(0.1, 5);
      expect(obj.justice).toBeCloseTo(0.2, 5);
      expect(obj.power).toBeCloseTo(0.3, 5);
      expect(obj.wisdom).toBeCloseTo(0.4, 5);
    });

    it('should convert to string', () => {
      const coords = new Coordinates(1, 1, 1, 1);
      const str = coords.toString();

      expect(str).toContain('Coordinates');
      expect(str).toContain('L=0.25');
      expect(str).toContain('J=0.25');
      expect(str).toContain('P=0.25');
      expect(str).toContain('W=0.25');
    });
  });

  describe('equality', () => {
    it('should detect equal coordinates', () => {
      const c1 = new Coordinates(1, 2, 3, 4);
      const c2 = new Coordinates(1, 2, 3, 4);

      expect(c1.equals(c2)).toBe(true);
    });

    it('should detect unequal coordinates', () => {
      const c1 = new Coordinates(1, 2, 3, 4);
      const c2 = new Coordinates(1, 2, 3, 5);

      expect(c1.equals(c2)).toBe(false);
    });

    it('should use epsilon for floating point comparison', () => {
      const c1 = new Coordinates(1.01, 2, 3, 4);
      const c2 = new Coordinates(1.02, 2, 3, 4);

      // With larger epsilon, should be equal
      expect(c1.equals(c2, 0.01)).toBe(true);
      // With smaller epsilon, should not be equal
      expect(c1.equals(c2, 0.001)).toBe(false);
    });
  });

  describe('integration examples', () => {
    it('should detect disharmony between intent and execution', () => {
      // Function named "get" (Wisdom) but executes "delete" (Power)
      const intent = Coordinates.wisdom(); // (0, 0, 0, 1)
      const execution = Coordinates.power(); // (0, 0, 1, 0)

      const disharmony = intent.distanceTo(execution);

      // This should show significant distance
      expect(disharmony).toBeGreaterThan(1.0);
      expect(disharmony).toBeCloseTo(1.414, 2); // sqrt(2)
    });

    it('should detect harmony for matching intent and execution', () => {
      const intent = new Coordinates(0, 0, 0, 1); // Wisdom (get)
      const execution = new Coordinates(0, 0, 0, 1); // Wisdom (return data)

      const disharmony = intent.distanceTo(execution);

      // This should show minimal distance
      expect(disharmony).toBeCloseTo(0, 5);
    });
  });
});
