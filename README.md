# JavaScript Code Harmonizer

A TypeScript-based code harmonizer built on the **LJPW** semantic framework for intelligent code comparison and analysis.

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

### 🚀 Phase 1: Production Features

The tool is production-ready for large legacy codebases with:

#### Multi-File Project Analysis
- **Recursive Directory Scanning**: Analyze entire projects with glob patterns
- **Parallel Processing**: Configurable worker pool (default: 4 workers)
- **Smart File Detection**: Automatically skips minified/generated code
- **Error Resilience**: Continues on errors, provides detailed error reports
- **Memory Management**: Monitors usage, triggers GC when needed
- **Progress Indicators**: Real-time feedback for long operations

#### Configuration System
- **`.harmonizerrc.json`**: Project-specific configuration
- **`.harmonizerignore`**: Gitignore-style file exclusion patterns
- **Hierarchical Config**: Searches up directory tree
- **Customizable Thresholds**: Define your own LOW/MEDIUM/HIGH severity levels
- **Rule Configuration**: Enable/disable specific checks
- **Performance Tuning**: Control parallelism, caching, timeouts

#### Performance & Caching
- **SHA-256 File Hashing**: Detects changes accurately
- **Persistent Cache**: Stores results in `.harmonizer-cache/`
- **Incremental Analysis**: Only analyze changed files
- **3.7x Speedup**: Measured performance improvement on cached runs
- **Cache Management**: Import/export, statistics, pruning

#### CI/CD Integration
- **Baseline Comparison**: Track code quality over time
- **Regression Detection**: Fail builds on quality degradation
- **Exit Codes**: 0=pass, 1=fail, 2=error
- **Quality Gates**: `--fail-on-high`, `--fail-on-medium` flags
- **SARIF Output**: GitHub Code Scanning integration
- **Markdown Reports**: Perfect for PR comments

#### Advanced CLI
- **Multi-Format Output**: text, json, sarif, markdown
- **Flexible Analysis**: Single file, directory, or recursive
- **CI/CD Optimized**: `--quiet`, `--exit-code`, `--baseline` flags
- **Developer Friendly**: `--verbose`, `--suggest-names`, progress bars

### ✨ Phase 2.5: Interactive UX (NEW!)

Focus on delightful user experience with 7 new interactive commands:

#### Interactive Commands

##### `harmonizer init` - Interactive Setup Wizard
- **First-Time Magic**: Perfect for new users
- **Auto-Detection**: Recognizes project type (Node.js, TypeScript, etc.)
- **Guided Configuration**: Creates `.harmonizerrc.json` interactively
- **First Analysis**: Runs initial scan and shows results
- **Next Steps**: Shows exactly what to do next

```bash
harmonizer init
# ✨ Welcome to Code Harmonizer! ✨
# → Detects: Node.js TypeScript project (52 JS/TS files)
# → Creates config: .harmonizerrc.json
# → Runs first analysis
# → Shows: "harmonizer status" for health check
```

##### `harmonizer fix [target]` - Interactive Refactoring
- **Step-by-Step**: Guides through each disharmonious function
- **Preview Changes**: See before/after function names
- **Smart Suggestions**: Shows top 5 rename suggestions with confidence scores
- **Auto-Apply Mode**: `--auto-apply` for automated refactoring
- **Dry Run**: `--dry-run` to preview without changes
- **Severity Filtering**: `--severity HIGH` to focus on critical issues

```bash
harmonizer fix ./src

# [1/10] src/user.js:42
# ❌ Function: getUserData
#    Disharmony: 0.849 [HIGH]
#
# Suggested names:
#   1. deleteUserData (85% confidence)
#   2. removeUserData (82% confidence)
#   3. destroyUserData (78% confidence)
#
# What would you like to do?
#   → Rename to: deleteUserData
#   → Skip this function
#   → Exit
```

##### `harmonizer explain <file:line>` - Educational Deep-Dive
- **What's Wrong**: Plain English explanation of the semantic issue
- **Why It Matters**: Real-world impact and consequences
- **How to Fix**: 3 specific refactoring suggestions
- **LJPW Analysis**: Optional `--verbose` for semantic trajectory
- **Learn by Example**: Educational approach (WHY not just WHAT)

```bash
harmonizer explain src/user.js:42

# ═══════════════════════════════════════════════════════════
#            🔍 Issue Explanation
# ═══════════════════════════════════════════════════════════
#
# WHAT'S WRONG?
# Function named "getUserData" but implementation DELETES user data.
# Name says Wisdom (get/read) but code does Power (delete/destroy).
#
# WHY DOES THIS MATTER?
# • Developers calling this function expect it to be read-only
# • Can cause data loss in production
# • Makes code impossible to understand
# • Violates principle of least surprise
#
# HOW TO FIX?
#   1. Rename to: deleteUserData()
#   2. Rename to: removeUserData()
#   3. Split into: getUser() + deleteUser()
```

