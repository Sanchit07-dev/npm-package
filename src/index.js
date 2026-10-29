/**
 * node-core-easy-kit
 *
 * A beginner-friendly, zero-dependency Node.js utility library exploring
 * foundational core modules: node:fs/promises, node:path, node:process, node:timers/promises, and node:crypto.
 *
 * @module node-core-easy-kit
 */

import { readFile, writeFile, mkdir, access, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';

/* ========================================================================== */
/*                           FILE SYSTEM UTILITIES                            */
/* ========================================================================== */

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

  if (parentDir && parentDir !== '.') {
    await mkdir(parentDir, { recursive: true });
  }

  await writeFile(filePath, content, { encoding: 'utf8' });
}

/**
 * Asynchronously reads and parses a JSON file from disk.
 *
 * How it works:
 * Reads file contents using `readText` (UTF-8) and parses it using `JSON.parse()`.
 * If parsing fails, wraps the error in a descriptive SyntaxError detailing the offending file.
 *
 * @template T
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<T>} The parsed JSON data.
 * @throws {TypeError} If filePath is not a valid non-empty string.
 * @throws {SyntaxError} If the file does not contain valid JSON syntax.
 * @throws {NodeJS.ErrnoException} If the file cannot be accessed (e.g. ENOENT).
 *
 * @example
 * import { readJson } from 'node-core-easy-kit';
 *
 * const pkg = await readJson('./package.json');
 * console.log(pkg.name);
 */
export async function readJson(filePath) {
  const text = await readText(filePath);

  try {
    return JSON.parse(text);
  } catch (error) {
    const wrappedError = new SyntaxError(`Failed to parse JSON file at "${filePath}": ${error.message}`);
    wrappedError.cause = error;
    throw wrappedError;
  }
}

/**
 * Asynchronously serializes a JavaScript value to JSON and writes it to disk.
 * Automatically creates any missing parent directories.
 *
 * Overwriting Notice: Overwrites any existing file at the specified path.
 *
 * @param {string} filePath - Target file destination path.
 * @param {*} data - Serializable data (object, array, number, boolean, string).
 * @param {Object} [options] - Optional formatting options.
 * @param {number|string} [options.spaces=2] - Number of indentation spaces or indentation string.
 * @returns {Promise<void>} Resolves when the file is written.
 * @throws {TypeError} If filePath is not a non-empty string, or data is circular / not serializable.
 *
 * @example
 * import { writeJson } from 'node-core-easy-kit';
 *
 * await writeJson('./data/settings.json', { theme: 'dark', notifications: true });
 */
export async function writeJson(filePath, data, options = {}) {
  const spaces = options && options.spaces !== undefined ? options.spaces : 2;

  let jsonString;
  try {
    jsonString = JSON.stringify(data, null, spaces);
  } catch (error) {
    throw new TypeError(`Cannot serialize data to JSON: ${error.message}`);
  }

  if (jsonString === undefined) {
    throw new TypeError('Cannot serialize undefined data to JSON.');
  }

  await writeText(filePath, jsonString + '\n');
}

/**
 * Checks whether a file or directory exists at the given path.
 *
 * How it works:
 * Uses `fs.promises.access()`. If accessible, returns `true`.
 * If Node returns `ENOENT`, gracefully returns `false`.
 *
 * @param {string} filePath - Path to check.
 * @returns {Promise<boolean>} True if the file/folder exists, false otherwise.
 * @throws {TypeError} If filePath is not a non-empty string.
 *
 * @example
 * import { fileExists } from 'node-core-easy-kit';
 *
 * if (await fileExists('./config.json')) {
 *   console.log('Config exists!');
 * }
 */
export async function fileExists(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Safely removes a file or directory tree at the specified path.
 *
 * How it works:
 * Uses `fs.promises.rm(filePath, { recursive: true, force: true })`.
 * If the file does not exist, it quietly succeeds without throwing an error (`force: true`).
 *
 * @param {string} filePath - Path of the file or directory to delete.
 * @returns {Promise<void>} Resolves when removal finishes.
 * @throws {TypeError} If filePath is not a non-empty string.
 *
 * @example
 * import { removeFile } from 'node-core-easy-kit';
 *
 * await removeFile('./tmp/scratch.txt');
 */
export async function removeFile(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  await rm(filePath, { recursive: true, force: true });
}

/* ========================================================================== */
/*                              PATH UTILITIES                                */
/* ========================================================================== */

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
 * - Absolute Path: A complete, unambiguous address starting from the filesystem root.
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
 * console.log(fullPath);
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
 * Extracts and returns the lowercased extension of a given file path.
 *
 * @param {string} filePath - Path or filename (e.g., 'archive.TAR.GZ' or 'document.PDF').
 * @returns {string} The file extension with leading dot in lowercase (e.g. '.pdf'), or '' if none.
 * @throws {TypeError} If filePath is not a non-empty string.
 *
 * @example
 * import { getFileExtension } from 'node-core-easy-kit';
 *
 * getFileExtension('photo.PNG'); // => '.png'
 * getFileExtension('Makefile');  // => ''
 */
export function getFileExtension(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  return path.extname(filePath).toLowerCase();
}

/**
 * Extracts the filename from a file path, optionally stripping the file extension.
 *
 * @param {string} filePath - Full or relative file path.
 * @param {boolean} [includeExtension=true] - Whether to include the file extension.
 * @returns {string} The extracted filename.
 * @throws {TypeError} If filePath is not a non-empty string, or includeExtension is not a boolean.
 *
 * @example
 * import { getFileName } from 'node-core-easy-kit';
 *
 * getFileName('/path/to/script.test.js');        // => 'script.test.js'
 * getFileName('/path/to/script.test.js', false); // => 'script.test'
 */
export function getFileName(filePath, includeExtension = true) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  if (typeof includeExtension !== 'boolean') {
    throw new TypeError('Expected "includeExtension" to be a boolean.');
  }

  if (includeExtension) {
    return path.basename(filePath);
  }

  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
}

