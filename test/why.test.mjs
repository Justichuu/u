import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as face from '../u.js';
import * as why from '../why.js';

// A formula is a tree: a reason's name, a known '1' or '0', or [op, ...parts]. Evaluated with the reasons carried
// (ops: why.js or a planted copy) and, separately, with every reason settled to 1 or 0 (u.js's faces alone).
const ATOMS = ['r', 's', 't', '1', '0'];
const carry = (ops, f) => typeof f === 'string' ? (f === '1' || f === '0' ? ops.known(f) : ops.unknown(f))
  : f[0] === 'not' ? ops.not(carry(ops, f[1])) : ops[f[0]](carry(ops, f[1]), carry(ops, f[2]));
const settle = (f, answer) => typeof f === 'string' ? (f === '1' || f === '0' ? f : answer[f])
  : f[0] === 'not' ? face.not(settle(f[1], answer)) : face[f[0]](settle(f[1], answer), settle(f[2], answer));
const reasonsIn = f => typeof f === 'string' ? (f === '1' || f === '0' ? [] : [f]) : f.slice(1).flatMap(reasonsIn);
const answers = names => names.reduce((all, n) => all.flatMap(a => [{...a, [n]: '1'}, {...a, [n]: '0'}]), [{}]);

// The promise: if two full answers agree on every kept reason, they give the same face (no reason that matters is
// dropped), and a settled face is the face under every answer. Returns the formulas that break it.
function breaks(ops, formulas) {
  const bad = [];
  for (const f of formulas) {
    const out = carry(ops, f), kept = new Set(out.why), names = [...new Set(reasonsIn(f))], seen = new Map();
    for (const a of answers(names)) {
      const got = settle(f, a), key = names.filter(n => kept.has(n)).map(n => a[n]).join('');
      if (out.face !== 'u' && got !== out.face) { bad.push(f); break; }
      if (seen.has(key) && seen.get(key) !== got) { bad.push(f); break; }
      seen.set(key, got);
    }
  }
  return bad;
}

const grow = parts => [...parts.map(p => ['not', p]), ...parts.flatMap(a => parts.flatMap(b => [['and', a, b], ['or', a, b]]))];
const depth1 = [...ATOMS, ...grow(ATOMS)];
const depth2 = [...depth1, ...grow(depth1)];
function sample(depth, count, seed) {   // seeded, so a failure comes back the same
  let x = seed >>> 0;
  const next = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const make = d => d === 0 || next() < 0.2 ? ATOMS[Math.floor(next() * ATOMS.length)]
    : next() < 0.2 ? ['not', make(d - 1)] : [next() < 0.5 ? 'and' : 'or', make(d - 1), make(d - 1)];
  return Array.from({length: count}, () => make(depth));
}

test('every formula to depth 2 keeps each reason any combination of answers could need', () => {
  assert.equal(depth2.length, 7320);
  assert.deepEqual(breaks(why, depth2), []);
});

test('a seeded sample of 3000 formulas at depth 4 keeps them too', () => {
  assert.deepEqual(breaks(why, sample(4, 3000, 16102026)), []);
});

test('two planted wrong versions break the promise, so the check can fail', () => {
  // Unchecked ops, so a planted value with its reasons torn off flows on instead of being refused; right, they pass.
  const both = (a, b) => [...new Set([a, b].filter(x => x.face === 'u').flatMap(x => x.why))];
  const plain = {known: f => ({face: f, why: []}), unknown: n => ({face: 'u', why: [n]}), not: a => ({face: face.not(a.face), why: a.why}),
    and: (a, b) => { const f = face.and(a.face, b.face); return {face: f, why: f === 'u' ? both(a, b) : []}; },
    or: (a, b) => { const f = face.or(a.face, b.face); return {face: f, why: f === 'u' ? both(a, b) : []}; }};
  const drops = {...plain, and: (a, b) => { const f = face.and(a.face, b.face); return {face: f, why: f === 'u' && a.face === 'u' && b.face === 'u' ? both(a, b) : []}; }};
  const firstOnly = {...plain, or: (a, b) => { const f = face.or(a.face, b.face); return {face: f, why: f === 'u' ? (a.face === 'u' ? a.why : b.why) : []}; }};
  assert.deepEqual(breaks(plain, depth2), []);
  assert.ok(breaks(drops, depth2).length > 0, 'dropping a u\'s reasons beside a settled input went unseen');
  assert.ok(breaks(firstOnly, depth2).length > 0, 'keeping only the first u\'s reasons went unseen');
});

test('one step keeps exactly the u\'s whose settling could change its face', () => {
  const inputs = name => [why.known('1'), why.known('0'), why.unknown(name)];
  for (const op of ['and', 'or']) for (const a of inputs('a')) for (const b of inputs('b')) {
    const out = why[op](a, b), could = [];
    for (const [x, other, first] of [[a, b, true], [b, a, false]]) {
      if (x.face !== 'u') continue;
      const changes = ['1', '0'].some(v => face[op](...(first ? [v, other.face] : [other.face, v])) !== out.face);
      if (changes) could.push(...x.why);
    }
    assert.deepEqual(out.why, could, `${op}(${a.face}, ${b.face})`);
  }
  assert.deepEqual(why.not(why.unknown('a')).why, ['a']);
});

test('faces are u\'s own, and a settled face keeps no reason', () => {
  const all = [why.known('1'), why.known('0'), why.unknown('a')];
  for (const a of all) {
    assert.equal(why.not(a).face, face.not(a.face));
    for (const b of all) for (const op of ['and', 'or']) {
      const out = why[op](a, b);
      assert.equal(out.face, face[op](a.face, b.face));
      if (out.face !== 'u') assert.deepEqual(out.why, []);
    }
  }
});

test('where a NaN payload is not promised: both reasons survive, in order, once each, through 1000 steps', () => {
  const door = why.unknown('is the door locked?'), alarm = why.unknown('is the alarm set?');
  assert.deepEqual(why.and(door, alarm).why, ['is the door locked?', 'is the alarm set?']);
  assert.deepEqual(why.or(alarm, door).why, ['is the alarm set?', 'is the door locked?']);
  assert.deepEqual(why.and(door, door).why, ['is the door locked?']);
  let x = door;
  for (let i = 0; i < 1000; i++) x = why.and(x, why.known('1'));
  assert.deepEqual([x.face, x.why], ['u', ['is the door locked?']]);
  assert.deepEqual(why.and(why.and(door, alarm), why.known('0')), {face: '0', why: []});
});

test('a u with no reason, or a value with its reasons torn off, is refused', () => {
  assert.throws(() => why.unknown(''), /names the one observation/);
  assert.throws(() => why.not({face: 'u', why: []}), /a value is/);
  assert.throws(() => why.and(why.known('1'), {face: '1', why: ['stray']}), /a value is/);
  assert.throws(() => why.known('u'), /a known value/);
  assert.throws(() => why.not({face: 'u', why: ['']}), /names the one observation/);   // a bare u made by hand
  assert.throws(() => why.or({face: 'u', why: [42]}, why.known('0')), /names the one observation/);
});

test('why.js is built only on u: it imports u and writes no table of its own', () => {
  const src = readFileSync(new URL('../why.js', import.meta.url), 'utf8');
  assert.match(src, /from "\.\/u\.js"/);
  assert.doesNotMatch(src, /=== "u" \? "u"|a === "0" \|\| b === "0"|a === "1" \|\| b === "1"/);   // u's own table lines, if copied
});
