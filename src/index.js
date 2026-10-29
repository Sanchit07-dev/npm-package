/**
 * node-core-easy-kit
 *
 * A beginner-friendly, zero-dependency Node.js utility library exploring
 * foundational core modules:
 * - node:fs/promises
 * - node:path
 * - node:process
 * - node:timers/promises
 * - node:crypto
 * - node:os
 * - node:url
 * - node:perf_hooks
 *
 * @module node-core-easy-kit
 */

import { readFile, writeFile, mkdir, access, rm, readdir, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { setTimeout as sleep } from 'node:timers/promises';

/* ========================================================================== */
/*                           FILE SYSTEM UTILITIES                            */
/* ========================================================================== */

/**
 * Asynchronously reads a UTF-8 text file and returns its entire content as a string.
 *
 * @param {string} filePath - Path to the file to read (relative or absolute).
 * @returns {Promise<string>} The UTF-8 text content of the file.
 * @throws {TypeError} If filePath is not a valid non-empty string.
 * @throws {NodeJS.ErrnoException} If a filesystem error occurs (e.g., file not found).
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
 * @param {string} filePath - Target file destination path.
 * @param {string} content - Text content to write into the file.
 * @returns {Promise<void>} Resolves when writing finishes.
 * @throws {TypeError} If filePath is not a non-empty string, or content is not a string.
 * @throws {NodeJS.ErrnoException} If the filesystem rejects writing (e.g., permission denied).
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
 * @template T
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<T>} The parsed JSON data.
 * @throws {TypeError} If filePath is not a valid non-empty string.
 * @throws {SyntaxError} If the file does not contain valid JSON syntax.
 * @throws {NodeJS.ErrnoException} If the file cannot be accessed (e.g. ENOENT).
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
 * @param {string} filePath - Target file destination path.
 * @param {*} data - Serializable data (object, array, number, boolean, string).
 * @param {Object} [options] - Optional formatting options.
 * @param {number|string} [options.spaces=2] - Number of indentation spaces or indentation string.
 * @returns {Promise<void>} Resolves when the file is written.
 * @throws {TypeError} If filePath is not a non-empty string, or data is circular / not serializable.
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
 * @param {string} filePath - Path to check.
 * @returns {Promise<boolean>} True if the file/folder exists, false otherwise.
 * @throws {TypeError} If filePath is not a non-empty string.
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
 * @param {string} filePath - Path of the file or directory to delete.
 * @returns {Promise<void>} Resolves when removal finishes.
 * @throws {TypeError} If filePath is not a non-empty string.
 */
export async function removeFile(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  await rm(filePath, { recursive: true, force: true });
}

/**
 * Asynchronously lists directory entries with metadata.
 *
 * @param {string} dirPath - Path to the directory.
 * @param {Object} [options] - Optional options.
 * @param {boolean} [options.recursive=false] - Whether to list entries recursively.
 * @returns {Promise<Array<{ name: string, isDirectory: boolean, isFile: boolean, isSymbolicLink: boolean, path: string }>>}
 * @throws {TypeError} If dirPath is not a non-empty string.
 */
export async function listDirectory(dirPath, options = {}) {
  if (typeof dirPath !== 'string' || dirPath.trim().length === 0) {
    throw new TypeError('Expected "dirPath" to be a non-empty string.');
  }

  const recursive = Boolean(options?.recursive);
  const entries = await readdir(dirPath, { withFileTypes: true, recursive });

  return entries.map((entry) => {
    const parent = entry.parentPath || dirPath;
    return Object.freeze({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile(),
      isSymbolicLink: entry.isSymbolicLink(),
      path: path.join(parent, entry.name)
    });
  });
}

/**
 * Returns the size of a file in bytes and human-readable units.
 *
 * @param {string} filePath - Path to the file.
 * @returns {Promise<{ bytes: number, formatted: string }>}
 * @throws {TypeError} If filePath is not a non-empty string.
 */
export async function getFileSize(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  const stats = await stat(filePath);
  const bytes = stats.size;

  let formatted = `${bytes} B`;
  if (bytes >= 1024 ** 3) {
    formatted = `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  } else if (bytes >= 1024 ** 2) {
    formatted = `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  } else if (bytes >= 1024) {
    formatted = `${(bytes / 1024).toFixed(2)} KB`;
  }

  return Object.freeze({ bytes, formatted });
}

/* ========================================================================== */
/*                              PATH UTILITIES                                */
/* ========================================================================== */

/**
 * Resolves a sequence of paths or path segments into an absolute, normalized path.
 *
 * @param {...string} parts - One or more path segments to join and resolve.
 * @returns {string} The normalized, cross-platform absolute path.
 * @throws {TypeError} If no segments are passed, or if any segment is not a non-empty string.
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
/*                              URL UTILITIES                                 */
/* ========================================================================== */

/**
 * Converts a filesystem file path into a file:// URL string.
 *
 * @param {string} filePath - File system path.
 * @returns {string} Standard file:// URL href.
 * @throws {TypeError} If filePath is not a non-empty string.
 *
 * @example
 * import { pathToUrl } from 'node-core-easy-kit';
 * const url = pathToUrl('./data/index.js'); // => 'file:///full/path/to/data/index.js'
 */
export function pathToUrl(filePath) {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('Expected "filePath" to be a non-empty string.');
  }

  return pathToFileURL(path.resolve(filePath)).href;
}

