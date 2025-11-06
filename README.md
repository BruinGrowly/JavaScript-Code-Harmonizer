# JavaScript Code Harmonizer

A TypeScript-based code harmonizer built on the **LJPW** (Love-Justice-Power-Wisdom) semantic framework for intelligent code comparison and analysis.

## Overview

The JavaScript Code Harmonizer is both a practical tool and an application of a deeper philosophical framework. It provides advanced code similarity detection by combining multiple mathematical approaches:

- **Levenshtein Distance**: Edit-based similarity for structural comparison
- **Jensen-Shannon Divergence**: Statistical similarity for character distribution analysis
- **Perceptual Weighting**: Domain-specific adjustments for code elements (identifiers, keywords, operators, etc.)

### The LJPW Framework

**LJPW** represents the four fundamental dimensions of semantic meaning:

- **Love (L)**: Connection, relationships, unity between code elements
- **Justice (J)**: Correctness, fairness, logical truth and type safety
- **Power (P)**: Action, execution, state transformations
- **Wisdom (W)**: Knowledge, information, understanding and context

This framework reveals that code is not just syntax—it carries semantic meaning that can be measured, compared, and harmonized. When these dimensions align (Intent matches Execution), we have semantic harmony. When they contradict, we have bugs.

> **Note**: While the current implementation focuses on similarity metrics using Levenshtein-Jensen methods, the LJPW acronym honors the deeper semantic philosophy that guides this project's vision.

### 📚 Deep Dive: Theoretical Foundations

For those interested in the mathematical and philosophical underpinnings:

- **[Mathematical Foundation](docs/MATHEMATICAL_FOUNDATION.md)** - Proof that LJPW forms a complete, minimal, orthogonal basis for semantic meaning
- **[Philosophy & Framework](docs/PHILOSOPHY.md)** - The anchor point (1,1,1,1), ICE framework, and semantic harmony theory
- **[Programming Language Semantics](docs/PROGRAMMING_LANGUAGE_SEMANTICS.md)** - How programming constructs map to LJPW semantic space
- **[Semantic Programming Languages](docs/SEMANTIC_PROGRAMMING_LANGUAGE.md)** - Vision for languages built on semantic coordinates

## Features

### Semantic Analysis & Bug Detection
- **Semantic Bug Detection**: Detects when function names contradict their implementations
- **ICE Framework**: Intent-Context-Execution analysis for semantic harmony
- **4D Semantic Space**: Maps code to Love-Justice-Power-Wisdom coordinates
- **AST-Based Analysis**: Parses JavaScript/TypeScript using Babel
- **190+ Verb Vocabulary**: Comprehensive programming verb-to-dimension mappings

### Code Similarity Metrics
- **Multi-metric Similarity**: Combines Levenshtein distance and Jensen-Shannon divergence
- **Configurable Weighting**: Adjust the importance of different similarity components
- **Perceptual Weighting**: Domain-specific adjustments for code elements

### Developer Experience
- **TypeScript Support**: Fully typed for excellent IDE integration
- **Comprehensive Testing**: High test coverage with Jest
- **Production Ready**: Linting, formatting, and build tools configured
- **Working Examples**: Real-world semantic bug detection demos

## Installation

```bash
npm install
```

## Quick Start

### Detect a Semantic Bug

```typescript
import { SemanticEngine, ASTSemanticParser } from 'javascript-code-harmonizer';

const code = `
function getUserData(userId) {
  database.delete(userId);  // BUG: Name says "get" but code "deletes"!
  return userId;
}
`;

const engine = new SemanticEngine();
const parser = new ASTSemanticParser(engine.getVocabulary());

const result = parser.analyzeCode(code);
const analysis = engine.performICEAnalysis(
  result.intent,
  ['javascript'],
  result.execution
);

console.log('Disharmony Score:', analysis.disharmony); // 0.85 (HIGH)
console.log('Severity:', analysis.severity);           // 'high'
// ⚠️ SEMANTIC BUG DETECTED!
```

