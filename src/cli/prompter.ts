/**
 * Interactive CLI utilities for user prompts
 */

import * as readline from 'readline';
import chalk from 'chalk';

export interface PromptOptions {
  message: string;
  default?: boolean | string;
  choices?: string[];
}

/**
 * Interactive prompt utilities
 */
export class Prompter {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Ask yes/no question
   */
  async confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const fullMessage = `${message} (${defaultText}): `;

    return new Promise((resolve) => {
      this.rl.question(chalk.cyan(fullMessage), (answer) => {
        const input = answer.trim().toLowerCase();

        if (input === '') {
          resolve(defaultValue);
        } else if (input === 'y' || input === 'yes') {
          resolve(true);
        } else if (input === 'n' || input === 'no') {
          resolve(false);
        } else {
          // Invalid input, ask again
          resolve(this.confirm(message, defaultValue));
        }
      });
    });
  }

  /**
   * Ask text input question
   */
  async input(message: string, defaultValue?: string): Promise<string> {
    const defaultText = defaultValue ? ` [${defaultValue}]` : '';
    const fullMessage = `${message}${defaultText}: `;

    return new Promise((resolve) => {
      this.rl.question(chalk.cyan(fullMessage), (answer) => {
        const input = answer.trim();
        resolve(input || defaultValue || '');
      });
    });
  }

  /**
   * Ask multiple choice question
   */
  async choice(message: string, choices: string[], defaultIndex: number = 0): Promise<string> {
    console.log(chalk.cyan(message));
    choices.forEach((choice, i) => {
      const prefix = i === defaultIndex ? '→' : ' ';
      console.log(chalk.gray(`  ${prefix} ${i + 1}. ${choice}`));
    });

    return new Promise((resolve) => {
      this.rl.question(chalk.cyan(`\nChoice (1-${choices.length}): `), (answer) => {
        const input = answer.trim();

        if (input === '') {
          resolve(choices[defaultIndex]);
        } else {
          const index = parseInt(input, 10) - 1;
          if (index >= 0 && index < choices.length) {
            resolve(choices[index]);
          } else {
            console.log(chalk.red('Invalid choice, please try again.\n'));
            resolve(this.choice(message, choices, defaultIndex));
          }
        }
      });
    });
  }

  /**
   * Display progress
   */
  progress(current: number, total: number, message: string = ''): void {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((barLength * current) / total);
    const empty = barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const display = `[${bar}] ${percentage}% (${current}/${total}) ${message}`;

    // Clear line and write progress
    process.stdout.write('\r' + chalk.cyan(display));

    if (current === total) {
      process.stdout.write('\n');
    }
  }

  /**
   * Wait for Enter key
   */
  async waitForEnter(message: string = 'Press ENTER to continue...'): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question(chalk.gray(message), () => {
        resolve();
      });
    });
  }

  /**
   * Close the prompter
   */
  close(): void {
    this.rl.close();
  }
}

/**
 * Create a prompter instance
 */
export function createPrompter(): Prompter {
  return new Prompter();
}