/* ========================================================================== */
/*                            PROCESS UTILITIES                               */
/* ========================================================================== */

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

/**
 * Returns safe, human-readable process memory telemetry in Megabytes (MB).
 *
 * Concepts:
 * - `rssMb` (Resident Set Size): Total memory allocated for the process execution.
 * - `heapTotalMb`: Total size of the allocated V8 JavaScript heap.
 * - `heapUsedMb`: Actual memory currently utilized by active JavaScript objects.
 * - `externalMb`: Memory bound to C++ objects managed by V8 (such as Buffers).
 *
 * @returns {{ rssMb: number, heapTotalMb: number, heapUsedMb: number, externalMb: number }}
 *
 * @example
 * import { getMemoryUsage } from 'node-core-easy-kit';
 *
 * const memory = getMemoryUsage();
 * console.log(`Heap used: ${memory.heapUsedMb} MB / ${memory.heapTotalMb} MB`);
 */
export function getMemoryUsage() {
  const mem = process.memoryUsage();
  const toMb = (bytes) => Number((bytes / (1024 * 1024)).toFixed(2));

  return Object.freeze({
    rssMb: toMb(mem.rss),
    heapTotalMb: toMb(mem.heapTotal),
    heapUsedMb: toMb(mem.heapUsed),
    externalMb: toMb(mem.external)
  });
}

/* ========================================================================== */
/*                             TIMERS UTILITIES                               */
/* ========================================================================== */

/**
 * Asynchronously pauses execution for a specified number of milliseconds without blocking the event loop.
 *
 * How it works:
 * Unlike a synchronous while-loop (which freezes the entire thread, halting all I/O and HTTP requests),
 * `delay()` utilizes a JavaScript Promise and Node's event loop timer (`node:timers/promises`).
 * When you `await delay(1000)`, the JavaScript runtime is free to handle other background operations
 * until the timer expires and resumes your function.
 *
 * @param {number} milliseconds - Duration to pause in milliseconds. Must be a finite non-negative number.
 * @returns {Promise<void>} Resolves when the duration has elapsed.
 * @throws {TypeError} If milliseconds is not a finite number or is NaN.
 * @throws {RangeError} If milliseconds is negative (< 0).
 *
 * @example
 * import { delay } from 'node-core-easy-kit';
 *
 * console.log('Starting...');
 * await delay(1000); // Waits 1 second non-blockingly
 * console.log('1 second later!');
 */
export async function delay(milliseconds) {
  if (typeof milliseconds !== 'number' || Number.isNaN(milliseconds) || !Number.isFinite(milliseconds)) {
    throw new TypeError('Expected "milliseconds" to be a finite number.');
  }

  if (milliseconds < 0) {
    throw new RangeError('Expected "milliseconds" to be a non-negative number (>= 0).');
  }

  await sleep(milliseconds);
}

/* ========================================================================== */
/*                             CRYPTO UTILITIES                               */
/* ========================================================================== */

/**
 * Calculates a cryptographic hash digest of a text string using Node's built-in `node:crypto`.
 *
 * @param {string} content - Text content to hash.
 * @param {string} [algorithm='sha256'] - Hash algorithm (e.g. 'sha256', 'sha512', 'md5').
 * @returns {string} The resulting hexadecimal hash digest.
 * @throws {TypeError} If content is not a string, or algorithm is not a non-empty string.
 *
 * @example
 * import { hashText } from 'node-core-easy-kit';
 *
 * const hash = hashText('hello world');
 * console.log(hash); // e.g. b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
 */
export function hashText(content, algorithm = 'sha256') {
  if (typeof content !== 'string') {
    throw new TypeError('Expected "content" to be a string.');
  }

  if (typeof algorithm !== 'string' || algorithm.trim().length === 0) {
    throw new TypeError('Expected "algorithm" to be a non-empty string.');
  }

  return createHash(algorithm).update(content, 'utf8').digest('hex');
}
