import test from 'node:test';
import assert from 'node:assert/strict';
import {toU5, fromU5, pack, unpack} from '../u5.js';

test('every U5-byte, all 243, packs into one eight-bit byte and comes back the same', () => {
  const seen = new Set();
  for (let n = 0; n < 243; n++) {
    const digits = toU5(n);
    assert.equal(digits.length, 5);
    assert.ok(digits.every(d => ['0', '1', 'u'].includes(d)));
    assert.equal(fromU5(digits), n);
    assert.deepEqual(unpack(pack(digits)), digits);
    seen.add(digits.join(''));
  }
  assert.equal(seen.size, 243);
});

test('the 13 bytes above 242 were never U5-bytes: they read as u, the unknown witness', () => {
  for (let byte = 243; byte < 256; byte++) assert.equal(unpack(byte), 'u');
});

test('the faces count 0, 1, u as 0, 1, 2', () => {
  assert.deepEqual(toU5(0), ['0', '0', '0', '0', '0']);
  assert.deepEqual(toU5(242), ['u', 'u', 'u', 'u', 'u']);
  assert.equal(fromU5(['0', '0', '0', '1', 'u']), 5);
});

test('it refuses what is not a U5-byte instead of guessing', () => {
  assert.throws(() => toU5(243), RangeError);
  assert.throws(() => fromU5(['0', '1']), TypeError);
  assert.throws(() => fromU5(['0', '1', '2', '0', '0']), TypeError);
  assert.throws(() => unpack(256), RangeError);
});
