import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import {
  readText,
  writeText,
  resolvePath,
  getRuntimeInfo,
  delay
} from '../src/index.js';

describe('node-core-easy-kit', () => {
  let tempDir;

  // Set up an isolated temporary directory in the OS temp directory
  before(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'node-core-easy-kit-test-'));
  });

  // Ensure all temporary test artifacts are completely removed after testing
  after(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('File System Operations', () => {
    it('should write and read a UTF-8 text file successfully', async () => {
      const filePath = path.join(tempDir, 'simple.txt');
      const sampleText = 'Hello, Node.js Core Kit!';

      await writeText(filePath, sampleText);
      const content = await readText(filePath);

      assert.strictEqual(content, sampleText);
    });

    it('should automatically create deeply nested parent directories when writing', async () => {
      const nestedFilePath = path.join(tempDir, 'deeply', 'nested', 'subfolder', 'message.txt');
      const sampleText = 'Deep folder test message';

      await writeText(nestedFilePath, sampleText);
      const content = await readText(nestedFilePath);

      assert.strictEqual(content, sampleText);

      // Verify that the directory actually exists on disk
      const dirStats = await stat(path.dirname(nestedFilePath));
      assert.ok(dirStats.isDirectory());
    });

    it('should overwrite existing file contents when writing to the same file', async () => {
      const filePath = path.join(tempDir, 'overwrite-test.txt');

      await writeText(filePath, 'Initial Content');
      let content = await readText(filePath);
      assert.strictEqual(content, 'Initial Content');

      await writeText(filePath, 'Updated Overwritten Content');
      content = await readText(filePath);
      assert.strictEqual(content, 'Updated Overwritten Content');
    });

    it('should reject with ENOENT when reading a non-existent file', async () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist.txt');

      await assert.rejects(
        async () => {
          await readText(nonExistentPath);
        },
        (error) => {
          assert.strictEqual(error.code, 'ENOENT');
          assert.ok(error.message.includes('ENOENT'));
          return true;
        }
      );
    });

    it('should reject invalid arguments for readText', async () => {
      await assert.rejects(async () => await readText(), TypeError);
      await assert.rejects(async () => await readText(''), TypeError);
      await assert.rejects(async () => await readText('   '), TypeError);
      await assert.rejects(async () => await readText(123), TypeError);
      await assert.rejects(async () => await readText(null), TypeError);
      await assert.rejects(async () => await readText({}), TypeError);
    });

    it('should reject invalid arguments for writeText', async () => {
      const validPath = path.join(tempDir, 'arg-test.txt');

      // Invalid filePath
      await assert.rejects(async () => await writeText(null, 'hello'), TypeError);
      await assert.rejects(async () => await writeText('', 'hello'), TypeError);
      await assert.rejects(async () => await writeText('   ', 'hello'), TypeError);
      await assert.rejects(async () => await writeText(12345, 'hello'), TypeError);

      // Invalid content
      await assert.rejects(async () => await writeText(validPath, 123), TypeError);
      await assert.rejects(async () => await writeText(validPath, null), TypeError);
      await assert.rejects(async () => await writeText(validPath, undefined), TypeError);
      await assert.rejects(async () => await writeText(validPath, {}), TypeError);
    });
  });

  describe('Path Resolution Operations', () => {
    it('should return a cross-platform absolute path', () => {
      const resolved = resolvePath('folder', 'file.txt');
      const expected = path.resolve('folder', 'file.txt');

      assert.strictEqual(resolved, expected);
      assert.ok(path.isAbsolute(resolved));
    });

    it('should handle absolute segments correctly', () => {
      const absoluteRoot = path.resolve('/');
      const resolved = resolvePath(absoluteRoot, 'var', 'logs');

      assert.strictEqual(resolved, path.resolve(absoluteRoot, 'var', 'logs'));
      assert.ok(path.isAbsolute(resolved));
    });

    it('should reject empty or invalid arguments for resolvePath', () => {
      assert.throws(() => resolvePath(), TypeError);
      assert.throws(() => resolvePath(''), TypeError);
      assert.throws(() => resolvePath('  '), TypeError);
      assert.throws(() => resolvePath('valid', 123), TypeError);
      assert.throws(() => resolvePath('valid', null), TypeError);
      assert.throws(() => resolvePath('valid', ''), TypeError);
    });
  });

  describe('Runtime Information Operations', () => {
    it('should return system and process metadata correctly', () => {
      const info = getRuntimeInfo();

      assert.strictEqual(typeof info.nodeVersion, 'string');
      assert.ok(info.nodeVersion.startsWith('v'));
      assert.strictEqual(info.nodeVersion, process.version);

      assert.strictEqual(typeof info.platform, 'string');
      assert.strictEqual(info.platform, process.platform);

      assert.strictEqual(typeof info.architecture, 'string');
      assert.strictEqual(info.architecture, process.arch);

      assert.strictEqual(typeof info.workingDirectory, 'string');
      assert.strictEqual(info.workingDirectory, process.cwd());
    });

    it('should never expose environment variables or credentials', () => {
      const info = getRuntimeInfo();

      assert.strictEqual(info.env, undefined);
      assert.strictEqual(info.processEnv, undefined);
      assert.strictEqual(info.secrets, undefined);
      assert.strictEqual(info.PASSWORD, undefined);
      assert.strictEqual(info.API_KEY, undefined);

      // Verify that the object only contains the 4 intended safe keys
      const keys = Object.keys(info).sort();
      assert.deepStrictEqual(keys, [
        'architecture',
        'nodeVersion',
        'platform',
        'workingDirectory'
      ]);
    });

    it('should return a frozen, immutable object', () => {
      const info = getRuntimeInfo();
      assert.ok(Object.isFrozen(info));

      assert.throws(() => {
        info.nodeVersion = 'hacked';
      }, TypeError);
    });
  });

  describe('Timers and Asynchronous Programming Operations', () => {
    it('should delay asynchronously for the specified duration', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;

      // Allow slight timer tolerance (e.g. 40ms minimum due to event loop scheduling)
      assert.ok(elapsed >= 40, `Expected elapsed time >= 40ms, got ${elapsed}ms`);
    });

    it('should resolve immediately when delay is 0ms', async () => {
      const start = Date.now();
      await delay(0);
      const elapsed = Date.now() - start;

      assert.ok(elapsed < 100, `Expected delay(0) to resolve near instantaneously, took ${elapsed}ms`);
    });

    it('should reject negative durations with RangeError', async () => {
      await assert.rejects(async () => await delay(-1), RangeError);
      await assert.rejects(async () => await delay(-500), RangeError);
    });

    it('should reject non-finite, NaN, and non-number values with TypeError', async () => {
      await assert.rejects(async () => await delay(NaN), TypeError);
      await assert.rejects(async () => await delay(Infinity), TypeError);
      await assert.rejects(async () => await delay(-Infinity), TypeError);
      await assert.rejects(async () => await delay('1000'), TypeError);
      await assert.rejects(async () => await delay(null), TypeError);
      await assert.rejects(async () => await delay(undefined), TypeError);
      await assert.rejects(async () => await delay({}), TypeError);
    });
  });
});