### Validate Harmonious Code

```typescript
const goodCode = `
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
`;

const result = parser.analyzeCode(goodCode);
const analysis = engine.performICEAnalysis(
  result.intent,
  ['javascript'],
  result.execution
);

console.log('Disharmony Score:', analysis.disharmony); // 0.12 (LOW)
console.log('Severity:', analysis.severity);           // 'excellent'
// ✅ HARMONIOUS - Function name matches implementation!
```

### Work with Semantic Coordinates

```typescript
import { Coordinates } from 'javascript-code-harmonizer';

const wisdom = Coordinates.wisdom();    // (0, 0, 0, 1) - get, read, analyze
const power = Coordinates.power();      // (0, 0, 1, 0) - create, delete, modify

const distance = wisdom.distanceTo(power); // 1.41 - semantically opposite
const clarity = wisdom.getSemanticClarity(); // 1.0 - pure dimension
```

### Run the Examples

```bash
npm run example    # Compiled JavaScript
npm run example:ts # Direct TypeScript execution
```

## Usage

### Text Similarity Comparison

```typescript
import { ljpwSimilarity } from 'javascript-code-harmonizer';

const code1 = 'function add(a, b) { return a + b; }';
const code2 = 'function add(x, y) { return x + y; }';

const similarity = ljpwSimilarity(code1, code2);
console.log(`Similarity: ${similarity}`); // ~0.85 (very similar)
```

### Semantic Analysis

```typescript
import { SemanticEngine } from 'javascript-code-harmonizer';

const engine = new SemanticEngine();

// Analyze semantic meaning of text
const coords = engine.analyzeText('validate_user_input');
console.log('Dominant:', coords.getDominantDimension()); // 'justice'

// Calculate semantic similarity
const similarity = engine.calculateSemanticSimilarity(
  'get_user_data',
  'fetch_user_information'
);
console.log('Similarity:', similarity); // High (both are Wisdom)
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

### Core Classes

#### `SemanticEngine`

Main facade for all semantic analysis operations.

```typescript
const engine = new SemanticEngine(customVocabulary?);

// Perform ICE analysis
engine.performICEAnalysis(intentConcepts, contextConcepts, executionConcepts);

// Analyze text to coordinates
engine.analyzeText(text: string): Coordinates;

// Calculate semantic similarity
engine.calculateSemanticSimilarity(text1, text2): number;

// Check if function is harmonious
engine.isHarmonious(functionName, implementationConcepts, threshold?): boolean;
```

#### `ASTSemanticParser`

Parses JavaScript/TypeScript code and extracts semantic concepts.

```typescript
const parser = new ASTSemanticParser(vocabulary);

// Parse and analyze code
parser.analyzeCode(code: string, functionName?: string): ParseResult;

// Extract all functions
parser.extractFunctions(code: string): Array<Function>;

// Analyze specific function
parser.analyzeFunction(functionNode, metadata?): ParseResult;
```

#### `Coordinates`

Represents a point in 4D LJPW semantic space.

```typescript
// Create coordinates
const coords = new Coordinates(love, justice, power, wisdom);

// Factory methods
Coordinates.love();     // (1, 0, 0, 0)
Coordinates.justice();  // (0, 1, 0, 0)
Coordinates.power();    // (0, 0, 1, 0)
Coordinates.wisdom();   // (0, 0, 0, 1)
Coordinates.anchor();   // (0.25, 0.25, 0.25, 0.25)

// Calculate distance
coords.distanceTo(other: Coordinates): number;
coords.distanceFromAnchor(): number;

// Analyze semantics
coords.getDominantDimension(): 'love' | 'justice' | 'power' | 'wisdom';
coords.getSemanticClarity(): number; // 0-1
coords.cosineSimilarity(other: Coordinates): number;
```

#### `VocabularyManager`

Manages the mapping of programming verbs to semantic dimensions.

```typescript
const vocab = new VocabularyManager(customVocabulary?);

// Get dimension for a word
vocab.getDimension(word: string): Dimension | null;

