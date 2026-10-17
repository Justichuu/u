import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {not, and, or, faces} from '../u.js';
import {halves, six, u6, mirror, not6, and6, or6} from '../u6.js';

const key = v => v.join(' ');

test('U6 is built only on u: it imports u and writes no table of its own', () => {
  const src = readFileSync(new URL('../u6.js', import.meta.url), 'utf8');
  assert.match(src, /from "\.\/u\.js"/);
  assert.doesNotMatch(src, /=== "u" \? "u"|a === "0" \|\| b === "0"/);   // u's own table lines, if copied
});

test('two 3-value logics are six values (2 x 3, iDoMath)', () => {
  assert.equal(six.length, halves.length * faces.length);
  assert.equal(new Set(six.map(key)).size, 6);
});

test('mirrored, they are three 2-value logics: each face seen from either half (3 x 2)', () => {
  for (const v of six) {
    assert.deepEqual(mirror(mirror(v)), v);           // the mirror undoes itself
    assert.equal(mirror(v)[1], v[1]);                // it keeps the face
    assert.notEqual(mirror(v)[0], v[0]);             // and swaps the half
  }
  const pairs = new Set(six.map(v => [key(v), key(mirror(v))].sort().join(' | ')));
  assert.equal(pairs.size, 3);                       // three pairs cover all six, each once
});

test('odd logic is weirder than even logic: u\'s not keeps one face, the mirror keeps none', () => {
  for (const h of halves) assert.deepEqual(faces.map(f => u6(h, f)).filter(v => key(not6(v)) === key(v)), [[h, 'u']]);
  assert.equal(six.filter(v => key(mirror(v)) === key(v)).length, 0);
});

test('inside one half, not, and and or are u\'s own', () => {
  for (const h of halves) for (const a of faces) {
    assert.deepEqual(not6(u6(h, a)), [h, not(a)]);
    for (const b of faces) {
      assert.deepEqual(and6(u6(h, a), u6(h, b)), [h, and(a, b)]);
      assert.deepEqual(or6(u6(h, a), u6(h, b)), [h, or(a, b)]);
    }
  }
  assert.throws(() => and6(u6('chuu', '1'), u6('chau', '1')), /one half/);
});

test('a U6 value is one of the two halves and one of u\'s faces, never a look-alike', () => {
  for (const h of ['CHUU', 'toString', ['chuu'], null]) assert.throws(() => u6(h, '1'), /half is chuu or chau/);
  for (const f of ['toString', ['1'], 1, null]) assert.throws(() => u6('chau', f), TypeError);
});

test('a control that must fail: the mirror is not u\'s not', () => {
  assert.notDeepEqual(mirror(u6('chuu', '1')), not6(u6('chuu', '1')));
});
