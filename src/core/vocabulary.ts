/**
 * Programming Vocabulary - Maps verbs and keywords to LJPW dimensions
 *
 * This module contains comprehensive mappings of programming verbs,
 * keywords, and concepts to their semantic dimensions.
 */

import { Coordinates } from './coordinates';

export type Dimension = 'love' | 'justice' | 'power' | 'wisdom';

/**
 * Programming verbs mapped to LJPW dimensions
 * Total: 190+ verbs across 4 dimensions
 */
export const PROGRAMMING_VERBS: Record<string, Dimension> = {
  // WISDOM (Information & Knowledge) - 42 verbs
  get: 'wisdom',
  fetch: 'wisdom',
  read: 'wisdom',
  load: 'wisdom',
  retrieve: 'wisdom',
  query: 'wisdom',
  find: 'wisdom',
  search: 'wisdom',
  locate: 'wisdom',
  lookup: 'wisdom',
  calculate: 'wisdom',
  compute: 'wisdom',
  analyze: 'wisdom',
  evaluate: 'wisdom',
  assess: 'wisdom',
  measure: 'wisdom',
  count: 'wisdom',
  parse: 'wisdom',
  interpret: 'wisdom',
  decode: 'wisdom',
  understand: 'wisdom',
  represent: 'wisdom',
  return: 'wisdom',
  yield: 'wisdom',
  provide: 'wisdom',
  supply: 'wisdom',
  deliver: 'wisdom',
  extract: 'wisdom',
  derive: 'wisdom',
  infer: 'wisdom',
  deduce: 'wisdom',
  resolve: 'wisdom',
  determine: 'wisdom',
  identify: 'wisdom',
  recognize: 'wisdom',
  detect: 'wisdom',
  discover: 'wisdom',
  observe: 'wisdom',
  monitor: 'wisdom',
  track: 'wisdom',
  serialize: 'wisdom',
  deserialize: 'wisdom',

  // JUSTICE (Correctness & Validation) - 52 verbs
  validate: 'justice',
  verify: 'justice',
  check: 'justice',
  test: 'justice',
  ensure: 'justice',
  confirm: 'justice',
  assert: 'justice',
  require: 'justice',
  expect: 'justice',
  enforce: 'justice',
  guard: 'justice',
  protect: 'justice',
  secure: 'justice',
  authorize: 'justice',
  authenticate: 'justice',
  permit: 'justice',
  allow: 'justice',
  deny: 'justice',
  reject: 'justice',
  accept: 'justice',
  approve: 'justice',
  compare: 'justice',
  match: 'justice',
  equal: 'justice',
  differ: 'justice',
  filter: 'justice',
  select: 'justice',
  exclude: 'justice',
  include: 'justice',
  order: 'justice',
  sort: 'justice',
  arrange: 'justice',
  organize: 'justice',
  structure: 'justice',
  format: 'justice',
  normalize: 'justice',
  sanitize: 'justice',
  escape: 'justice',
  unescape: 'justice',
  encode: 'justice',
  limit: 'justice',
  constrain: 'justice',
  restrict: 'justice',
  bound: 'justice',
  clamp: 'justice',
  throttle: 'justice',
  debounce: 'justice',
  batch: 'justice',
  group: 'justice',
  partition: 'justice',
  split: 'justice',
  slice: 'justice',

  // POWER (Action & Transformation) - 62 verbs
  create: 'power',
  build: 'power',
  generate: 'power',
  make: 'power',
  construct: 'power',
  initialize: 'power',
  init: 'power',
  setup: 'power',
  configure: 'power',
  modify: 'power',
  update: 'power',
  change: 'power',
  transform: 'power',
  convert: 'power',
  mutate: 'power',
  alter: 'power',
  edit: 'power',
  revise: 'power',
  delete: 'power',
  remove: 'power',
  destroy: 'power',
  erase: 'power',
  clear: 'power',
  reset: 'power',
  purge: 'power',
  save: 'power',
  store: 'power',
  persist: 'power',
  write: 'power',
  insert: 'power',
  append: 'power',
  prepend: 'power',
  push: 'power',
  pop: 'power',
  shift: 'power',
  unshift: 'power',
  execute: 'power',
  run: 'power',
  perform: 'power',
  trigger: 'power',
  fire: 'power',
  emit: 'power',
  dispatch: 'power',
  invoke: 'power',
  call: 'power',
  apply: 'power',
  start: 'power',
  stop: 'power',
  pause: 'power',
  resume: 'power',
  restart: 'power',
  kill: 'power',
  terminate: 'power',
  abort: 'power',
  cancel: 'power',
  set: 'power',
  unset: 'power',
  toggle: 'power',
  enable: 'power',
  disable: 'power',
  activate: 'power',
  deactivate: 'power',

  // LOVE (Communication & Connection) - 52 verbs
  connect: 'love',
  disconnect: 'love',
  link: 'love',
  unlink: 'love',
  bind: 'love',
  unbind: 'love',
  attach: 'love',
  detach: 'love',
  join: 'love',
  leave: 'love',
  merge: 'love',
  combine: 'love',
  unite: 'love',
  integrate: 'love',
  compose: 'love',
  assemble: 'love',
  aggregate: 'love',
  collect: 'love',
  gather: 'love',
  accumulate: 'love',
  send: 'love',
  receive: 'love',
  notify: 'love',
  inform: 'love',
  alert: 'love',
  warn: 'love',
  communicate: 'love',
  broadcast: 'love',
  publish: 'love',
  subscribe: 'love',
  unsubscribe: 'love',
  listen: 'love',
  emit: 'love',
  signal: 'love',
  print: 'love',
  display: 'love',
  show: 'love',
  hide: 'love',
  present: 'love',
  render: 'love',
  output: 'love',
  log: 'love',
  add: 'love',
  extend: 'love',
  augment: 'love',
  enhance: 'love',
  enrich: 'love',
  decorate: 'love',
  wrap: 'love',
  unwrap: 'love',
  handle: 'love',
  catch: 'love',
};

