import test from 'node:test';
import { strict as assert } from 'node:assert';
import gl from 'gl-constants';
import { encode, decode } from '../lib/gl-color.mjs';

test('handle UNSIGNED_SHORT_4_4_4_4, RGBA', () => {
  for (let i = 0; i < 0xffff; i += 1) {
    const decoded = decode(i, gl.UNSIGNED_SHORT_4_4_4_4, gl.RGBA);
    const encoded = encode(decoded, gl.UNSIGNED_SHORT_4_4_4_4, gl.RGBA);
    assert.strictEqual(
      i,
      encoded,
      `inconsistent color, expected ${i}, found ${encoded}`
    );
  }
});

test('handle UNSIGNED_SHORT_5_5_5_1, RGBA', () => {
  for (let i = 0; i < 0xffff; i += 1) {
    const decoded = decode(i, gl.UNSIGNED_SHORT_5_5_5_1, gl.RGBA);
    const encoded = encode(decoded, gl.UNSIGNED_SHORT_5_5_5_1, gl.RGBA);
    assert.strictEqual(
      i,
      encoded,
      `inconsistent color, expected ${i}, found ${encoded}`
    );
  }
});

test('handle UNSIGNED_SHORT_5_6_5, RGB', () => {
  for (let i = 0; i < 0xffff; i += 1) {
    const decoded = decode(i, gl.UNSIGNED_SHORT_5_6_5, gl.RGB);
    const encoded = encode(decoded, gl.UNSIGNED_SHORT_5_6_5, gl.RGB);
    assert.strictEqual(
      i,
      encoded,
      `inconsistent color, expected ${i}, found ${encoded}`
    );
  }
});

test('handle UNSIGNED_BYTE, LUMINANCE_ALPHA', () => {
  for (let i = 0; i < 0xffff; i += 1) {
    const decoded = decode(i, gl.UNSIGNED_BYTE, gl.LUMINANCE_ALPHA);
    const encoded = encode(decoded, gl.UNSIGNED_BYTE, gl.LUMINANCE_ALPHA);
    assert.strictEqual(
      i,
      encoded,
      `inconsistent color, expected ${i}, found ${encoded}`
    );
  }
});

test('handle UNSIGNED_BYTE, LUMINANCE', () => {
  for (let i = 0; i < 0xff; i += 1) {
    const decoded = decode(i, gl.UNSIGNED_BYTE, gl.LUMINANCE);
    const encoded = encode(decoded, gl.UNSIGNED_BYTE, gl.LUMINANCE);
    assert.strictEqual(
      i,
      encoded,
      `inconsistent color, expected ${i}, found ${encoded}`
    );
  }
});

test('handle UNSIGNED_BYTE, RGBA', () => {});
for (let i = 0; i < 0xffff; i += 1) {
  const decoded = decode(i, gl.UNSIGNED_BYTE, gl.RGBA);
  const encoded = encode(decoded, gl.UNSIGNED_BYTE, gl.RGBA);
  assert.strictEqual(
    i,
    encoded,
    `inconsistent color, expected ${i}, found ${encoded}`
  );
}
