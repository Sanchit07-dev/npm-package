import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import {
  readText,
  writeText,
  readJson,
  writeJson,
  fileExists,
  removeFile,
  resolvePath,
  getFileExtension,
  getFileName,
  getRuntimeInfo,
  getMemoryUsage,
  delay,
  hashText
} from '../src/index.js';

describe('node-core-easy-kit', () => {
  let tempDir;

  before(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'node-core-easy-kit-test-'));
  });

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

    it('should reject invalid arguments for readText and writeText', async () => {
      await assert.rejects(async () => await readText(), TypeError);
      await assert.rejects(async () => await readText(''), TypeError);
      await assert.rejects(async () => await readText('   '), TypeError);
      await assert.rejects(async () => await readText(123), TypeError);

      const validPath = path.join(tempDir, 'arg-test.txt');
      await assert.rejects(async () => await writeText(null, 'hello'), TypeError);
      await assert.rejects(async () => await writeText('', 'hello'), TypeError);
      await assert.rejects(async () => await writeText(validPath, 123), TypeError);
    });

    it('should write and read JSON files successfully', async () => {
      const jsonPath = path.join(tempDir, 'nested', 'config.json');
      const payload = { app: 'easy-kit', version: 1, active: true, tags: ['core', 'node'] };

      await writeJson(jsonPath, payload);
      const loaded = await readJson(jsonPath);

      assert.deepStrictEqual(loaded, payload);
    });

    it('should reject malformed JSON with SyntaxError on readJson', async () => {
      const malformedPath = path.join(tempDir, 'bad.json');
      await writeText(malformedPath, '{ not valid json');

      await assert.rejects(
        async () => await readJson(malformedPath),
        SyntaxError
      );
    });

    it('should reject non-serializable data on writeJson', async () => {
      const jsonPath = path.join(tempDir, 'circular.json');
      const circular = {};
      circular.self = circular;

      await assert.rejects(
        async () => await writeJson(jsonPath, circular),
        TypeError
      );

      await assert.rejects(
        async () => await writeJson(jsonPath, undefined),
        TypeError
      );
    });

    it('should correctly check if files exist using fileExists', async () => {
      const filePath = path.join(tempDir, 'exists.txt');
      assert.strictEqual(await fileExists(filePath), false);

      await writeText(filePath, 'present');
      assert.strictEqual(await fileExists(filePath), true);

      await assert.rejects(async () => await fileExists(''), TypeError);
      await assert.rejects(async () => await fileExists(123), TypeError);
    });

    it('should safely remove files and directories with removeFile', async () => {
      const filePath = path.join(tempDir, 'to-delete.txt');
      await writeText(filePath, 'delete me');
      assert.strictEqual(await fileExists(filePath), true);

      await removeFile(filePath);
      assert.strictEqual(await fileExists(filePath), false);

      // Should be idempotent and not throw on missing file
      await removeFile(filePath);

      await assert.rejects(async () => await removeFile(''), TypeError);
    });
  });

  describe('Path Operations', () => {
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
    });

    it('should extract lowercased file extensions with getFileExtension', () => {
      assert.strictEqual(getFileExtension('archive.tar.gz'), '.gz');
      assert.strictEqual(getFileExtension('REPORT.PDF'), '.pdf');
      assert.strictEqual(getFileExtension('no-ext'), '');
      assert.strictEqual(getFileExtension('.gitignore'), '');

      assert.throws(() => getFileExtension(''), TypeError);
      assert.throws(() => getFileExtension(123), TypeError);
    });

    it('should extract file names with and without extensions with getFileName', () => {
      assert.strictEqual(getFileName('/docs/readme.md'), 'readme.md');
      assert.strictEqual(getFileName('/docs/readme.md', false), 'readme');
      assert.strictEqual(getFileName('simple.txt', false), 'simple');

      assert.throws(() => getFileName(''), TypeError);
      assert.throws(() => getFileName('file.txt', 'yes'), TypeError);
    });
  });

  describe('Process and System Operations', () => {
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

      const keys = Object.keys(info).sort();
      assert.deepStrictEqual(keys, [
        'architecture',
        'nodeVersion',
        'platform',
        'workingDirectory'
      ]);
    });

    it('should return process memory statistics with getMemoryUsage', () => {
      const memory = getMemoryUsage();

      assert.strictEqual(typeof memory.rssMb, 'number');
      assert.strictEqual(typeof memory.heapTotalMb, 'number');
      assert.strictEqual(typeof memory.heapUsedMb, 'number');
      assert.strictEqual(typeof memory.externalMb, 'number');

      assert.ok(memory.rssMb > 0);
      assert.ok(memory.heapTotalMb > 0);
      assert.ok(memory.heapUsedMb > 0);
      assert.ok(Object.isFrozen(memory));
    });
  });

  describe('Timers Operations', () => {
    it('should delay asynchronously for the specified duration', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;

      assert.ok(elapsed >= 40, `Expected elapsed time >= 40ms, got ${elapsed}ms`);
    });

    it('should resolve immediately when delay is 0ms', async () => {
      const start = Date.now();
      await delay(0);
      const elapsed = Date.now() - start;

      assert.ok(elapsed < 100);
    });

    it('should reject negative durations with RangeError', async () => {
      await assert.rejects(async () => await delay(-1), RangeError);
    });

    it('should reject non-finite, NaN, and non-number values with TypeError', async () => {
      await assert.rejects(async () => await delay(NaN), TypeError);
      await assert.rejects(async () => await delay(Infinity), TypeError);
      await assert.rejects(async () => await delay('1000'), TypeError);
    });
  });

  describe('Crypto Operations', () => {
    it('should calculate accurate hash digests with hashText', () => {
      const sha256 = hashText('hello');
      assert.strictEqual(sha256, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');

      const md5 = hashText('hello', 'md5');
      assert.strictEqual(md5, '5d41402abc4b2a76b9719d911017c592');
    });

    it('should reject invalid arguments for hashText', () => {
      assert.throws(() => hashText(123), TypeError);
      assert.throws(() => hashText('valid', 123), TypeError);
      assert.throws(() => hashText('valid', ''), TypeError);
    });
  });
});