/**
 * Compound patterns for context-specific mappings
 * These override single-verb mappings when the full pattern matches
 */
export const COMPOUND_PATTERNS: Record<string, Dimension> = {
  // Wisdom patterns
  get_data: 'wisdom',
  fetch_data: 'wisdom',
  read_file: 'wisdom',
  load_config: 'wisdom',
  query_database: 'wisdom',
  find_by_id: 'wisdom',
  search_results: 'wisdom',
  calculate_total: 'wisdom',
  parse_json: 'wisdom',
  return_value: 'wisdom',

  // Justice patterns
  validate_input: 'justice',
  verify_token: 'justice',
  check_permission: 'justice',
  test_condition: 'justice',
  assert_equal: 'justice',
  compare_values: 'justice',
  filter_items: 'justice',
  sort_array: 'justice',
  normalize_data: 'justice',
  sanitize_input: 'justice',

  // Power patterns
  create_user: 'power',
  build_object: 'power',
  generate_id: 'power',
  initialize_app: 'power',
  update_record: 'power',
  modify_state: 'power',
  delete_file: 'power',
  save_changes: 'power',
  execute_command: 'power',
  trigger_event: 'power',

  // Love patterns
  connect_to_server: 'love',
  send_notification: 'love',
  notify_user: 'love',
  broadcast_message: 'love',
  publish_event: 'love',
  subscribe_to_channel: 'love',
  render_component: 'love',
  display_result: 'love',
  handle_error: 'love',
  catch_exception: 'love',
};

/**
 * JavaScript/TypeScript keywords and constructs mapped to dimensions
 */
export const LANGUAGE_KEYWORDS: Record<string, Dimension> = {
  // Wisdom (data and knowledge)
  const: 'wisdom',
  let: 'wisdom',
  var: 'wisdom',
  return: 'wisdom',
  yield: 'wisdom',
  await: 'wisdom',
  import: 'wisdom',
  export: 'wisdom',
  typeof: 'wisdom',
  instanceof: 'wisdom',

  // Justice (logic and validation)
  if: 'justice',
  else: 'justice',
  switch: 'justice',
  case: 'justice',
  default: 'justice',
  while: 'justice',
  for: 'justice',
  break: 'justice',
  continue: 'justice',

  // Power (actions and effects)
  function: 'power',
  class: 'power',
  new: 'power',
  delete: 'power',
  throw: 'power',
  async: 'power',

  // Love (relationships and handling)
  try: 'love',
  catch: 'love',
  finally: 'love',
  extends: 'love',
  implements: 'love',
  with: 'love',
};

/**
 * VocabularyManager - Central authority for semantic mappings
 */
export class VocabularyManager {
  private verbCache: Map<string, Dimension> = new Map();
  private textAnalysisCache: Map<string, Coordinates> = new Map();
  private customVocabulary: Map<string, Dimension> = new Map();

  constructor(customVocabulary?: Record<string, Dimension>) {
    if (customVocabulary) {
      Object.entries(customVocabulary).forEach(([word, dim]) => {
        this.customVocabulary.set(word.toLowerCase(), dim);
      });
    }
  }

