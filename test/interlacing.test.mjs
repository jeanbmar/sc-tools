import test from 'node:test';
import { strict as assert } from 'node:assert';
import { interlace, deinterlace } from '../lib/interlacing.mjs';

test('interlacing can be reversed', () => {
  const pixels = new Array(1000 * 1000);
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = i;
  }

  const descrambled = deinterlace(pixels, 1000, 1000);
  const scrambled = interlace(descrambled, 1000, 1000);

  for (let i = 0; i < pixels.length; i += 1) {
    assert.strictEqual(
      pixels[i],
      scrambled[i],
      `inconsistent result calling scramble at position ${i}, expected ${pixels[i]}, found ${scrambled[i]}`
    );
  }
});
