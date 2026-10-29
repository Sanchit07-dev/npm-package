/**
 * node-core-easy-kit
 *
 * A beginner-friendly, zero-dependency Node.js utility library exploring
 * foundational core modules: node:fs/promises, node:path, node:process, and node:timers/promises.
 *
 * @module node-core-easy-kit
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * Asynchronously reads a UTF-8 text file and returns its entire content as a string.
 *
 * How it works:
 * Uses Node's built-in `node:fs/promises` to read files without blocking the main event loop.
 * If the file does not exist, Node throws an error with `code: 'ENOENT'` ("Error NO ENTry"),
 * preserving the original error code and stack trace for debugging.
 *
 * @param {string} filePath - Path to the file to read (relative or absolute).
 * @returns {Promise<string>} The UTF-8 text content of the file.
 * @throws {TypeError} If filePath is not a valid non-empty string.
 * @throws {NodeJS.ErrnoException} If a filesystem error occurs (e.g., file not found).
 *
 * @example
 * import { readText } from 'node-core-easy-kit';
 *
 * try {
 *   const content = await readText('./notes.txt');
 *   console.log(content);
 * } catch (error) {
 *   if (error.code === 'ENOENT') {
 *     console.error('File not found!');
 *   }
 * }
 */
export async function readText(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  // Uses UTF-8 encoding so the returned value is a decoded string, not a raw Buffer.
  return await readFile(filePath, { encoding: 'utf8' });
}

/**
 * Asynchronously writes UTF-8 text to a file, automatically creating any missing parent directories.
 *
 * IMPORTANT NOTE ON OVERWRITING:
 * If the target file already exists, its contents will be completely overwritten.
 * If the file does not exist, it will be created.
 *
 * How it works:
 * 1. Computes the parent directory using `path.dirname(filePath)`.
 * 2. Uses `mkdir(parentDir, { recursive: true })` to safely create any missing folders in the path.
 * 3. Writes the content using UTF-8 encoding.
 *
 * @param {string} filePath - Target file destination path.
 * @param {string} content - Text content to write into the file.
 * @returns {Promise<void>} Resolves when writing finishes.
 * @throws {TypeError} If filePath is not a non-empty string, or content is not a string.
 * @throws {NodeJS.ErrnoException} If the filesystem rejects writing (e.g., permission denied).
 *
 * @example
 * import { writeText } from 'node-core-easy-kit';
 *
 * // Automatically creates 'nested/folder/' if it doesn't exist yet!
 * await writeText('./nested/folder/log.txt', 'Operation successful at ' + new Date().toISOString());
 */
export async function writeText(filePath, content) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  if (typeof content !== 'string') {
    throw new TypeError('Expected "content" to be a string.');
  }

  const parentDir = path.dirname(filePath);

  // 'recursive: true' ensures nested folders are created safely without failing if they already exist
  if (parentDir && parentDir !== '.') {
    await mkdir(parentDir, { recursive: true });
  }

  await writeFile(filePath, content, { encoding: 'utf8' });
}

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

/**
 * Returns safe, diagnostic runtime metadata about the current Node.js process and host system.
 *
 * Security Guarantee:
 * This function NEVER inspects or returns environment variables (`process.env`), credentials,
 * tokens, or secret keys. It only exposes safe, non-sensitive system architecture and environment facts.
 *
 * Properties returned:
 * - `nodeVersion`: Current Node.js version string (e.g., 'v20.11.0').
 * - `platform`: Operating system platform identifier (e.g., 'darwin', 'win32', 'linux').
 * - `architecture`: CPU architecture (e.g., 'arm64', 'x64').
 * - `workingDirectory`: The current working directory from which Node was launched (`process.cwd()`).
 *
 * @returns {{ nodeVersion: string, platform: string, architecture: string, workingDirectory: string }}
 *
 * @example
 * import { getRuntimeInfo } from 'node-core-easy-kit';
 *
 * const info = getRuntimeInfo();
 * console.log(`Running on Node ${info.nodeVersion} on ${info.platform} (${info.architecture})`);
 */
export function getRuntimeInfo() {
  return Object.freeze({
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    workingDirectory: process.cwd()
  });
}
