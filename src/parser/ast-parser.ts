/**
 * AST Semantic Parser
 *
 * Bridges JavaScript AST to semantic concepts using Babel parser.
 * Extracts Intent (from function names) and Execution (from code structure).
 */

import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { Dimension, VocabularyManager } from '../core/vocabulary';

/**
 * Function metadata extracted from AST
 */
export interface FunctionMetadata {
  name: string;
  params: string[];
  isAsync: boolean;
  isGenerator: boolean;
  isArrow: boolean;
  docstring?: string;
  location?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * Execution mapping - maps AST nodes to semantic dimensions
 */
export interface ExecutionMapping {
  node: t.Node;
  dimension: Dimension;
  description: string;
}

/**
 * Parse result containing intent and execution concepts
 */
export interface ParseResult {
  intent: string[]; // Concepts from function name + docstring
  execution: string[]; // Concepts from code body
  executionMap: ExecutionMapping[]; // Detailed node-to-dimension mapping
  metadata: FunctionMetadata;
}

/**
 * ASTSemanticParser - Converts JavaScript AST to semantic concepts
 */
export class ASTSemanticParser {
  private vocabulary: VocabularyManager;

  constructor(vocabulary: VocabularyManager) {
    this.vocabulary = vocabulary;
  }

  /**
   * Parse JavaScript/TypeScript source code
   */
  parseSource(code: string): t.File {
    try {
      return parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'asyncGenerators'],
      });
    } catch (error) {
      throw new Error(`Failed to parse code: ${(error as Error).message}`);
    }
  }

  /**
   * Extract all functions from source code
   */
  extractFunctions(code: string): Array<{ node: t.Function; metadata: FunctionMetadata }> {
    const ast = this.parseSource(code);
    const functions: Array<{ node: t.Function; metadata: FunctionMetadata }> = [];

    traverse(ast, {
      // Function declarations: function foo() {}
      FunctionDeclaration(path) {
        const node = path.node;
        functions.push({
          node,
          metadata: this.extractFunctionMetadata(node, path),
        });
      },

      // Function expressions: const foo = function() {}
      FunctionExpression(path) {
        const node = path.node;
        // Only process if it's assigned to a variable
        const parent = path.parent;
        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
          functions.push({
            node,
            metadata: this.extractFunctionMetadata(node, path, parent.id.name),
          });
        }
      },

      // Arrow functions: const foo = () => {}
      ArrowFunctionExpression(path) {
        const node = path.node;
        const parent = path.parent;
        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
          functions.push({
            node,
            metadata: this.extractFunctionMetadata(node, path, parent.id.name),
          });
        }
      },

      // Class methods
      ClassMethod(path) {
        const node = path.node;
        if (t.isIdentifier(node.key)) {
          functions.push({
            node: node as any, // ClassMethod extends Function conceptually
            metadata: this.extractFunctionMetadata(node as any, path),
          });
        }
      },

      // Object methods: { foo() {} }
      ObjectMethod(path) {
        const node = path.node;
        if (t.isIdentifier(node.key)) {
          functions.push({
            node: node as any,
            metadata: this.extractFunctionMetadata(node as any, path),
          });
        }
      },
    });

    return functions;
  }

  /**
   * Analyze a function and extract semantic concepts
   */
  analyzeFunction(functionNode: t.Function, metadata?: FunctionMetadata): ParseResult {
    const meta = metadata || this.extractFunctionMetadata(functionNode as any, null as any);

    // Extract intent from function name and docstring
    const intent = this.extractIntentConcepts(meta);

    // Extract execution from function body
    const { concepts: execution, executionMap } = this.extractExecutionConcepts(functionNode);

    return {
      intent,
      execution,
      executionMap,
      metadata: meta,
    };
  }

  /**
   * Extract metadata from a function node
   */
  private extractFunctionMetadata(
    node: t.Function,
    path: NodePath<any> | null,
    explicitName?: string
  ): FunctionMetadata {
    let name = explicitName || 'anonymous';

    // Try to get name from the function itself
    if ('id' in node && node.id && t.isIdentifier(node.id)) {
      name = node.id.name;
    } else if ('key' in node && t.isIdentifier((node as any).key)) {
      name = ((node as any).key as t.Identifier).name;
    }

    // Extract parameter names
    const params = node.params.map((param) => {
      if (t.isIdentifier(param)) return param.name;
      if (t.isRestElement(param) && t.isIdentifier(param.argument)) return param.argument.name;
      return 'param';
    });

    // Extract docstring (JSDoc comment)
    let docstring: string | undefined;
    if (path && path.node.leadingComments) {
      const jsdocComment = path.node.leadingComments.find((comment) =>
        comment.value.trim().startsWith('*')
      );
      if (jsdocComment) {
        docstring = jsdocComment.value;
      }
    }

    return {
      name,
      params,
      isAsync: node.async || false,
      isGenerator: node.generator || false,
      isArrow: t.isArrowFunctionExpression(node),
      docstring,
      location: node.loc || undefined,
    };
  }

  /**
   * Extract intent concepts from function name and docstring
   */
  private extractIntentConcepts(metadata: FunctionMetadata): string[] {
    const concepts: string[] = [];

    // Add function name
    concepts.push(metadata.name);

    // Add docstring if present
    if (metadata.docstring) {
      // Extract meaningful words from docstring
      const docWords = metadata.docstring
        .replace(/[*\/]/g, '') // Remove comment markers
        .split(/\s+/)
        .filter((word) => word.length > 2); // Filter short words

      concepts.push(...docWords);
    }

    return concepts;
  }

  /**
   * Extract execution concepts from function body
   */
  private extractExecutionConcepts(functionNode: t.Function): {
    concepts: string[];
    executionMap: ExecutionMapping[];
  } {
    const concepts: string[] = [];
    const executionMap: ExecutionMapping[] = [];

    if (!functionNode.body) {
      return { concepts, executionMap };
    }

    // Traverse the function body
    traverse(
      t.file(t.program([t.expressionStatement(t.functionExpression(null, [], functionNode.body))])),
      {
        // Call expressions - map based on the function being called
        CallExpression: (path) => {
          const callee = path.node.callee;
          let calleeName = '';

          if (t.isIdentifier(callee)) {
            calleeName = callee.name;
          } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
            calleeName = callee.property.name;
          }

          if (calleeName) {
            concepts.push(calleeName);
            const dimension = this.vocabulary.getDimension(calleeName);
            if (dimension) {
              executionMap.push({
                node: path.node,
                dimension,
                description: `Call to ${calleeName}`,
              });
            }
          }
        },

        // If statements → JUSTICE (logical control)
        IfStatement: (path) => {
          concepts.push('if', 'conditional', 'check');
          executionMap.push({
            node: path.node,
            dimension: 'justice',
            description: 'Conditional logic',
          });
        },

        // Switch statements → JUSTICE
        SwitchStatement: (path) => {
          concepts.push('switch', 'case', 'conditional');
          executionMap.push({
            node: path.node,
            dimension: 'justice',
            description: 'Switch logic',
          });
        },

        // Loops → JUSTICE (ordering/iteration)
        ForStatement: (path) => {
          concepts.push('for', 'loop', 'iterate');
          executionMap.push({
            node: path.node,
            dimension: 'justice',
            description: 'For loop',
          });
        },

        WhileStatement: (path) => {
          concepts.push('while', 'loop');
          executionMap.push({
            node: path.node,
            dimension: 'justice',
            description: 'While loop',
          });
        },

        // Return statements → WISDOM (providing information)
        ReturnStatement: (path) => {
          concepts.push('return', 'yield');
          executionMap.push({
            node: path.node,
            dimension: 'wisdom',
            description: 'Return value',
          });
        },

        // Throw statements → POWER (forcing an exception)
        ThrowStatement: (path) => {
          concepts.push('throw', 'error');
          executionMap.push({
            node: path.node,
            dimension: 'power',
            description: 'Throw exception',
          });
        },

        // Try/catch → LOVE/JUSTICE (handling errors gracefully)
        TryStatement: (path) => {
          concepts.push('try', 'catch', 'handle');
          executionMap.push({
            node: path.node,
            dimension: 'love', // Exception handling is merciful
            description: 'Error handling',
          });
        },

        // Assignments → POWER (changing state)
        AssignmentExpression: (path) => {
          concepts.push('assign', 'set', 'modify');
          executionMap.push({
            node: path.node,
            dimension: 'power',
            description: 'State mutation',
          });
        },

        // Variable declarations → WISDOM (storing knowledge)
        VariableDeclaration: (path) => {
          concepts.push(path.node.kind); // 'const', 'let', 'var'
          executionMap.push({
            node: path.node,
            dimension: 'wisdom',
            description: `Variable declaration (${path.node.kind})`,
          });
        },

        // Await expressions → WISDOM (waiting for knowledge)
        AwaitExpression: (path) => {
          concepts.push('await', 'async');
          executionMap.push({
            node: path.node,
            dimension: 'wisdom',
            description: 'Await async operation',
          });
        },
      }
    );

    return { concepts, executionMap };
  }

  /**
   * Quick analysis - parse and analyze a single function string
   */
  analyzeCode(code: string, functionName?: string): ParseResult {
    const functions = this.extractFunctions(code);

    if (functions.length === 0) {
      throw new Error('No functions found in code');
    }

    // Use the specified function or the first one
    let targetFunction = functions[0];
    if (functionName) {
      const found = functions.find((f) => f.metadata.name === functionName);
      if (found) targetFunction = found;
    }

    return this.analyzeFunction(targetFunction.node, targetFunction.metadata);
  }
}
