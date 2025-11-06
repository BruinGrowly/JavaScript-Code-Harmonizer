/**
 * Semantic Naming Engine
 *
 * Suggests better function names based on what code actually does.
 * Uses cosine similarity to match execution semantics with action verbs.
 */

import { Coordinates } from '../core/coordinates';

/**
 * Action verb with its semantic coordinates
 */
export interface ActionVerb {
  verb: string;
  coordinates: Coordinates;
  category?: string;
}

/**
 * Naming suggestion with similarity score
 */
export interface NamingSuggestion {
  name: string;
  similarity: number;
  verb: string;
  category?: string;
}

/**
 * SemanticNamingEngine - Suggests function names based on execution semantics
 */
export class SemanticNamingEngine {
  private actionVerbs: Map<string, Coordinates> = new Map();
  private verbCategories: Map<string, string> = new Map();

  constructor() {
    this.initializeActionVerbs();
  }

  /**
   * Initialize 260+ action verbs with their LJPW coordinates
   */
  private initializeActionVerbs(): void {
    // WISDOM-DOMINANT VERBS (Information & Analysis) - 65 verbs
    const wisdomVerbs: Record<string, [number, number, number, number]> = {
      // Retrieval
      get: [0.05, 0.1, 0.1, 0.75],
      fetch: [0.05, 0.1, 0.1, 0.75],
      retrieve: [0.05, 0.1, 0.1, 0.75],
      obtain: [0.05, 0.1, 0.1, 0.75],
      acquire: [0.05, 0.1, 0.15, 0.7],
      read: [0.05, 0.05, 0.05, 0.85],
      load: [0.05, 0.1, 0.15, 0.7],
      query: [0.05, 0.15, 0.05, 0.75],
      find: [0.05, 0.15, 0.05, 0.75],
      search: [0.05, 0.15, 0.05, 0.75],
      lookup: [0.05, 0.1, 0.05, 0.8],
      locate: [0.05, 0.15, 0.05, 0.75],

      // Computation
      calculate: [0.05, 0.1, 0.1, 0.75],
      compute: [0.05, 0.1, 0.1, 0.75],
      evaluate: [0.05, 0.15, 0.05, 0.75],
      assess: [0.05, 0.15, 0.05, 0.75],
      measure: [0.05, 0.1, 0.05, 0.8],
      count: [0.05, 0.05, 0.05, 0.85],
      sum: [0.05, 0.05, 0.05, 0.85],
      total: [0.05, 0.05, 0.05, 0.85],

      // Analysis
      analyze: [0.05, 0.15, 0.05, 0.75],
      examine: [0.05, 0.15, 0.05, 0.75],
      inspect: [0.05, 0.2, 0.05, 0.7],
      review: [0.05, 0.15, 0.05, 0.75],
      scan: [0.05, 0.1, 0.05, 0.8],
      check: [0.05, 0.3, 0.05, 0.6],
      detect: [0.05, 0.2, 0.05, 0.7],
      identify: [0.05, 0.15, 0.05, 0.75],
      recognize: [0.05, 0.15, 0.05, 0.75],
      discover: [0.05, 0.1, 0.05, 0.8],

      // Interpretation
      parse: [0.05, 0.1, 0.1, 0.75],
      interpret: [0.05, 0.15, 0.05, 0.75],
      decode: [0.05, 0.1, 0.1, 0.75],
      decipher: [0.05, 0.1, 0.1, 0.75],
      understand: [0.05, 0.1, 0.05, 0.8],

      // Extraction
      extract: [0.05, 0.1, 0.15, 0.7],
      derive: [0.05, 0.15, 0.1, 0.7],
      deduce: [0.05, 0.2, 0.05, 0.7],
      infer: [0.05, 0.2, 0.05, 0.7],
      determine: [0.05, 0.2, 0.05, 0.7],
      resolve: [0.05, 0.2, 0.1, 0.65],

      // Observation
      observe: [0.05, 0.1, 0.05, 0.8],
      monitor: [0.1, 0.15, 0.05, 0.7],
      track: [0.1, 0.15, 0.05, 0.7],
      watch: [0.05, 0.1, 0.05, 0.8],
      trace: [0.05, 0.15, 0.05, 0.75],

      // Serialization
      serialize: [0.05, 0.1, 0.1, 0.75],
      deserialize: [0.05, 0.1, 0.1, 0.75],
      encode: [0.05, 0.15, 0.1, 0.7],
      decode_data: [0.05, 0.1, 0.1, 0.75],

      // Return/Provide
      return_value: [0.05, 0.05, 0.05, 0.85],
      provide: [0.15, 0.05, 0.1, 0.7],
      supply: [0.15, 0.05, 0.1, 0.7],
      deliver: [0.15, 0.05, 0.15, 0.65],
      yield: [0.05, 0.05, 0.1, 0.8],

      // Conversion
      convert: [0.05, 0.1, 0.15, 0.7],
      transform_data: [0.05, 0.1, 0.15, 0.7],
      map: [0.05, 0.1, 0.1, 0.75],
      reduce: [0.05, 0.1, 0.1, 0.75],
      filter_data: [0.05, 0.25, 0.05, 0.65],
    };

    // JUSTICE-DOMINANT VERBS (Validation & Ordering) - 68 verbs
    const justiceVerbs: Record<string, [number, number, number, number]> = {
      // Validation
      validate: [0.1, 0.8, 0.05, 0.05],
      verify: [0.1, 0.75, 0.1, 0.05],
      check: [0.05, 0.8, 0.1, 0.05],
      test: [0.05, 0.75, 0.15, 0.05],
      ensure: [0.1, 0.75, 0.1, 0.05],
      confirm: [0.1, 0.75, 0.05, 0.1],
      assert: [0.05, 0.85, 0.05, 0.05],
      require: [0.05, 0.8, 0.1, 0.05],
      expect: [0.05, 0.8, 0.05, 0.1],
      guarantee: [0.1, 0.75, 0.1, 0.05],

      // Enforcement
      enforce: [0.05, 0.75, 0.15, 0.05],
      guard: [0.1, 0.7, 0.15, 0.05],
      protect: [0.15, 0.65, 0.15, 0.05],
      secure: [0.1, 0.7, 0.15, 0.05],
      safeguard: [0.15, 0.65, 0.15, 0.05],

      // Authorization
      authorize: [0.05, 0.75, 0.15, 0.05],
      authenticate: [0.05, 0.8, 0.1, 0.05],
      permit: [0.1, 0.7, 0.15, 0.05],
      allow: [0.15, 0.65, 0.15, 0.05],
      deny: [0.05, 0.7, 0.2, 0.05],
      reject: [0.05, 0.7, 0.2, 0.05],
      accept: [0.15, 0.65, 0.15, 0.05],
      approve: [0.1, 0.7, 0.15, 0.05],
      disapprove: [0.05, 0.7, 0.2, 0.05],

      // Comparison
      compare: [0.05, 0.75, 0.05, 0.15],
      match: [0.05, 0.75, 0.05, 0.15],
      equal: [0.05, 0.8, 0.05, 0.1],
      differ: [0.05, 0.75, 0.05, 0.15],
      contrast: [0.05, 0.75, 0.05, 0.15],

      // Filtering
      filter: [0.05, 0.7, 0.05, 0.2],
      select: [0.05, 0.65, 0.1, 0.2],
      exclude: [0.05, 0.7, 0.15, 0.1],
      include: [0.15, 0.6, 0.15, 0.1],
      reject_items: [0.05, 0.7, 0.2, 0.05],
      accept_items: [0.15, 0.65, 0.15, 0.05],

      // Ordering
      order: [0.05, 0.75, 0.1, 0.1],
      sort: [0.05, 0.75, 0.1, 0.1],
      arrange: [0.1, 0.7, 0.15, 0.05],
      organize: [0.15, 0.65, 0.15, 0.05],
      structure: [0.1, 0.7, 0.15, 0.05],
      rank: [0.05, 0.75, 0.1, 0.1],
      prioritize: [0.1, 0.7, 0.1, 0.1],

      // Formatting
      format: [0.05, 0.7, 0.15, 0.1],
      normalize: [0.05, 0.75, 0.15, 0.05],
      sanitize: [0.05, 0.75, 0.15, 0.05],
      escape: [0.05, 0.75, 0.15, 0.05],
      unescape: [0.05, 0.7, 0.15, 0.1],
      clean: [0.05, 0.7, 0.2, 0.05],

      // Constraints
      limit: [0.05, 0.75, 0.15, 0.05],
      constrain: [0.05, 0.75, 0.15, 0.05],
      restrict: [0.05, 0.75, 0.15, 0.05],
      bound: [0.05, 0.75, 0.15, 0.05],
      clamp: [0.05, 0.75, 0.15, 0.05],
      cap: [0.05, 0.75, 0.15, 0.05],

      // Batching
      throttle: [0.05, 0.7, 0.2, 0.05],
      debounce: [0.05, 0.7, 0.2, 0.05],
      batch: [0.1, 0.65, 0.15, 0.1],
      group: [0.15, 0.6, 0.15, 0.1],
      partition: [0.05, 0.7, 0.15, 0.1],
      split: [0.05, 0.65, 0.2, 0.1],
      slice: [0.05, 0.65, 0.15, 0.15],
    };

    // POWER-DOMINANT VERBS (Action & Transformation) - 72 verbs
    const powerVerbs: Record<string, [number, number, number, number]> = {
      // Creation
      create: [0.05, 0.1, 0.8, 0.05],
      build: [0.1, 0.1, 0.75, 0.05],
      generate: [0.05, 0.1, 0.8, 0.05],
      make: [0.05, 0.05, 0.85, 0.05],
      construct: [0.1, 0.15, 0.7, 0.05],
      produce: [0.05, 0.1, 0.8, 0.05],
      spawn: [0.05, 0.05, 0.85, 0.05],
      instantiate: [0.05, 0.1, 0.8, 0.05],

      // Initialization
      initialize: [0.05, 0.1, 0.75, 0.1],
      init: [0.05, 0.1, 0.75, 0.1],
      setup: [0.1, 0.15, 0.7, 0.05],
      configure: [0.05, 0.15, 0.7, 0.1],
      prepare: [0.1, 0.15, 0.7, 0.05],
      bootstrap: [0.05, 0.1, 0.8, 0.05],

      // Modification
      modify: [0.05, 0.1, 0.8, 0.05],
      update: [0.05, 0.1, 0.8, 0.05],
      change: [0.05, 0.05, 0.85, 0.05],
      alter: [0.05, 0.1, 0.8, 0.05],
      edit: [0.05, 0.1, 0.75, 0.1],
      revise: [0.05, 0.15, 0.75, 0.05],
      amend: [0.05, 0.15, 0.75, 0.05],
      adjust: [0.05, 0.15, 0.75, 0.05],
      tune: [0.05, 0.15, 0.7, 0.1],

      // Transformation
      transform: [0.05, 0.1, 0.75, 0.1],
      convert: [0.05, 0.1, 0.75, 0.1],
      mutate: [0.05, 0.05, 0.85, 0.05],
      morph: [0.05, 0.05, 0.85, 0.05],
      reshape: [0.05, 0.1, 0.8, 0.05],

      // Deletion
      delete: [0.05, 0.1, 0.8, 0.05],
      remove: [0.05, 0.1, 0.8, 0.05],
      destroy: [0.05, 0.05, 0.85, 0.05],
      erase: [0.05, 0.05, 0.85, 0.05],
      clear: [0.05, 0.1, 0.8, 0.05],
      reset: [0.05, 0.1, 0.8, 0.05],
      purge: [0.05, 0.1, 0.8, 0.05],
      wipe: [0.05, 0.05, 0.85, 0.05],

      // Storage
      save: [0.05, 0.1, 0.75, 0.1],
      store: [0.05, 0.1, 0.75, 0.1],
      persist: [0.05, 0.15, 0.7, 0.1],
      write: [0.05, 0.1, 0.8, 0.05],
      insert: [0.05, 0.1, 0.8, 0.05],
      append: [0.1, 0.05, 0.8, 0.05],
      prepend: [0.05, 0.05, 0.85, 0.05],
      push: [0.05, 0.05, 0.85, 0.05],
      pop: [0.05, 0.05, 0.85, 0.05],

      // Execution
      execute: [0.05, 0.1, 0.8, 0.05],
      run: [0.05, 0.05, 0.85, 0.05],
      perform: [0.05, 0.1, 0.8, 0.05],
      invoke: [0.05, 0.1, 0.8, 0.05],
      call: [0.05, 0.05, 0.85, 0.05],
      apply: [0.05, 0.1, 0.8, 0.05],
      trigger: [0.05, 0.05, 0.85, 0.05],
      fire: [0.05, 0.05, 0.85, 0.05],
      launch: [0.05, 0.1, 0.8, 0.05],

      // Control
      start: [0.05, 0.1, 0.8, 0.05],
      stop: [0.05, 0.1, 0.8, 0.05],
      pause: [0.05, 0.1, 0.8, 0.05],
      resume: [0.05, 0.1, 0.8, 0.05],
      restart: [0.05, 0.1, 0.8, 0.05],
      kill: [0.05, 0.05, 0.85, 0.05],
      terminate: [0.05, 0.1, 0.8, 0.05],
      abort: [0.05, 0.1, 0.8, 0.05],
      cancel: [0.05, 0.15, 0.75, 0.05],

      // State
      set: [0.05, 0.1, 0.8, 0.05],
      unset: [0.05, 0.1, 0.8, 0.05],
      toggle: [0.05, 0.1, 0.8, 0.05],
      enable: [0.05, 0.15, 0.75, 0.05],
      disable: [0.05, 0.15, 0.75, 0.05],
      activate: [0.05, 0.1, 0.8, 0.05],
      deactivate: [0.05, 0.1, 0.8, 0.05],
    };

    // LOVE-DOMINANT VERBS (Communication & Connection) - 62 verbs
    const loveVerbs: Record<string, [number, number, number, number]> = {
      // Connection
      connect: [0.75, 0.1, 0.1, 0.05],
      disconnect: [0.7, 0.1, 0.15, 0.05],
      link: [0.75, 0.15, 0.05, 0.05],
      unlink: [0.7, 0.15, 0.1, 0.05],
      bind: [0.7, 0.15, 0.1, 0.05],
      unbind: [0.7, 0.15, 0.1, 0.05],
      attach: [0.75, 0.1, 0.1, 0.05],
      detach: [0.7, 0.1, 0.15, 0.05],
      join: [0.75, 0.1, 0.1, 0.05],
      leave: [0.7, 0.1, 0.15, 0.05],

      // Integration
      merge: [0.7, 0.1, 0.15, 0.05],
      combine: [0.7, 0.1, 0.15, 0.05],
      unite: [0.75, 0.1, 0.1, 0.05],
      integrate: [0.7, 0.15, 0.1, 0.05],
      compose: [0.65, 0.15, 0.15, 0.05],
      assemble: [0.65, 0.15, 0.15, 0.05],
      aggregate: [0.65, 0.15, 0.1, 0.1],
      collect: [0.65, 0.1, 0.15, 0.1],
      gather: [0.7, 0.1, 0.15, 0.05],
      accumulate: [0.65, 0.1, 0.1, 0.15],

      // Communication
      send: [0.75, 0.05, 0.15, 0.05],
      receive: [0.7, 0.05, 0.05, 0.2],
      notify: [0.8, 0.05, 0.1, 0.05],
      inform: [0.75, 0.05, 0.05, 0.15],
      alert: [0.8, 0.1, 0.05, 0.05],
      warn: [0.75, 0.15, 0.05, 0.05],
      communicate: [0.8, 0.05, 0.1, 0.05],
      broadcast: [0.8, 0.05, 0.1, 0.05],
      announce: [0.8, 0.05, 0.1, 0.05],

      // Pub/Sub
      publish: [0.75, 0.05, 0.15, 0.05],
      subscribe: [0.75, 0.1, 0.1, 0.05],
      unsubscribe: [0.7, 0.1, 0.15, 0.05],
      listen: [0.75, 0.05, 0.05, 0.15],
      emit: [0.75, 0.05, 0.15, 0.05],
      signal: [0.75, 0.05, 0.15, 0.05],
      dispatch: [0.7, 0.1, 0.15, 0.05],

      // Display
      print: [0.7, 0.05, 0.1, 0.15],
      display: [0.75, 0.05, 0.1, 0.1],
      show: [0.75, 0.05, 0.15, 0.05],
      hide: [0.7, 0.1, 0.15, 0.05],
      present: [0.75, 0.05, 0.15, 0.05],
      render: [0.65, 0.1, 0.2, 0.05],
      output: [0.7, 0.05, 0.1, 0.15],
      log: [0.65, 0.1, 0.1, 0.15],

      // Enhancement
      add: [0.7, 0.05, 0.2, 0.05],
      extend: [0.7, 0.1, 0.15, 0.05],
      augment: [0.7, 0.1, 0.15, 0.05],
      enhance: [0.7, 0.1, 0.15, 0.05],
      enrich: [0.7, 0.1, 0.15, 0.05],
      decorate: [0.7, 0.1, 0.15, 0.05],
      wrap: [0.7, 0.15, 0.1, 0.05],
      unwrap: [0.65, 0.15, 0.15, 0.05],

      // Error Handling
      handle: [0.75, 0.15, 0.05, 0.05],
      catch: [0.75, 0.15, 0.05, 0.05],
      recover: [0.7, 0.15, 0.1, 0.05],
      rescue: [0.75, 0.15, 0.05, 0.05],
      retry: [0.65, 0.15, 0.15, 0.05],
      fallback: [0.7, 0.15, 0.1, 0.05],
    };

    // Add all verbs to the map
    const addVerbs = (verbs: Record<string, [number, number, number, number]>, category: string) => {
      Object.entries(verbs).forEach(([verb, [l, j, p, w]]) => {
        this.actionVerbs.set(verb, new Coordinates(l, j, p, w));
        this.verbCategories.set(verb, category);
      });
    };

    addVerbs(wisdomVerbs, 'wisdom');
    addVerbs(justiceVerbs, 'justice');
    addVerbs(powerVerbs, 'power');
    addVerbs(loveVerbs, 'love');
  }

