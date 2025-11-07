/**
 * Semantic Trajectory Maps
 *
 * Visualizes the semantic "drift" between intent (function name) and execution (implementation)
 * in 4D LJPW space, showing exactly WHERE and HOW code diverges from its promises.
 */

import { Coordinates } from '../core/coordinates';
import chalk from 'chalk';

export interface TrajectoryPoint {
  label: string;
  coordinates: Coordinates;
  color?: string;
}

export interface TrajectoryPath {
  from: TrajectoryPoint;
  to: TrajectoryPoint;
  distance: number;
  primaryDrift: 'love' | 'justice' | 'power' | 'wisdom';
  driftMagnitude: number;
}

export interface TrajectoryMapOptions {
  showGrid?: boolean;
  showLabels?: boolean;
  colorize?: boolean;
  showDimensionValues?: boolean;
}

/**
 * Semantic Trajectory Map Generator
 *
 * Creates visual representations of semantic drift in LJPW 4D space
 */
export class TrajectoryMapGenerator {
  /**
   * Generate ASCII trajectory map for a single function
   */
  static generateASCIIMap(
    intent: Coordinates,
    execution: Coordinates,
    functionName: string,
    options: TrajectoryMapOptions = {}
  ): string {
    const {
      showGrid = true,
      colorize = true,
    } = options;

    const lines: string[] = [];

    // Header
    lines.push('');
    lines.push(colorize ? chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗') : '═══════════════════════════════════════════════════════════');
    lines.push(colorize ? chalk.bold.cyan(`║  SEMANTIC TRAJECTORY MAP: ${functionName}()`) + ' '.repeat(Math.max(0, 37 - functionName.length)) + '║' : `  SEMANTIC TRAJECTORY MAP: ${functionName}()`);
    lines.push(colorize ? chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝') : '═══════════════════════════════════════════════════════════');
    lines.push('');

    // Calculate drift
    const drift = this.calculateDrift(intent, execution);

    // 4D Coordinates Display
    lines.push(colorize ? chalk.bold('4D LJPW COORDINATES:') : '4D LJPW COORDINATES:');
    lines.push('');
    lines.push(this.renderDimensionBar('Love (L)', intent.love, execution.love, colorize));
    lines.push(this.renderDimensionBar('Justice (J)', intent.justice, execution.justice, colorize));
    lines.push(this.renderDimensionBar('Power (P)', intent.power, execution.power, colorize));
    lines.push(this.renderDimensionBar('Wisdom (W)', intent.wisdom, execution.wisdom, colorize));
    lines.push('');

    // Semantic Drift Analysis
    lines.push(colorize ? chalk.bold('SEMANTIC DRIFT ANALYSIS:') : 'SEMANTIC DRIFT ANALYSIS:');
    lines.push('');
    lines.push(`  ${colorize ? chalk.yellow('Primary Drift Dimension:') : 'Primary Drift Dimension:'} ${drift.primaryDrift.toUpperCase()}`);
    lines.push(`  ${colorize ? chalk.yellow('Drift Magnitude:') : 'Drift Magnitude:'} ${drift.driftMagnitude.toFixed(3)} (${this.getDriftSeverity(drift.driftMagnitude)})`);
    lines.push(`  ${colorize ? chalk.yellow('Total Distance:') : 'Total Distance:'} ${drift.distance.toFixed(3)} in 4D space`);
    lines.push('');

    // Dimension Deltas
    lines.push(colorize ? chalk.bold('DIMENSION CHANGES:') : 'DIMENSION CHANGES:');
    lines.push('');
    lines.push(this.renderDelta('Love', drift.deltas.love, colorize));
    lines.push(this.renderDelta('Justice', drift.deltas.justice, colorize));
    lines.push(this.renderDelta('Power', drift.deltas.power, colorize));
    lines.push(this.renderDelta('Wisdom', drift.deltas.wisdom, colorize));
    lines.push('');

    // 2D Projection (Love-Justice plane)
    if (showGrid) {
      lines.push(colorize ? chalk.bold('2D PROJECTION (Love-Justice Plane):') : '2D PROJECTION (Love-Justice Plane):');
      lines.push('');
      lines.push(this.render2DProjection(intent, execution, 'love', 'justice', colorize));
      lines.push('');

      // 2D Projection (Power-Wisdom plane)
      lines.push(colorize ? chalk.bold('2D PROJECTION (Power-Wisdom Plane):') : '2D PROJECTION (Power-Wisdom Plane):');
      lines.push('');
      lines.push(this.render2DProjection(intent, execution, 'power', 'wisdom', colorize));
      lines.push('');
    }

    // Interpretation
    lines.push(colorize ? chalk.bold('INTERPRETATION:') : 'INTERPRETATION:');
    lines.push('');
    lines.push(this.generateInterpretation(drift, intent, execution, colorize));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Calculate semantic drift between intent and execution
   */
  private static calculateDrift(intent: Coordinates, execution: Coordinates) {
    const deltas = {
      love: execution.love - intent.love,
      justice: execution.justice - intent.justice,
      power: execution.power - intent.power,
      wisdom: execution.wisdom - intent.wisdom,
    };

    // Find primary drift dimension
    const absDeltas = {
      love: Math.abs(deltas.love),
      justice: Math.abs(deltas.justice),
      power: Math.abs(deltas.power),
      wisdom: Math.abs(deltas.wisdom),
    };

    let primaryDrift: 'love' | 'justice' | 'power' | 'wisdom' = 'love';
    let maxDrift = absDeltas.love;

    if (absDeltas.justice > maxDrift) {
      primaryDrift = 'justice';
      maxDrift = absDeltas.justice;
    }
    if (absDeltas.power > maxDrift) {
      primaryDrift = 'power';
      maxDrift = absDeltas.power;
    }
    if (absDeltas.wisdom > maxDrift) {
      primaryDrift = 'wisdom';
      maxDrift = absDeltas.wisdom;
    }

    return {
      deltas,
      primaryDrift,
      driftMagnitude: maxDrift,
      distance: intent.distanceTo(execution),
    };
  }

  /**
   * Render a dimension bar showing intent vs execution
   */
  private static renderDimensionBar(
    label: string,
    intentValue: number,
    executionValue: number,
    colorize: boolean
  ): string {
    const width = 40;
    const intentPos = Math.round(intentValue * width);
    const execPos = Math.round(executionValue * width);

    let bar = ' '.repeat(width);
    const barArray = bar.split('');

    // Mark intent position
    if (intentPos < width) {
      barArray[intentPos] = 'I';
    }

    // Mark execution position
    if (execPos < width) {
      barArray[execPos] = 'E';
    }

    // If they're at the same position
    if (intentPos === execPos && intentPos < width) {
      barArray[intentPos] = '✓';
    }

    const barStr = barArray.join('');
    const delta = executionValue - intentValue;
    const deltaStr = delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);

    if (colorize) {
      const coloredBar = barStr
        .replace('I', chalk.cyan('I'))
        .replace('E', chalk.yellow('E'))
        .replace('✓', chalk.green('✓'));

      const deltaColor = Math.abs(delta) < 0.1 ? chalk.green : Math.abs(delta) < 0.3 ? chalk.yellow : chalk.red;

      return `  ${label.padEnd(12)} [${coloredBar}] ${deltaColor(deltaStr)}`;
    }

    return `  ${label.padEnd(12)} [${barStr}] ${deltaStr}`;
  }

  /**
   * Render delta value with direction indicator
   */
  private static renderDelta(dimension: string, delta: number, colorize: boolean): string {
    const absValue = Math.abs(delta);
    const direction = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    const severity = absValue < 0.1 ? 'negligible' : absValue < 0.3 ? 'moderate' : 'significant';

    const deltaStr = `${direction} ${absValue.toFixed(3)} (${severity})`;

    if (colorize) {
      const color = absValue < 0.1 ? chalk.green : absValue < 0.3 ? chalk.yellow : chalk.red;
      return `  ${dimension.padEnd(10)}: ${color(deltaStr)}`;
    }

    return `  ${dimension.padEnd(10)}: ${deltaStr}`;
  }

  /**
   * Render 2D projection of trajectory
   */
  private static render2DProjection(
    intent: Coordinates,
    execution: Coordinates,
    xDim: 'love' | 'justice' | 'power' | 'wisdom',
    yDim: 'love' | 'justice' | 'power' | 'wisdom',
    colorize: boolean
  ): string {
    const width = 50;
    const height = 15;
    const grid: string[][] = [];

    // Initialize grid
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = '·';
      }
    }

    // Draw axes
    for (let x = 0; x < width; x++) {
      grid[height - 1][x] = '─';
    }
    for (let y = 0; y < height; y++) {
      grid[y][0] = '│';
    }
    grid[height - 1][0] = '┘';

    // Plot intent point
    const intentX = Math.floor(intent[xDim] * (width - 2)) + 1;
    const intentY = height - 2 - Math.floor(intent[yDim] * (height - 2));
    if (intentX < width && intentY >= 0 && intentY < height) {
      grid[intentY][intentX] = 'I';
    }

    // Plot execution point
    const execX = Math.floor(execution[xDim] * (width - 2)) + 1;
    const execY = height - 2 - Math.floor(execution[yDim] * (height - 2));
    if (execX < width && execY >= 0 && execY < height) {
      grid[execY][execX] = 'E';
    }

    // Draw trajectory line
    this.drawLine(grid, intentX, intentY, execX, execY, width, height);

    // Render grid
    const lines = grid.map((row) => {
      const rowStr = row.join('');
      if (colorize) {
        return '    ' + rowStr
          .replace(/I/g, chalk.cyan('I'))
          .replace(/E/g, chalk.yellow('E'))
          .replace(/\*/g, chalk.gray('*'));
      }
      return '    ' + rowStr;
    });

    // Add axis labels
    lines.push(`    ${' '.repeat(width - xDim.length - 1)}${xDim.toUpperCase()} →`);
    lines.unshift(`    ${yDim.toUpperCase()}`);
    lines.unshift(`    ↑`);

    return lines.join('\n');
  }

