/**
 * Examples command - Interactive examples showcase
 */

import chalk from 'chalk';
import { createPrompter } from '../prompter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const EXAMPLES = [
  {
    title: 'Analyze a single file',
    description: 'Basic analysis of one JavaScript file',
    command: 'harmonizer examples/test-files/buggy-code.js',
    category: 'basics',
  },
  {
    title: 'Analyze project recursively',
    description: 'Scan entire directory and subdirectories',
    command: 'harmonizer ./src --recursive',
    category: 'basics',
  },
  {
    title: 'Generate HTML report',
    description: 'Create beautiful interactive report',
    command: 'harmonizer ./src --format html --output report.html',
    category: 'reports',
  },
  {
    title: 'Watch mode (continuous)',
    description: 'Monitor files and analyze on changes',
    command: 'harmonizer watch ./src',
    category: 'development',
  },
  {
    title: 'CI/CD integration',
    description: 'Fail build on HIGH severity issues',
    command: 'harmonizer ./src --fail-on-high --exit-code',
    category: 'ci-cd',
  },
  {
    title: 'Fix issues interactively',
    description: 'Guided refactoring with suggestions',
    command: 'harmonizer fix ./src --interactive',
    category: 'fixing',
  },
  {
    title: 'Git integration',
    description: 'Analyze only changed files vs main branch',
    command: 'harmonizer --git-diff main',
    category: 'git',
  },
  {
    title: 'With caching (fast)',
    description: 'Use cache for 3.7x speed improvement',
    command: 'harmonizer ./src -r --cache --incremental',
    category: 'performance',
  },
  {
    title: 'Save baseline',
    description: 'Create quality baseline for tracking',
    command: 'harmonizer ./src -r --save-baseline baseline.json',
    category: 'ci-cd',
  },
  {
    title: 'Compare with baseline',
    description: 'Detect quality regressions',
    command: 'harmonizer ./src -r --baseline baseline.json',
    category: 'ci-cd',
  },
  {
    title: 'Explain an issue',
    description: 'Deep dive into why something is flagged',
    command: 'harmonizer explain ./src/user.js:42',
    category: 'learning',
  },
  {
    title: 'Install git hooks',
    description: 'Automatic checks before commit/push',
    command: 'harmonizer install-hooks --pre-commit',
    category: 'git',
  },
];

export async function examplesCommand(category?: string): Promise<void> {
  const prompter = createPrompter();

  try {
    console.log('');
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('               📚 Interactive Examples'));
    console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════'));
    console.log('');

    // Filter by category if provided
    let examples = EXAMPLES;
    if (category) {
      examples = EXAMPLES.filter((e) => e.category === category);
      console.log(chalk.cyan(`Showing examples for: ${category}`));
      console.log('');
    }

    // Group by category
    const categories = new Set(examples.map((e) => e.category));

    for (const cat of categories) {
      const categoryExamples = examples.filter((e) => e.category === cat);

      console.log(chalk.bold(getCategoryTitle(cat)));
      console.log(chalk.gray('─'.repeat(60)));
      console.log('');

      categoryExamples.forEach((example) => {
        const num = EXAMPLES.indexOf(example) + 1;
        console.log(chalk.cyan(`  ${num}. ${example.title}`));
        console.log(chalk.gray(`     ${example.description}`));
        console.log(chalk.white(`     ${chalk.dim('$')} ${example.command}`));
        console.log('');
      });
    }

    console.log(chalk.gray('─'.repeat(60)));
    console.log('');

    // Interactive selection
    const choices = [
      'Run an example',
      'Copy command to clipboard',
      'Show all categories',
      'Exit',
    ];

    const action = await prompter.choice('What would you like to do?', choices, 0);

    if (action === 'Run an example') {
      const exampleNum = await prompter.input('Enter example number (1-' + EXAMPLES.length + ')');
      const num = parseInt(exampleNum, 10);

      if (num >= 1 && num <= EXAMPLES.length) {
        const example = EXAMPLES[num - 1];
        console.log('');
        console.log(chalk.cyan('Running: ') + chalk.white(example.command));
        console.log('');

        const runIt = await prompter.confirm('Execute this command?', true);

        if (runIt) {
          console.log('');
          try {
            const { stdout, stderr } = await execAsync(example.command);
            console.log(stdout);
            if (stderr) console.error(stderr);
          } catch (error: any) {
            console.log(chalk.yellow('⚠️  Command failed (this is expected for some examples)'));
            console.log(chalk.gray(error.message));
          }
        }
      } else {
        console.log(chalk.red('Invalid example number'));
      }
    } else if (action === 'Copy command to clipboard') {
      const exampleNum = await prompter.input('Enter example number');
      const num = parseInt(exampleNum, 10);

      if (num >= 1 && num <= EXAMPLES.length) {
        const example = EXAMPLES[num - 1];
        console.log('');
        console.log(chalk.cyan('Command: ') + chalk.white(example.command));
        console.log('');
        console.log(chalk.gray('💡 Copy the command above and paste it in your terminal'));
      }
    } else if (action === 'Show all categories') {
      console.log('');
      console.log(chalk.bold('Available categories:'));
      console.log('');
      Array.from(categories).forEach((cat) => {
        const count = EXAMPLES.filter((e) => e.category === cat).length;
        console.log(chalk.cyan(`  • ${cat}`) + chalk.gray(` (${count} examples)`));
      });
      console.log('');
      console.log(chalk.gray('Run: harmonizer examples <category>'));
    }

    console.log('');
  } finally {
    prompter.close();
  }
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    basics: '🚀 Getting Started',
    reports: '📊 Reports & Visualization',
    development: '💻 Development Workflow',
    'ci-cd': '🔧 CI/CD Integration',
    fixing: '🔨 Auto-Fixing',
    git: '🌿 Git Integration',
    performance: '⚡ Performance',
    learning: '🎓 Learning & Understanding',
  };

  return titles[category] || category.toUpperCase();
}