##### `harmonizer status [target]` - Health Dashboard
- **Overall Score**: 0-100 health grade (A-F)
- **Visual Progress**: ASCII art progress bars
- **Severity Distribution**: HIGH/MEDIUM/LOW breakdown with charts
- **Top 5 Worst Files**: Files needing immediate attention
- **Actionable Recommendations**: Specific next steps based on health

```bash
harmonizer status ./src

# ═══════════════════════════════════════════════════════════
#            📊 Code Health Dashboard
# ═══════════════════════════════════════════════════════════
#
# OVERALL HEALTH
# ████████████████░░░░  82/100 - Grade: B
#
# FILES:  52 analyzed, 0 errors
# FUNCTIONS: 234 total, 42 disharmonious (82% success rate)
#
# SEVERITY DISTRIBUTION
#   ❌ HIGH: 5    █████░░░░░░░░░░░░░░░
#   ⚠️  MEDIUM: 15 ███████████████░░░░░
#   ℹ️  LOW: 22    ████████████████████
#
# TOP 5 FILES NEEDING ATTENTION
#   1. src/auth.js - 0.742 avg (8 issues)
#   2. src/database.js - 0.685 avg (5 issues)
#   ...
#
# RECOMMENDATIONS
#   ⚠️  Good, but room for improvement.
#   • Fix 5 HIGH severity: harmonizer fix --severity HIGH
#   • Review top files: harmonizer fix src/auth.js
```

##### `harmonizer examples` - Interactive Example Browser
- **12 Categorized Examples**: Basics, CI/CD, Git, Reports, etc.
- **Interactive Selection**: Browse by category
- **Copy-Paste Ready**: All commands ready to run
- **Quick Reference**: Learn by example

```bash
harmonizer examples

# BASICS
#   1. Analyze a single file
#      harmonizer examples/test-files/buggy-code.js
#
#   2. Analyze directory recursively
#      harmonizer ./src --recursive
#
# CI/CD INTEGRATION
#   3. Save baseline for CI
#      harmonizer ./src -r --save-baseline baseline.json
#
# [Browse all categories]
```

##### `harmonizer tutorial` - 5-Minute Onboarding
- **Guided Walkthrough**: Perfect for first-time users
- **Interactive Learning**: Hands-on with your own code
- **8 Learning Steps**: From basics to advanced features
- **No Reading Required**: Learn by doing

```bash
harmonizer tutorial

# ═══════════════════════════════════════════════════════════
#      🎓 Welcome to Code Harmonizer Tutorial
# ═══════════════════════════════════════════════════════════
# This 5-minute tutorial shows you everything you need to know.
#
# STEP 1: What is Code Harmonizer?
# [Interactive explanation with examples]
# Press ENTER to continue...
```

##### `harmonizer help [command]` - Enhanced Help
- **Categorized Reference**: Commands grouped by purpose
- **Quick Start**: Most common commands first
- **Command-Specific Help**: `harmonizer help fix`
- **Extensive Examples**: Real-world usage patterns
- **Beautiful Formatting**: Color-coded and easy to scan

```bash
harmonizer help

# QUICK START
#   harmonizer init              Set up Code Harmonizer
#   harmonizer status            View project health
#   harmonizer fix               Fix issues interactively
#
# INTERACTIVE COMMANDS
#   harmonizer init              Interactive setup
#   harmonizer fix [target]      Guided refactoring
#   harmonizer explain file:line Deep-dive explanation
#   ...
```

#### Developer Experience Improvements

**Improved Error Messages**
- Helpful context and suggestions
- Color-coded severity levels
- Links to documentation
- No more cryptic errors!

**Interactive Prompts**
- Yes/no confirmations with defaults
- Text input with auto-completion
- Multiple choice selection
- Pause for user review

**Beautiful Output**
- Color-coded messages (chalk)
- ASCII art headers and dividers
- Emoji indicators for quick scanning
- Progress bars for long operations

**Educational Approach**
- Explains WHY issues matter
- Shows real-world impact
- Teaches semantic concepts
- Helps users understand, not just fix

## Installation

```bash
npm install
```

## Quick Start

### 🎯 New User? Start Here!

```bash
# Interactive setup wizard (recommended for first-time users)
npm run harmonizer:cli init

# Check your project health
npm run harmonizer:cli status

# Learn with interactive tutorial
npm run harmonizer:cli tutorial

# Browse examples
npm run harmonizer:cli examples
```

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

## CLI Usage