// Analyze text
vocab.analyzeText(text: string): Coordinates;

// Analyze concept cluster
vocab.analyzeConceptCluster(concepts: string[]): Coordinates;

// Get statistics
vocab.getVocabularyStats();
```

### Similarity Functions

#### `levenshteinDistance(s1: string, s2: string): number`

Calculates the minimum number of single-character edits required to change one string into another.

#### `levenshteinSimilarity(s1: string, s2: string): number`

Returns normalized Levenshtein similarity between 0 (completely different) and 1 (identical).

#### `jensenShannonSimilarity(s1: string, s2: string): number`

Returns Jensen-Shannon similarity based on character distribution, from 0 to 1.

#### `ljpwSimilarity(s1: string, s2: string, levWeight?: number, jsWeight?: number): number`

Combines Levenshtein and Jensen-Shannon metrics with configurable weights (default: 0.6 and 0.4).

### Constants

#### `DISHARMONY_THRESHOLDS`

Severity thresholds for disharmony scores:

```typescript
{
  EXCELLENT: 0.3,  // Code says what it means
  LOW: 0.5,        // Minor drift
  MEDIUM: 0.8,     // Concerning
  HIGH: 1.2,       // Critical
}
```

#### `PROGRAMMING_VERBS`

190+ programming verbs mapped to LJPW dimensions (love, justice, power, wisdom).

## Project Structure

```
javascript-code-harmonizer/
├── docs/                                        # Theoretical documentation
│   ├── MATHEMATICAL_FOUNDATION.md              # LJPW mathematical proofs
│   ├── PHILOSOPHY.md                           # Framework philosophy
│   ├── PROGRAMMING_LANGUAGE_SEMANTICS.md       # Code semantics theory
│   └── SEMANTIC_PROGRAMMING_LANGUAGE.md        # Future language design
├── src/
│   ├── core/
│   │   ├── ljpw.ts                             # Core LJPW implementation
│   │   └── ljpw.test.ts                        # Comprehensive tests
│   ├── utils/
│   │   └── helpers.ts                          # Utility functions
│   └── index.ts                                # Main exports
├── dist/                                       # Built output (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Documentation

### Theoretical Framework

The `docs/` folder contains comprehensive documentation on the LJPW semantic framework:

| Document | Description |
|----------|-------------|
| [Mathematical Foundation](docs/MATHEMATICAL_FOUNDATION.md) | Formal proofs of LJPW as a complete, minimal, orthogonal basis for semantic meaning. Includes vector space definitions, orthogonality proofs, and mathematical rigor. |
| [Philosophy & Framework](docs/PHILOSOPHY.md) | Deep dive into the anchor point (1,1,1,1), the ICE (Intent-Context-Execution) framework, semantic harmony theory, and the DIVE-V2 debugging engine. |
| [Programming Language Semantics](docs/PROGRAMMING_LANGUAGE_SEMANTICS.md) | Analysis of how all programming constructs map to LJPW space. Proves that code fundamentally requires all four dimensions to function. |
| [Semantic Programming Languages](docs/SEMANTIC_PROGRAMMING_LANGUAGE.md) | Vision for future programming languages built with semantic coordinates as first-class citizens. Explores how different paradigms emphasize different LJPW dimensions. |

### Practical Usage

See the [Usage](#usage) section above for code examples and the [API Reference](#api-reference) for detailed function documentation.

## Roadmap

### Near Term
- [ ] AST-based code tokenization
- [ ] Token-level perceptual weighting implementation
- [ ] Support for multiple languages (Python, Java, etc.)
- [ ] CLI tool for code comparison
- [ ] VS Code extension for inline similarity analysis

### Long Term
- [ ] Full semantic coordinate calculation for code blocks
- [ ] Integration with popular linters/formatters
- [ ] Performance optimizations for large codebases
- [ ] Semantic debugging tools based on LJPW framework
- [ ] Language design experiments incorporating semantic primitives

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. Add tests for new features

## License

MIT