# JavaScript Code Harmonizer

A TypeScript-based code harmonizer using **LJPW** (Levenshtein-Jensen-Perceptual-Weighting) similarity metrics for intelligent code comparison and analysis.

## Overview

The JavaScript Code Harmonizer provides advanced code similarity detection by combining multiple mathematical approaches:

- **Levenshtein Distance**: Edit-based similarity for structural comparison
- **Jensen-Shannon Divergence**: Statistical similarity for character distribution analysis
- **Perceptual Weighting**: Domain-specific adjustments for code elements (identifiers, keywords, operators, etc.)

## Features

- **Multi-metric Similarity**: Combines multiple algorithms for robust code comparison
- **Configurable Weighting**: Adjust the importance of different similarity components
- **TypeScript Support**: Fully typed for excellent IDE integration
- **Comprehensive Testing**: High test coverage with Jest
- **Production Ready**: Linting, formatting, and build tools configured

## Installation

```bash
npm install
```

## Usage

### Basic Similarity Comparison

```typescript
import { ljpwSimilarity } from 'javascript-code-harmonizer';

const code1 = 'function add(a, b) { return a + b; }';
const code2 = 'function add(x, y) { return x + y; }';

const similarity = ljpwSimilarity(code1, code2);
console.log(`Similarity: ${similarity}`); // ~0.85 (very similar)
```

### Custom Weighting

```typescript
import { ljpwSimilarity } from 'javascript-code-harmonizer';

// Emphasize Levenshtein distance over Jensen-Shannon
const similarity = ljpwSimilarity(code1, code2, 0.8, 0.2);
```

### Perceptual Weighting (Coming Soon)

```typescript
import { ljpwSimilarityWeighted, DEFAULT_WEIGHTS } from 'javascript-code-harmonizer';

const customWeights = {
  ...DEFAULT_WEIGHTS,
  identifier: 1.5,  // Emphasize identifier similarity
  whitespace: 0.05, // De-emphasize whitespace differences
};

const similarity = ljpwSimilarityWeighted(code1, code2, customWeights);
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Lint & Format

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
```

## API Reference

### Core Functions

#### `levenshteinDistance(s1: string, s2: string): number`

Calculates the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one string into another.

#### `levenshteinSimilarity(s1: string, s2: string): number`

Returns normalized Levenshtein similarity between 0 (completely different) and 1 (identical).

#### `jensenShannonSimilarity(s1: string, s2: string): number`

Returns Jensen-Shannon similarity based on character distribution, from 0 to 1.

#### `ljpwSimilarity(s1: string, s2: string, levWeight?: number, jsWeight?: number): number`

Combines Levenshtein and Jensen-Shannon metrics with configurable weights (default: 0.6 and 0.4).

## Project Structure

```
javascript-code-harmonizer/
├── src/
│   ├── core/
│   │   ├── ljpw.ts           # Core LJPW implementation
│   │   └── ljpw.test.ts      # Comprehensive tests
│   ├── utils/
│   │   └── helpers.ts        # Utility functions
│   └── index.ts              # Main exports
├── dist/                     # Built output (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Roadmap

- [ ] AST-based code tokenization
- [ ] Token-level perceptual weighting
- [ ] Support for multiple languages
- [ ] CLI tool for code comparison
- [ ] Integration with popular linters/formatters
- [ ] Performance optimizations for large codebases

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. Add tests for new features

## License

MIT