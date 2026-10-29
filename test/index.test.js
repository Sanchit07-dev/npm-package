import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { resolvePath } from '../src/index.js';

describe('node-core-easy-kit', () => {
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
});