/**
 * Converts a file:// URL string or URL instance into an absolute filesystem path.
 *
 * @param {string|URL} fileUrl - File URL string or URL object.
 * @returns {string} Absolute filesystem path.
 * @throws {TypeError} If fileUrl is invalid or not a file protocol URL.
 *
 * @example
 * import { urlToPath } from 'node-core-easy-kit';
 * const localPath = urlToPath(import.meta.url);
 */
export function urlToPath(fileUrl) {
  if (!fileUrl || (typeof fileUrl !== 'string' && !(fileUrl instanceof URL))) {
    throw new TypeError('Expected "fileUrl" to be a non-empty string or URL instance.');
  }

  return fileURLToPath(fileUrl);
}

/* ========================================================================== */
/*                            PROCESS UTILITIES                               */
/* ========================================================================== */

/**
 * Returns safe, diagnostic runtime metadata about the current Node.js process and host system.
 *
 * @returns {{ nodeVersion: string, platform: string, architecture: string, workingDirectory: string }}
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
 * @returns {{ rssMb: number, heapTotalMb: number, heapUsedMb: number, externalMb: number }}
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
/*                               OS UTILITIES                                 */
/* ========================================================================== */

/**
 * Returns safe host hardware and operating system telemetry.
 * Never exposes credentials, tokens, or environment secrets.
 *
 * @returns {{ hostname: string, platform: string, osRelease: string, cpuCount: number, cpuModel: string, totalMemoryGb: number, freeMemoryGb: number, uptimeHours: number, homeDirectory: string }}
 *
 * @example
 * import { getSystemInfo } from 'node-core-easy-kit';
 * const sys = getSystemInfo();
 * console.log(`Cores: ${sys.cpuCount}, RAM: ${sys.totalMemoryGb} GB`);
 */
export function getSystemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const toGb = (bytes) => Number((bytes / 1024 ** 3).toFixed(2));
  const cpus = os.cpus();

  return Object.freeze({
    hostname: os.hostname(),
    platform: os.platform(),
    osRelease: os.release(),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Unknown',
    totalMemoryGb: toGb(totalMem),
    freeMemoryGb: toGb(freeMem),
    uptimeHours: Number((os.uptime() / 3600).toFixed(2)),
    homeDirectory: os.homedir()
  });
}

/* ========================================================================== */
/*                             TIMERS UTILITIES                               */
/* ========================================================================== */

/**
 * Asynchronously pauses execution for a specified number of milliseconds without blocking the event loop.
 *
 * @param {number} milliseconds - Duration to pause in milliseconds. Must be a finite non-negative number.
 * @returns {Promise<void>} Resolves when the duration has elapsed.
 * @throws {TypeError} If milliseconds is not a finite number or is NaN.
 * @throws {RangeError} If milliseconds is negative (< 0).
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
/*                           PERFORMANCE UTILITIES                            */
/* ========================================================================== */

/**
 * Measures the execution duration of an asynchronous function using Node's performance hooks.
 *
 * @template T
 * @param {() => Promise<T>|T} asyncFn - Function to execute and benchmark.
 * @returns {Promise<{ result: T, durationMs: number }>}
 * @throws {TypeError} If asyncFn is not a function.
 *
 * @example
 * import { measureTime, delay } from 'node-core-easy-kit';
 * const { durationMs } = await measureTime(async () => await delay(100));
 * console.log(`Took ${durationMs}ms`);
 */
export async function measureTime(asyncFn) {
  if (typeof asyncFn !== 'function') {
    throw new TypeError('Expected "asyncFn" to be a function.');
  }

  const start = performance.now();
  const result = await asyncFn();
  const durationMs = Number((performance.now() - start).toFixed(3));

  return Object.freeze({ result, durationMs });
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

/**
 * Generates a cryptographically secure random RFC 4122 version 4 UUID using Node's native crypto.
 *
 * @returns {string} A standard UUID string (e.g. '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d').
 *
 * @example
 * import { generateUuid } from 'node-core-easy-kit';
 * const id = generateUuid();
 * console.log(id);
 */
export function generateUuid() {
  return randomUUID();
}
