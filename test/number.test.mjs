import test from 'node:test';
import assert from 'node:assert/strict';
import {u, not, and, or} from '../u.js';

// U as a number. Justichuu, 3 October 2026: "I argue if no number fits, make one". With u = 1/2 the three tables are
// arithmetic: not is 1 - x, and is min, or is max, as in Lukasiewicz's three-valued logic for "the undetermined future".
// The number labels the tables; it is not a probability and settles nothing.
const value = {'1': 1, '0': 0, u: 1 / 2};
const named = n => n === 1 ? '1' : n === 0 ? '0' : 'u';
const make = name => name === 'u' ? u('A measurement of the named condition would settle it') : name;

test('u is one half: not, and, or are 1 - x, min and max', () => {
  for (const a of Object.keys(value)) {
    assert.equal(not(make(a)), named(1 - value[a]), `not ${a}`);
    for (const b of Object.keys(value)) {
      assert.equal(and(make(a), make(b)), named(Math.min(value[a], value[b])), `${a} and ${b}`);
      assert.equal(or(make(a), make(b)), named(Math.max(value[a], value[b])), `${a} or ${b}`);
    }
  }
});

test('a control that must fail: u as zero breaks not', () => {
  assert.notEqual(not(make('u')), named(1 - 0));   // 1 - 0 = 1, but not u stays u
});
