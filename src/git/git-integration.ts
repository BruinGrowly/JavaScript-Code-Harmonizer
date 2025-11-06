/**
 * Git Integration
 * Provides git-aware analysis capabilities
 */

import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';

export interface GitDiffOptions {
  /**
   * Base branch to compare against (default: 'main' or 'master')
   */
  base?: string;

  /**
   * Compare with specific commit SHA
   */
  commit?: string;

  /**
   * Include staged files
   */
  staged?: boolean;

  /**
   * Include unstaged files
   */
  unstaged?: boolean;
}

export interface GitBlameInfo {
  author: string;
  email: string;
  date: Date;
  commit: string;
  line: number;
}

export interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  insertions: number;
  deletions: number;
}

/**
 * Git Integration Manager
 */
export class GitIntegration {
  private git: SimpleGit;
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.git = simpleGit(rootPath);
  }

  /**
   * Check if directory is a git repository
   */
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.revparse(['--git-dir']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get default branch name (main or master)
   */
  async getDefaultBranch(): Promise<string> {
    try {
      // Try to get default branch from remote
      const branches = await this.git.branch(['-r']);
      if (branches.all.includes('origin/main')) {
        return 'main';
      }
      if (branches.all.includes('origin/master')) {
        return 'master';
      }

      // Fallback to local branches
      const localBranches = await this.git.branch();
      if (localBranches.all.includes('main')) {
        return 'main';
      }
      return 'master';
    } catch {
      return 'main';
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.branch();
    return branch.current;
  }

  /**
   * Get files changed compared to base branch
   */
  async getChangedFiles(options: GitDiffOptions = {}): Promise<ChangedFile[]> {
    const { base, commit, staged = false, unstaged: _unstaged = true } = options;

    let diffTarget = commit;

    if (!diffTarget) {
      if (staged) {
        diffTarget = '--cached';
      } else if (base) {
        diffTarget = `${base}...HEAD`;
      } else {
        const defaultBranch = await this.getDefaultBranch();
        diffTarget = `${defaultBranch}...HEAD`;
      }
    }

    try {
      const diff = await this.git.diff(['--numstat', diffTarget]);
      const lines = diff.split('\n').filter((line) => line.trim());

      const changedFiles: ChangedFile[] = [];

      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          const insertions = parseInt(parts[0], 10) || 0;
          const deletions = parseInt(parts[1], 10) || 0;
          const filePath = parts[2];

          // Determine status
          let status: ChangedFile['status'] = 'modified';
          if (insertions > 0 && deletions === 0) {
            status = 'added';
          }

          // Filter for JavaScript/TypeScript files
          if (this.isAnalyzableFile(filePath)) {
            changedFiles.push({
              path: path.resolve(this.rootPath, filePath),
              status,
              insertions,
              deletions,
            });
          }
        }
      }

      return changedFiles;
    } catch (error) {
      console.warn('Failed to get git diff:', error);
      return [];
    }
  }

  /**
   * Get git blame information for a file at a specific line
   */
  async getBlame(filePath: string, lineNumber: number): Promise<GitBlameInfo | null> {
    try {
      const relativePath = path.relative(this.rootPath, filePath);
      const blameResult = await this.git.raw([
        'blame',
        '-L',
        `${lineNumber},${lineNumber}`,
        '--porcelain',
        relativePath,
      ]);

      const lines = blameResult.split('\n');
      if (lines.length < 4) {
        return null;
      }

      const commitLine = lines[0].split(' ');
      const commit = commitLine[0];

      let author = '';
      let email = '';
      let timestamp = 0;

      for (const line of lines) {
        if (line.startsWith('author ')) {
          author = line.substring(7);
        } else if (line.startsWith('author-mail ')) {
          email = line.substring(12).replace(/[<>]/g, '');
        } else if (line.startsWith('author-time ')) {
          timestamp = parseInt(line.substring(12), 10);
        }
      }

      return {
        author,
        email,
        date: new Date(timestamp * 1000),
        commit,
        line: lineNumber,
      };
    } catch (error) {
      console.warn(`Failed to get blame for ${filePath}:${lineNumber}:`, error);
      return null;
    }
  }

  /**
   * Get list of commits in current branch compared to base
   */
  async getCommits(base?: string): Promise<any[]> {
    try {
      const defaultBranch = base || (await this.getDefaultBranch());
      const logs = await this.git.log([`${defaultBranch}..HEAD`]);
      return [...logs.all];
    } catch (error) {
      console.warn('Failed to get commits:', error);
      return [];
    }
  }

  /**
   * Check if file has uncommitted changes
   */
  async hasUncommittedChanges(filePath: string): Promise<boolean> {
    try {
      const relativePath = path.relative(this.rootPath, filePath);
      const status = await this.git.status([relativePath]);

      return (
        status.modified.includes(relativePath) ||
        status.not_added.includes(relativePath) ||
        status.created.includes(relativePath)
      );
    } catch {
      return false;
    }
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<{
    currentBranch: string;
    totalCommits: number;
    hasUnpushedCommits: boolean;
    hasUncommittedChanges: boolean;
  }> {
    const currentBranch = await this.getCurrentBranch();
    const logs = await this.git.log();
    const status = await this.git.status();

    return {
      currentBranch,
      totalCommits: logs.total,
      hasUnpushedCommits: status.ahead > 0,
      hasUncommittedChanges:
        status.modified.length > 0 ||
        status.created.length > 0 ||
        status.deleted.length > 0 ||
        status.not_added.length > 0,
    };
  }

  /**
   * Check if file is analyzable (JS/TS)
   */
  private isAnalyzableFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext);
  }

  /**
   * Install git hooks
   */
  async installHooks(options: {
    preCommit?: boolean;
    prePush?: boolean;
    commitMsg?: boolean;
  }): Promise<void> {
    const hooksDir = path.join(this.rootPath, '.git', 'hooks');

    if (!fs.existsSync(hooksDir)) {
      throw new Error('Git hooks directory not found. Is this a git repository?');
    }

    if (options.preCommit) {
      const preCommitPath = path.join(hooksDir, 'pre-commit');
      const preCommitScript = `#!/bin/sh
# Code Harmonizer pre-commit hook

echo "🔍 Running Code Harmonizer analysis on staged files..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|ts|jsx|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No JavaScript/TypeScript files to analyze"
  exit 0
fi

# Run harmonizer on staged files
npx harmonizer analyze --staged --fail-on-high --quiet

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Code Harmonizer found issues. Commit blocked."
  echo "   Run 'harmonizer analyze --staged' to see details"
  echo "   Or use 'git commit --no-verify' to skip this check"
  exit 1
fi

echo "✅ Code Harmonizer passed"
exit 0
`;

      fs.writeFileSync(preCommitPath, preCommitScript, { mode: 0o755 });
      console.log(`✅ Installed pre-commit hook at ${preCommitPath}`);
    }

    if (options.prePush) {
      const prePushPath = path.join(hooksDir, 'pre-push');
      const prePushScript = `#!/bin/sh
# Code Harmonizer pre-push hook

echo "🔍 Running Code Harmonizer analysis on branch changes..."

# Get remote and branch being pushed to
REMOTE="$1"
URL="$2"

# Run harmonizer on changes
npx harmonizer analyze --git-diff origin/main --fail-on-high --quiet

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Code Harmonizer found issues. Push blocked."
  echo "   Run 'harmonizer analyze --git-diff' to see details"
  echo "   Or use 'git push --no-verify' to skip this check"
  exit 1
fi

echo "✅ Code Harmonizer passed"
exit 0
`;

      fs.writeFileSync(prePushPath, prePushScript, { mode: 0o755 });
      console.log(`✅ Installed pre-push hook at ${prePushPath}`);
    }
  }

  /**
   * Uninstall git hooks
   */
  async uninstallHooks(): Promise<void> {
    const hooksDir = path.join(this.rootPath, '.git', 'hooks');

    const hooks = ['pre-commit', 'pre-push', 'commit-msg'];

    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        // Check if it's our hook
        const content = fs.readFileSync(hookPath, 'utf-8');
        if (content.includes('Code Harmonizer')) {
          fs.unlinkSync(hookPath);
          console.log(`✅ Removed ${hook} hook`);
        }
      }
    }
  }
}
