import {
  levenshteinDistance,
  levenshteinSimilarity,
  calculateCharFrequency,
  klDivergence,
  jensenShannonDivergence,
  jensenShannonSimilarity,
  ljpwSimilarity,
  ljpwSimilarityWeighted,
  DEFAULT_WEIGHTS,
} from './ljpw';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should calculate distance for simple cases', () => {
    expect(levenshteinDistance('cat', 'hat')).toBe(1);
    expect(levenshteinDistance('sitting', 'kitten')).toBe(3);
  });

  it('should handle empty strings', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('should handle insertions, deletions, and substitutions', () => {
    expect(levenshteinDistance('abc', 'abcd')).toBe(1); // insertion
    expect(levenshteinDistance('abcd', 'abc')).toBe(1); // deletion
    expect(levenshteinDistance('abc', 'adc')).toBe(1); // substitution
  });
});

describe('levenshteinSimilarity', () => {
  it('should return 1.0 for identical strings', () => {
    expect(levenshteinSimilarity('hello', 'hello')).toBe(1.0);
    expect(levenshteinSimilarity('', '')).toBe(1.0);
  });

  it('should return 0.0 for completely different strings', () => {
    expect(levenshteinSimilarity('', 'hello')).toBe(0.0);
    expect(levenshteinSimilarity('hello', '')).toBe(0.0);
  });

  it('should return values between 0 and 1', () => {
    const similarity = levenshteinSimilarity('hello', 'hallo');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1);
  });

  it('should calculate correct similarity', () => {
    // 'cat' and 'hat' differ by 1 char out of 3
    const similarity = levenshteinSimilarity('cat', 'hat');
    expect(similarity).toBeCloseTo(2 / 3, 5);
  });
});

describe('calculateCharFrequency', () => {
  it('should return empty map for empty string', () => {
    const freq = calculateCharFrequency('');
    expect(freq.size).toBe(0);
  });

  it('should calculate correct frequencies', () => {
    const freq = calculateCharFrequency('aabbc');
    expect(freq.get('a')).toBeCloseTo(2 / 5, 5);
    expect(freq.get('b')).toBeCloseTo(2 / 5, 5);
    expect(freq.get('c')).toBeCloseTo(1 / 5, 5);
  });

  it('should normalize frequencies to sum to 1', () => {
    const freq = calculateCharFrequency('hello');
    let sum = 0;
    for (const prob of freq.values()) {
      sum += prob;
    }
    expect(sum).toBeCloseTo(1.0, 5);
  });
});

describe('klDivergence', () => {
  it('should return 0 for identical distributions', () => {
    const p = new Map([
      ['a', 0.5],
      ['b', 0.5],
    ]);
    const q = new Map([
      ['a', 0.5],
      ['b', 0.5],
    ]);
    expect(klDivergence(p, q)).toBeCloseTo(0, 5);
  });

  it('should return positive value for different distributions', () => {
    const p = new Map([
      ['a', 0.7],
      ['b', 0.3],
    ]);
    const q = new Map([
      ['a', 0.3],
      ['b', 0.7],
    ]);
    expect(klDivergence(p, q)).toBeGreaterThan(0);
  });
});

describe('jensenShannonDivergence', () => {
  it('should return 0 for identical strings', () => {
    expect(jensenShannonDivergence('hello', 'hello')).toBeCloseTo(0, 5);
  });

  it('should be symmetric', () => {
    const jsd1 = jensenShannonDivergence('abc', 'def');
    const jsd2 = jensenShannonDivergence('def', 'abc');
    expect(jsd1).toBeCloseTo(jsd2, 5);
  });

  it('should return positive value for different strings', () => {
    expect(jensenShannonDivergence('aaa', 'bbb')).toBeGreaterThan(0);
  });
});

describe('jensenShannonSimilarity', () => {
  it('should return 1.0 for identical strings', () => {
    expect(jensenShannonSimilarity('hello', 'hello')).toBe(1.0);
    expect(jensenShannonSimilarity('', '')).toBe(1.0);
  });

  it('should return 0.0 for empty vs non-empty', () => {
    expect(jensenShannonSimilarity('', 'hello')).toBe(0.0);
    expect(jensenShannonSimilarity('hello', '')).toBe(0.0);
  });

  it('should return values between 0 and 1', () => {
    const similarity = jensenShannonSimilarity('hello', 'world');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should be symmetric', () => {
    const sim1 = jensenShannonSimilarity('abc', 'def');
    const sim2 = jensenShannonSimilarity('def', 'abc');
    expect(sim1).toBeCloseTo(sim2, 5);
  });
});

describe('ljpwSimilarity', () => {
  it('should return 1.0 for identical strings', () => {
    expect(ljpwSimilarity('hello', 'hello')).toBe(1.0);
    expect(ljpwSimilarity('', '')).toBe(1.0);
  });

  it('should return 0.0 for empty vs non-empty', () => {
    expect(ljpwSimilarity('', 'hello')).toBe(0.0);
    expect(ljpwSimilarity('hello', '')).toBe(0.0);
  });

  it('should return values between 0 and 1', () => {
    const similarity = ljpwSimilarity('hello', 'hallo');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should combine Levenshtein and Jensen-Shannon metrics', () => {
    const s1 = 'function test() { return 42; }';
    const s2 = 'function test() { return 43; }';
    const similarity = ljpwSimilarity(s1, s2);
    expect(similarity).toBeGreaterThan(0.8); // Very similar code
  });

  it('should throw error for invalid weights', () => {
    expect(() => {
      ljpwSimilarity('hello', 'world', 0.5, 0.6);
    }).toThrow();
  });

  it('should accept custom weights', () => {
    const sim1 = ljpwSimilarity('hello', 'hallo', 0.7, 0.3);
    const sim2 = ljpwSimilarity('hello', 'hallo', 0.3, 0.7);
    // Different weights should produce different results
    expect(sim1).not.toBeCloseTo(sim2, 5);
  });
});

describe('ljpwSimilarityWeighted', () => {
  it('should return 1.0 for identical strings', () => {
    expect(ljpwSimilarityWeighted('hello', 'hello')).toBe(1.0);
  });

  it('should accept custom perceptual weights', () => {
    const customWeights = {
      ...DEFAULT_WEIGHTS,
      identifier: 1.5,
    };
    const similarity = ljpwSimilarityWeighted('hello', 'hallo', customWeights);
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should work with default weights', () => {
    const similarity = ljpwSimilarityWeighted('hello', 'hallo');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });
});

describe('Code similarity examples', () => {
  it('should detect similar functions with minor changes', () => {
    const code1 = 'function add(a, b) { return a + b; }';
    const code2 = 'function add(x, y) { return x + y; }';
    const similarity = ljpwSimilarity(code1, code2);
    expect(similarity).toBeGreaterThan(0.8);
  });

  it('should detect different functions', () => {
    const code1 = 'function add(a, b) { return a + b; }';
    const code2 = 'function multiply(a, b) { return a * b; }';
    const similarity = ljpwSimilarity(code1, code2);
    expect(similarity).toBeLessThan(0.9);
  });

  it('should handle whitespace differences', () => {
    const code1 = 'function test(){return 1;}';
    const code2 = 'function test() { return 1; }';
    const similarity = ljpwSimilarity(code1, code2);
    expect(similarity).toBeGreaterThan(0.85);
  });
});