  /**
   * Suggest function names based on execution coordinates
   *
   * @param executionCoords - Semantic coordinates of what the code actually does
   * @param context - Optional context (e.g., domain object name like "user", "data")
   * @param topN - Number of suggestions to return
   * @returns Array of naming suggestions sorted by similarity
   */
  suggestNames(
    executionCoords: Coordinates,
    context?: string,
    topN: number = 5
  ): NamingSuggestion[] {
    const suggestions: NamingSuggestion[] = [];

    // Calculate similarity with each action verb
    for (const [verb, verbCoords] of this.actionVerbs.entries()) {
      const similarity = executionCoords.cosineSimilarity(verbCoords);

      let name = verb;
      if (context) {
        // Add context to create compound names
        name = this.createCompoundName(verb, context);
      }

      suggestions.push({
        name,
        similarity,
        verb,
        category: this.verbCategories.get(verb),
      });
    }

    // Sort by similarity (highest first) and return top N
    return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
  }

  /**
   * Create compound function name from verb and context
   * Follows common naming conventions: verbContext or verb_context
   *
   * @param verb - Action verb
   * @param context - Context noun (e.g., "user", "data", "config")
   * @returns Compound function name
   */
  private createCompoundName(verb: string, context: string): string {
    // Handle special cases with underscores
    if (verb.includes('_')) {
      return verb.replace(/_/g, '_') + '_' + context;
    }

    // Standard camelCase: validateUser, getUserData, etc.
    const capitalizedContext = context.charAt(0).toUpperCase() + context.slice(1);
    return verb + capitalizedContext;
  }

  /**
   * Get all available action verbs
   */
  getActionVerbs(): string[] {
    return Array.from(this.actionVerbs.keys());
  }

  /**
   * Get action verbs by category
   */
  getVerbsByCategory(category: 'wisdom' | 'justice' | 'power' | 'love'): string[] {
    return Array.from(this.verbCategories.entries())
      .filter(([_, cat]) => cat === category)
      .map(([verb, _]) => verb);
  }

  /**
   * Get statistics about the naming engine
   */
  getStats(): {
    totalVerbs: number;
    verbsByCategory: Record<string, number>;
  } {
    const verbsByCategory: Record<string, number> = {
      wisdom: 0,
      justice: 0,
      power: 0,
      love: 0,
    };

    for (const category of this.verbCategories.values()) {
      verbsByCategory[category] = (verbsByCategory[category] || 0) + 1;
    }

    return {
      totalVerbs: this.actionVerbs.size,
      verbsByCategory,
    };
  }
}
