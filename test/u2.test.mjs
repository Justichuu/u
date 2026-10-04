import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {agree, pack, unpack} from '../u2.js';

const bits = ['1', '0'], ubits = ['1', '0', 'u'];
const every = bits.flatMap(a => bits.flatMap(b => ubits.map(c => [a, b, c])));   // all twelve U2-bytes

test('a U2-byte is 1 or 0 only when all three witnesses agree, else u', () => {
  for (const [a, b, c] of every) {
    const want = a === '1' && b === '1' && c === '1' ? '1' : a === '0' && b === '0' && c === '0' ? '0' : 'u';
    assert.equal(agree(a, b, c), want, `${a}${b}${c}`);
  }
});

test('every U2-byte packs into four bits and comes back the same', () => {
  const seen = new Set();
  for (const w of every) { const n = pack(...w); assert.ok(n >= 0 && n <= 15); seen.add(n); assert.deepEqual(unpack(n), w); }
  assert.equal(seen.size, 12);
});

test('01 in the u-bit is a bare u and is refused', () => {
  for (const n of [0b0001, 0b0101, 0b1001, 0b1101]) assert.throws(() => unpack(n), /bare u/);
});

test('U2 is built only on u: it imports u and writes no table of its own', () => {
  const src = readFileSync(new URL('../u2.js', import.meta.url), 'utf8');
  assert.match(src, /from "\.\/u\.js"/);
  assert.doesNotMatch(src, /=== "u" \? "u"|a === "0" \|\| b === "0"/);   // u's own table lines, if copied
});

test('a control that must fail: one witness short of agreement is not 1', () => {
  assert.notEqual(agree('1', '1', 'u'), '1');
  assert.notEqual(agree('1', '0', '1'), '1');
});
