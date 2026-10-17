import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {faces} from '../u.js';
import {bytes, split, join} from '../u-byte.js';

// Every stream with n bits that closes exactly at its last face.
const every = (by, n) => {
  const out = [];
  const grow = s => {
    for (const f of faces) {
      const t = s + f, bits = [...t].filter(x => x !== 'u').length;
      if (bits > n) continue;
      if (bytes(t, by).bytes.length) { if (bits === n) out.push(t); } else grow(t);
    }
  };
  grow('');
  return out;
};

// Counted 9 October 2026 over every stream (scratch measure-both.mjs), and kept here so they cannot drift.
for (const [by, n, streams, values, placements] of [['whole', 5, 672, 32, 21], ['every', 4, 1296, 16, 81]]) {
  test(`${by}: ${n} bits make ${streams} u-bytes, ${values} bit values times ${placements} placements`, () => {
    const s = every(by, n);
    assert.equal(s.length, streams);
    assert.equal(new Set(s.map(t => split(t).bits)).size, values);
    assert.equal(new Set(s.map(t => split(t).at.join())).size, placements);
    for (const t of s) assert.equal(join(split(t)), t);
  });
}

test('Justichuu\'s two strings, 9 October 2026', () => {
  assert.deepEqual(bytes('1u1001uu', 'whole'), {bytes: ['1u1001uu'], open: ''});
  assert.deepEqual(bytes('1u1001uu', 'every'), {bytes: [], open: '1u1001uu'});
  for (const by of ['whole', 'every']) assert.deepEqual(bytes('1111100001001uuu', by).bytes, ['1111100001001uuu']);
  assert.deepEqual(split('1u1001uu'), {bits: '11001', at: [1, 6, 7]});
});

test('a u-byte is u\'s faces only, closed by whole or every', () => {
  assert.throws(() => bytes('12u'), /1, 0 or u/);
  assert.throws(() => bytes('uuu', 'toString'), /whole or every/);
  assert.throws(() => join({bits: 'u', at: []}), /1 or 0/);
});

test('a control that must fail: two u side by side do not close a byte', () => {
  assert.deepEqual(bytes('1uu0', 'every').bytes, []);
});

test('u-byte is built only on u: it imports u and writes no table of its own', () => {
  const src = readFileSync(new URL('../u-byte.js', import.meta.url), 'utf8');
  assert.match(src, /from "\.\/u\.js"/);
  assert.doesNotMatch(src, /=== "u" \? "u"|a === "0" \|\| b === "0"/);
});
