/**
 * Cache manager for storing analysis results
 * Uses file hashes to detect changes and invalidate cache
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileAnalysisResult } from '../project/project-analyzer';

export interface CacheEntry {
  filePath: string;
  fileHash: string;
  timestamp: number;
  result: FileAnalysisResult;
}

export interface CacheMetadata {
  version: string;
  created: string;
  lastModified: string;
  entries: number;
}

/**
 * Cache manager
 */
export class CacheManager {
  private cacheDir: string;
  private cacheFile: string;
  private metadataFile: string;
  private cache: Map<string, CacheEntry>;
  private version: string = '1.0.0';

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    this.cacheFile = path.join(cacheDir, 'analysis-cache.json');
    this.metadataFile = path.join(cacheDir, 'metadata.json');
    this.cache = new Map();

    this.ensureCacheDir();
    this.loadCache();
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Load cache from disk
   */
  private loadCache(): void {
    if (!fs.existsSync(this.cacheFile)) {
      return;
    }

    try {
      const content = fs.readFileSync(this.cacheFile, 'utf-8');
      const entries: CacheEntry[] = JSON.parse(content);

      for (const entry of entries) {
        this.cache.set(entry.filePath, entry);
      }
    } catch (error) {
      console.warn(
        `⚠️  Failed to load cache: ${error instanceof Error ? error.message : String(error)}`
      );
      this.cache.clear();
    }
  }

  /**
   * Save cache to disk
   */
  saveCache(): void {
    try {
      const entries = Array.from(this.cache.values());
      fs.writeFileSync(this.cacheFile, JSON.stringify(entries, null, 2), 'utf-8');

      // Update metadata
      const metadata: CacheMetadata = {
        version: this.version,
        created: this.getCacheCreationTime(),
        lastModified: new Date().toISOString(),
        entries: entries.length,
      };
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      console.warn(
        `⚠️  Failed to save cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cache creation time
   */
  private getCacheCreationTime(): string {
    if (!fs.existsSync(this.metadataFile)) {
      return new Date().toISOString();
    }

    try {
      const content = fs.readFileSync(this.metadataFile, 'utf-8');
      const metadata: CacheMetadata = JSON.parse(content);
      return metadata.created;
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Calculate hash of file content
   */
  private calculateFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      throw new Error(
        `Failed to calculate hash for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if file is in cache and hasn't changed
   */
  has(filePath: string): boolean {
    const entry = this.cache.get(filePath);
    if (!entry) {
      return false;
    }

    try {
      const currentHash = this.calculateFileHash(filePath);
      return currentHash === entry.fileHash;
    } catch {
      // File doesn't exist or can't be read
      return false;
    }
  }

  /**
   * Get cached result for file
   */
  get(filePath: string): FileAnalysisResult | null {
    if (!this.has(filePath)) {
      return null;
    }

    const entry = this.cache.get(filePath);
    return entry ? entry.result : null;
  }

  /**
   * Store result in cache
   */
  set(filePath: string, result: FileAnalysisResult): void {
    try {
      const fileHash = this.calculateFileHash(filePath);

      const entry: CacheEntry = {
        filePath,
        fileHash,
        timestamp: Date.now(),
        result,
      };

      this.cache.set(filePath, entry);
    } catch (error) {
      console.warn(
        `⚠️  Failed to cache result for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Invalidate cache entry for file
   */
  invalidate(filePath: string): void {
    this.cache.delete(filePath);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }
      if (fs.existsSync(this.metadataFile)) {
        fs.unlinkSync(this.metadataFile);
      }
    } catch (error) {
      console.warn(
        `⚠️  Failed to clear cache files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const entries = Array.from(this.cache.values());

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const timestamps = entries.map((e) => e.timestamp);
    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);

    const oldestEntry = entries.find((e) => e.timestamp === oldest);
    const newestEntry = entries.find((e) => e.timestamp === newest);

    // Calculate approximate size
    let totalSize = 0;
    try {
      if (fs.existsSync(this.cacheFile)) {
        totalSize = fs.statSync(this.cacheFile).size;
      }
    } catch {
      // Ignore
    }

    return {
      totalEntries: entries.length,
      totalSize,
      oldestEntry: oldestEntry ? new Date(oldestEntry.timestamp).toISOString() : null,
      newestEntry: newestEntry ? new Date(newestEntry.timestamp).toISOString() : null,
    };
  }

  /**
   * Prune old cache entries (older than maxAge milliseconds)
   */
  prune(maxAge: number): number {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    let pruned = 0;

    for (const [filePath, entry] of entries) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(filePath);
        pruned++;
      }
    }

    if (pruned > 0) {
      this.saveCache();
    }

    return pruned;
  }

  /**
   * Get files that need analysis (not in cache or changed)
   */
  getFilesToAnalyze(allFiles: string[]): { cached: string[]; toAnalyze: string[] } {
    const cached: string[] = [];
    const toAnalyze: string[] = [];

    for (const file of allFiles) {
      if (this.has(file)) {
        cached.push(file);
      } else {
        toAnalyze.push(file);
      }
    }

    return { cached, toAnalyze };
  }

  /**
   * Import cache from another location
   */
  import(sourcePath: string): number {
    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source cache file does not exist: ${sourcePath}`);
      }

      const content = fs.readFileSync(sourcePath, 'utf-8');
      const entries: CacheEntry[] = JSON.parse(content);

      let imported = 0;
      for (const entry of entries) {
        // Only import if file exists and hash matches
        if (fs.existsSync(entry.filePath)) {
          try {
            const currentHash = this.calculateFileHash(entry.filePath);
            if (currentHash === entry.fileHash) {
              this.cache.set(entry.filePath, entry);
              imported++;
            }
          } catch {
            // Skip invalid entries
          }
        }
      }

      if (imported > 0) {
        this.saveCache();
      }

      return imported;
    } catch (error) {
      throw new Error(
        `Failed to import cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Export cache to another location
   */
  export(targetPath: string): void {
    try {
      const entries = Array.from(this.cache.values());
      fs.writeFileSync(targetPath, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to export cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
