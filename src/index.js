/**
 * node-core-easy-kit
 *
 * A beginner-friendly, zero-dependency Node.js utility library exploring
 * foundational core modules: node:fs/promises, node:path, node:process, and node:timers/promises.
 *
 * @module node-core-easy-kit
 */

import path from 'node:path';

/**
 * Resolves a sequence of paths or path segments into an absolute, normalized path.
 *
 * How it works:
 * In Node.js, `path.resolve()` processes path segments from right to left, prepending each
 * until an absolute path is formed. If no absolute path segment is found, it prepends the
 * Current Working Directory (`process.cwd()`).
 *
 * Concepts:
 * - Relative Path: A path that describes location relative to where your code runs (e.g., './data/config.json').
 * - Absolute Path: A complete, unambiguous address starting from the filesystem root (e.g., '/Users/name/app/data/config.json' on Unix or 'C:\\app\\data\\config.json' on Windows).
 * - Current Working Directory (CWD): The directory from which your Node.js command was invoked.
 *
 * @param {...string} parts - One or more path segments to join and resolve.
 * @returns {string} The normalized, cross-platform absolute path.
 * @throws {TypeError} If no segments are passed, or if any segment is not a non-empty string.
 *
 * @example
 * import { resolvePath } from 'node-core-easy-kit';
 *
 * const fullPath = resolvePath('data', 'reports', '2026.csv');
 * console.log(fullPath); // e.g. '/workspace/data/reports/2026.csv'
 */
export function resolvePath(...parts) {
  if (parts.length === 0) {
    throw new TypeError('Expected at least one path segment.');
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (typeof part !== 'string' || part.trim().length === 0) {
      throw new TypeError(`Path segment at index ${i} must be a non-empty string.`);
    }
  }

  return path.resolve(...parts);
}