The Harmonizer includes a powerful command-line tool for analyzing JavaScript/TypeScript files and entire projects.

### Installation

After building the project:

```bash
npm run build
npm link  # Makes 'harmonizer' command available globally
```

Or use directly with npm scripts:

```bash
npm run harmonizer:v2 -- [options] [target]
```

### Basic Usage

```bash
# Analyze a single file
harmonizer path/to/file.js

# Analyze entire directory recursively
harmonizer ./src --recursive

# Analyze with caching (3.7x faster on subsequent runs)
harmonizer ./src --recursive --cache --incremental
```

### Command-Line Options

```bash
harmonizer [OPTIONS] [TARGET]

TARGET:
  File or directory to analyze (default: current directory)

Analysis:
  --recursive, -r              Analyze directory recursively
  --suggest-names              Suggest better function names
  --threshold, -t <number>     Disharmony threshold (default: 0.5)
  --config, -c <path>          Path to configuration file

Performance:
  --parallel, -p <number>      Number of parallel workers (default: 4)
  --cache                      Enable result caching (3.7x speedup)
  --incremental                Only analyze changed files
  --clear-cache                Clear the cache and exit

CI/CD:
  --baseline <path>            Compare with baseline file
  --save-baseline <path>       Save current results as baseline
  --fail-on-high               Exit with code 1 if HIGH severity found
  --fail-on-medium             Exit with code 1 if MEDIUM severity found
  --exit-code                  Use exit codes (0=pass, 1=fail, 2=error)

Output:
  --format, -f <format>        Output format: text, json, sarif, markdown
  --output, -o <path>          Write output to file
  --verbose                    Show detailed analysis
  --quiet, -q                  Suppress progress output

Utility:
  --init                       Create default config files
  --help, -h                   Show help
  --version, -v                Show version
```

### Example: Analyze with All Features

```bash
harmonizer examples/test-files/buggy-code.js --verbose --suggest-names
```

**Output:**
```
======================================================================
JavaScript Code Harmonizer v0.2.0
Semantic Bug Detection & Code Analysis
======================================================================

File: examples/test-files/buggy-code.js
Functions analyzed: 5

ANALYSIS RESULTS:
──────────────────────────────────────────────────────────────────────

⚠️  getUserData:1
   Disharmony: 0.849 📕 HIGH
   Intent:     Coordinates(L=0.10, J=0.10, P=0.10, W=0.70)
   Execution:  Coordinates(L=0.10, J=0.10, P=0.70, W=0.10)

   📍 SEMANTIC TRAJECTORY:
   ┌────────────────────────────────────────────────────────┐
   │ Dimension    Intent   →   Execution      Δ            │
   ├────────────────────────────────────────────────────────┤
   │ Love         0.10  →  0.10      +0.00  ~ │
   │ Justice      0.10  →  0.10      +0.00  ~ │
   │ Power        0.10  →  0.70      +0.60  ⚠️ │
   │ Wisdom       0.70  →  0.10      -0.60  ⚠️ │
   └────────────────────────────────────────────────────────┘

   💡 BETTER NAME SUGGESTIONS:
      1. delete (similarity: 0.957)
      2. remove (similarity: 0.957)
      3. destroy (similarity: 0.941)

──────────────────────────────────────────────────────────────────────
SUMMARY:
   Total Functions:    5
   Harmonious:         0 ✅
   Disharmonious:      5 ⚠️
   Average Disharmony: 0.723

   Severity Breakdown:
      Excellent: 0
      Low:       0
      Medium:    2
      High:      3
      Critical:  0

======================================================================
```

### JSON Output for CI/CD

Use JSON output for automated tooling:

```bash
harmonizer myfile.js --format json > report.json
```

**JSON Structure:**
```json
{
  "filePath": "myfile.js",
  "functions": [
    {
      "name": "getUserData",
      "line": 5,
      "disharmony": 0.849,
      "severity": "high",
      "intent": {
        "coordinates": "Coordinates(L=0.10, J=0.10, P=0.10, W=0.70)",
        "dominant": "wisdom"
      },
      "execution": {
        "coordinates": "Coordinates(L=0.10, J=0.10, P=0.70, W=0.10)",
        "dominant": "power"
      },
      "suggestions": [
        { "name": "delete", "similarity": 0.957 },
        { "name": "remove", "similarity": 0.957 }
      ]
    }
  ],
  "summary": {
    "totalFunctions": 5,
    "harmonious": 0,
    "disharmonious": 5,
    "avgDisharmony": 0.723,
    "severityCounts": {
      "excellent": 0,
      "low": 0,
      "medium": 2,
      "high": 3,
      "critical": 0
    }
  }
}
```