  /**
   * Draw line between two points using Bresenham's algorithm
   */
  private static drawLine(
    grid: string[][],
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    width: number,
    height: number
  ): void {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        if (grid[y][x] === '·') {
          grid[y][x] = '*';
        }
      }

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Get drift severity description
   */
  private static getDriftSeverity(magnitude: number): string {
    if (magnitude < 0.1) return 'negligible';
    if (magnitude < 0.2) return 'minor';
    if (magnitude < 0.3) return 'moderate';
    if (magnitude < 0.5) return 'significant';
    return 'severe';
  }

  /**
   * Generate human-readable interpretation
   */
  private static generateInterpretation(
    drift: any,
    _intent: Coordinates,
    _execution: Coordinates,
    colorize: boolean
  ): string {
    const lines: string[] = [];

    // Analyze the drift pattern
    const increasedDims: string[] = [];
    const decreasedDims: string[] = [];

    Object.entries(drift.deltas as Record<string, number>).forEach(([dim, delta]) => {
      if (delta > 0.1) increasedDims.push(dim);
      if (delta < -0.1) decreasedDims.push(dim);
    });

    // Generate interpretation
    if (drift.distance < 0.3) {
      lines.push(colorize ? chalk.green('  ✓ Name and implementation are well-aligned.') : '  ✓ Name and implementation are well-aligned.');
    } else {
      lines.push(colorize ? chalk.red('  ✗ Significant semantic drift detected!') : '  ✗ Significant semantic drift detected!');
      lines.push('');

      if (increasedDims.length > 0) {
        lines.push(`  The code INCREASES ${increasedDims.join(', ').toUpperCase()}`);
        lines.push(`  beyond what the name suggests.`);
        lines.push('');
      }

      if (decreasedDims.length > 0) {
        lines.push(`  The code DECREASES ${decreasedDims.join(', ').toUpperCase()}`);
        lines.push(`  compared to what the name promises.`);
        lines.push('');
      }

      // Specific recommendations
      lines.push(colorize ? chalk.yellow('  Recommendation:') : '  Recommendation:');

      if (drift.primaryDrift === 'wisdom' && drift.deltas.power > 0.2) {
        lines.push('  Name suggests data retrieval, but code modifies state.');
        lines.push('  Consider renaming to reflect the actual transformation.');
      } else if (drift.primaryDrift === 'justice' && drift.deltas.power > 0.2) {
        lines.push('  Name suggests validation, but code executes actions.');
        lines.push('  Separate validation from execution logic.');
      } else if (drift.primaryDrift === 'power' && drift.deltas.wisdom > 0.2) {
        lines.push('  Name suggests action, but code primarily gathers information.');
        lines.push('  Rename to reflect the information-gathering nature.');
      } else {
        lines.push(`  Consider aligning the name with the ${drift.primaryDrift.toUpperCase()} dimension.`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate HTML trajectory visualization
   */
  static generateHTMLVisualization(
    _functions: Array<{
      name: string;
      intent: Coordinates;
      execution: Coordinates;
    }>
  ): string {
    // TODO: Implement interactive HTML/Canvas visualization
    // This would render 3D trajectory plots using Three.js or similar
    return '<!-- HTML visualization not yet implemented -->';
  }
}