  /**
   * Get the dimension for a word (verb, keyword, or custom)
   * Returns null if word is not in vocabulary
   */
  getDimension(word: string): Dimension | null {
    const lowerWord = word.toLowerCase();

    // Check cache first
    if (this.verbCache.has(lowerWord)) {
      return this.verbCache.get(lowerWord)!;
    }

    // Check custom vocabulary
    if (this.customVocabulary.has(lowerWord)) {
      const dim = this.customVocabulary.get(lowerWord)!;
      this.verbCache.set(lowerWord, dim);
      return dim;
    }

    // Check compound patterns
    if (lowerWord in COMPOUND_PATTERNS) {
      const dim = COMPOUND_PATTERNS[lowerWord];
      this.verbCache.set(lowerWord, dim);
      return dim;
    }

    // Check programming verbs
    if (lowerWord in PROGRAMMING_VERBS) {
      const dim = PROGRAMMING_VERBS[lowerWord];
      this.verbCache.set(lowerWord, dim);
      return dim;
    }

    // Check language keywords
    if (lowerWord in LANGUAGE_KEYWORDS) {
      const dim = LANGUAGE_KEYWORDS[lowerWord];
      this.verbCache.set(lowerWord, dim);
      return dim;
    }

    return null;
  }

  /**
   * Analyze text and return semantic coordinates
   * Counts occurrences of each dimension and normalizes
   */
  analyzeText(text: string): Coordinates {
    // Check cache
    if (this.textAnalysisCache.has(text)) {
      return this.textAnalysisCache.get(text)!;
    }

    // Extract words (split on non-alphanumeric, underscore, or camelCase boundaries)
    const words = this.extractWords(text);

    // Count dimension occurrences
    const counts = {
      love: 0,
      justice: 0,
      power: 0,
      wisdom: 0,
    };

    for (const word of words) {
      const dim = this.getDimension(word);
      if (dim) {
        counts[dim]++;
      }
    }

    // Create coordinates (will auto-normalize)
    const coords = new Coordinates(counts.love, counts.justice, counts.power, counts.wisdom);

    // Cache result
    this.textAnalysisCache.set(text, coords);

    return coords;
  }

  /**
   * Extract individual words from text
   * Handles snake_case, camelCase, and regular spaces
   */
  private extractWords(text: string): string[] {
    // Split on underscores, spaces, and camelCase boundaries
    const words: string[] = [];

    // Handle snake_case
    let current = text.replace(/_/g, ' ');

    // Handle camelCase and PascalCase
    current = current.replace(/([a-z])([A-Z])/g, '$1 $2');
    current = current.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

    // Split on whitespace and filter empty strings
    const parts = current.split(/\s+/).filter((w) => w.length > 0);

    for (const part of parts) {
      words.push(part.toLowerCase());
    }

    return words;
  }

  /**
   * Analyze a concept cluster (array of words/concepts)
   * Returns aggregated coordinates for the entire cluster
   */
  analyzeConceptCluster(concepts: string[]): Coordinates {
    const allCounts = {
      love: 0,
      justice: 0,
      power: 0,
      wisdom: 0,
    };

    for (const concept of concepts) {
      const words = this.extractWords(concept);
      for (const word of words) {
        const dim = this.getDimension(word);
        if (dim) {
          allCounts[dim]++;
        }
      }
    }

    return new Coordinates(allCounts.love, allCounts.justice, allCounts.power, allCounts.wisdom);
  }

  /**
   * Clear caches (useful for testing or when vocabulary changes)
   */
  clearCache(): void {
    this.verbCache.clear();
    this.textAnalysisCache.clear();
  }

  /**
   * Get all known verbs for a specific dimension
   */
  getVerbsForDimension(dimension: Dimension): string[] {
    return Object.entries(PROGRAMMING_VERBS)
      .filter(([_, dim]) => dim === dimension)
      .map(([verb, _]) => verb);
  }

  /**
   * Get statistics about the vocabulary
   */
  getVocabularyStats(): {
    totalVerbs: number;
    totalCompoundPatterns: number;
    totalKeywords: number;
    verbsPerDimension: Record<Dimension, number>;
  } {
    const verbsPerDimension = {
      love: 0,
      justice: 0,
      power: 0,
      wisdom: 0,
    };

    Object.values(PROGRAMMING_VERBS).forEach((dim) => {
      verbsPerDimension[dim]++;
    });

    return {
      totalVerbs: Object.keys(PROGRAMMING_VERBS).length,
      totalCompoundPatterns: Object.keys(COMPOUND_PATTERNS).length,
      totalKeywords: Object.keys(LANGUAGE_KEYWORDS).length,
      verbsPerDimension,
    };
  }
}