### Advanced Phase 1 Examples

#### CI/CD Pipeline Integration

```bash
# Initialize configuration
harmonizer --init

# Analyze project and save baseline
harmonizer ./src --recursive --cache \
  --save-baseline baseline.json \
  --format json --output report.json

# In CI: Compare with baseline and fail on regressions
harmonizer ./src --recursive --cache \
  --baseline baseline.json \
  --fail-on-high \
  --exit-code

# Generate SARIF for GitHub Code Scanning
harmonizer ./src --recursive \
  --format sarif \
  --output harmonizer.sarif
```

#### Create Configuration File

```bash
harmonizer --init
```

Creates `.harmonizerrc.json`:

```json
{
  "thresholds": {
    "disharmony": {
      "low": 0.3,
      "medium": 0.6,
      "high": 0.8
    }
  },
  "ignore": ["**/node_modules/**", "**/dist/**", "**/*.test.js"],
  "rules": {
    "semantic-naming": "warn",
    "ice-analysis": "warn",
    "disharmony-threshold": "error"
  },
  "performance": {
    "parallelism": 4,
    "cache": true,
    "incremental": true
  },
  "ci": {
    "failOnHigh": true,
    "failOnMedium": false
  }
}
```

#### Incremental Analysis with Caching

```bash
# First run - analyzes all files
harmonizer ./src --recursive --cache --incremental
# Time: ~500ms for 100 files

# Second run - only analyzes changed files
harmonizer ./src --recursive --cache --incremental
# Time: ~135ms (3.7x faster!)
```

#### Generate Markdown Report for PRs

```bash
harmonizer ./src --recursive \
  --format markdown \
  --output pr-comment.md \
  --quiet

# Use in GitHub Actions to comment on PRs
gh pr comment $PR_NUMBER --body-file pr-comment.md
```

### Exit Codes

The CLI returns appropriate exit codes for CI/CD integration:

- `0`: Analysis passed quality gates
- `1`: Quality gate failure (HIGH severity found, or regressions detected)
- `2`: Analysis error (syntax errors, file not found, etc.)

### Programmatic Usage

You can also use the CLI programmatically:

```typescript
import { CodeHarmonizer } from 'javascript-code-harmonizer';

const harmonizer = new CodeHarmonizer({
  threshold: 0.5,
  suggestNames: true,
  format: 'text',
  verbose: true,
});

const result = await harmonizer.analyzeFile('myfile.js');
const output = harmonizer.generateOutput(result);
console.log(output);
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

### ✅ Completed (v0.2.0)

**Phase 1: Production Infrastructure**
- [x] Multi-file project analysis with parallel processing
- [x] Configuration system (.harmonizerrc.json, .harmonizerignore)
- [x] File caching with SHA-256 hashing (3.7x speedup)
- [x] CI/CD integration (baselines, exit codes, SARIF output)
- [x] Advanced CLI with multiple output formats

**Phase 2: Developer Experience**
- [x] HTML reports with Chart.js visualizations
- [x] Git integration (diff analysis, blame, hooks)
- [x] Watch mode for continuous analysis
- [x] Enhanced CLI with colors and progress indicators

**Phase 2.5: Interactive UX**
- [x] Interactive init command (setup wizard)
- [x] Interactive fix command (guided refactoring)
- [x] Explain command (educational deep-dives)
- [x] Examples command (interactive browser)
- [x] Status command (health dashboard)
- [x] Tutorial command (5-minute onboarding)
- [x] Enhanced help system
- [x] Improved error messages
- [x] Beautiful output with colors and ASCII art

### 🚧 In Progress / Future Enhancements

**Testing & Quality**
- [ ] Test suite for Phase 1/2 features (4,258 LOC untested)
- [ ] Integration tests for CLI commands
- [ ] E2E tests for CI/CD workflows

**Distribution**
- [ ] Publish to npm registry
- [ ] GitHub releases with binaries
- [ ] Docker image for CI/CD

**IDE Integration**
- [ ] VS Code extension for inline analysis
- [ ] JetBrains plugin
- [ ] Language Server Protocol (LSP) support

**Advanced Features**
- [ ] Auto-fix with AST manipulation (safe refactoring)
- [ ] Machine learning for better name suggestions
- [ ] Support for more languages (Python, Java, Go, etc.)
- [ ] Team dashboards with analytics
- [ ] Historical trend analysis

**Long Term Vision**
- [ ] Full semantic coordinate calculation for code blocks
- [ ] Integration with popular linters/formatters
- [ ] Semantic debugging tools based on LJPW framework
- [ ] Language design experiments incorporating semantic primitives
- [ ] Real-time analysis in IDEs

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. Add tests for new features

## License

MIT
