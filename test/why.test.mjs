import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as face from '../u.js';
import * as why from '../why.js';

// A formula is a tree: a reason's name, a known '1' or '0', or [op, ...parts]. Evaluated with the reasons carried
// (ops: why.js or a planted copy) and, separately, on faces alone with each reason answered 1, answered 0 or left u.
const ATOMS = ['r', 's', 't', '1', '0'];
const carry = (ops, f) => typeof f === 'string' ? (f === '1' || f === '0' ? ops.known(f) : ops.unknown(f))
  : f.length === 2 ? ops[f[0]](carry(ops, f[1])) : ops[f[0]](carry(ops, f[1]), carry(ops, f[2]));
const SETTLED = x => (x === 'u' ? '0' : '1');   // the reference the test holds why.settled to
const onFaces = (f, answer) => typeof f === 'string' ? (f === '1' || f === '0' ? f : answer[f])
  : f[0] === 'not' ? face.not(onFaces(f[1], answer)) : f[0] === 'settled' ? SETTLED(onFaces(f[1], answer))
  : face[f[0]](onFaces(f[1], answer), onFaces(f[2], answer));
const reasonsIn = f => typeof f === 'string' ? (f === '1' || f === '0' ? [] : [f]) : f.slice(1).flatMap(reasonsIn);
const answers = names => names.reduce((all, n) => all.flatMap(a => ['1', '0', 'u'].map(v => ({...a, [n]: v}))), [{}]);

// The promise: with nothing answered the faces agree; a value with no reasons is final under every answer; and any
// two answers that agree on every kept reason give the same face. Returns the formulas that break it.
function breaks(ops, formulas) {
  const bad = [];
  for (const f of formulas) {
    const out = carry(ops, f), kept = new Set(out.why), names = [...new Set(reasonsIn(f))], seen = new Map();
    if (onFaces(f, Object.fromEntries(names.map(n => [n, 'u']))) !== out.face) { bad.push(f); continue; }
    for (const a of answers(names)) {
      const got = onFaces(f, a), key = names.filter(n => kept.has(n)).map(n => a[n]).join('');
      if (!out.why.length && got !== out.face) { bad.push(f); break; }
      if (seen.has(key) && seen.get(key) !== got) { bad.push(f); break; }
      seen.set(key, got);
    }
  }
  return bad;
}

const grow = parts => [...parts.flatMap(p => [['not', p], ['settled', p]]), ...parts.flatMap(a => parts.flatMap(b => [['and', a, b], ['or', a, b]]))];
const depth1 = [...ATOMS, ...grow(ATOMS)];
const depth2 = [...depth1, ...grow(depth1)];
function sample(depth, count, seed) {   // seeded, so a failure comes back the same
  let x = seed >>> 0;
  const next = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const make = d => d === 0 || next() < 0.2 ? ATOMS[Math.floor(next() * ATOMS.length)]
    : next() < 0.25 ? [next() < 0.5 ? 'not' : 'settled', make(d - 1)] : [next() < 0.5 ? 'and' : 'or', make(d - 1), make(d - 1)];
  return Array.from({length: count}, () => make(depth));
}

test('every formula to depth 2 keeps each reason any combination of answers could need', () => {
  assert.equal(depth2.length, 8645);
  assert.deepEqual(breaks(why, depth2), []);
});

test('a seeded sample of 3000 formulas at depth 4 keeps them too', () => {
  assert.deepEqual(breaks(why, sample(4, 3000, 16102026)), []);
});

test('three planted wrong versions break the promise, so the check can fail', () => {
  // Unchecked ops, so a planted value with its reasons torn off flows on instead of being refused; right, they pass.
  const all = (a, b) => [...new Set([...a.why, ...b.why])];
  const final = (d, a, b) => [a, b].some(x => x.face === d && !x.why.length);
  const plain = {known: f => ({face: f, why: []}), unknown: n => ({face: 'u', why: [n]}), not: a => ({face: face.not(a.face), why: a.why}),
    settled: a => ({face: SETTLED(a.face), why: a.why}),
    and: (a, b) => ({face: face.and(a.face, b.face), why: final('0', a, b) ? [] : all(a, b)}),
    or: (a, b) => ({face: face.or(a.face, b.face), why: final('1', a, b) ? [] : all(a, b)})};
  const drops = {...plain, and: (a, b) => ({face: face.and(a.face, b.face), why: a.face === 'u' && b.face === 'u' ? all(a, b) : []})};
  const firstOnly = {...plain, or: (a, b) => ({face: face.or(a.face, b.face), why: final('1', a, b) ? [] : a.why.length ? a.why : b.why})};
  const settledForgets = {...plain, settled: a => ({face: SETTLED(a.face), why: []})};
  assert.deepEqual(breaks(plain, depth2), []);
  assert.ok(breaks(drops, depth2).length > 0, 'dropping a u\'s reasons beside a settled input went unseen');
  assert.ok(breaks(firstOnly, depth2).length > 0, 'keeping only the first u\'s reasons went unseen');
  assert.ok(breaks(settledForgets, depth2).length > 0, 'an "is it settled?" that forgets what could change it went unseen');
});

test('one step keeps exactly the u\'s whose answering could change its face', () => {
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

test('faces are u\'s own, and a final input leaves nothing to change', () => {
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

test('is it settled? asks of the knowing: 1 or 0 now, never u, and it keeps what would change it', () => {
  assert.deepEqual(why.settled(why.known('1')), {face: '1', why: []});
  assert.deepEqual(why.settled(why.known('0')), {face: '1', why: []});
  assert.deepEqual(why.settled(why.unknown('is the door locked?')), {face: '0', why: ['is the door locked?']});
  const door = why.unknown('is the door locked?');
  assert.deepEqual(why.not(why.settled(door)), {face: '1', why: ['is the door locked?']});   // "is it unknown?" is known: 1
  assert.deepEqual(why.and(why.settled(door), why.known('0')), {face: '0', why: []});        // a final 0 decides
});

test('U alone builds 197 of the 19683 two-input rules; with "is it settled?" it builds all 19683', () => {
  const F = ['1', '0', 'u'], grid = F.flatMap(x => F.map(y => [x, y]));
  const rule = g => grid.map(([x, y]) => g(x, y)).join('');
  // Closure of the inputs and the constants under u's not, and, or
  const have = new Set([rule((x, y) => x), rule((x, y) => y), ...F.map(c => rule(() => c))]);
  let fresh = [...have];
  while (fresh.length) {
    const all = [...have], next = [];
    const add = r => { if (!have.has(r)) { have.add(r); next.push(r); } };
    for (const p of fresh) {
      add([...p].map(face.not).join(''));
      for (const q of all) for (const op of [face.and, face.or]) { add([...p].map((v, i) => op(v, q[i])).join('')); add([...q].map((v, i) => op(v, p[i])).join('')); }
    }
    fresh = next;
  }
  assert.equal(have.size, 197);
  // With settled: each rule built from its table, its "is x that face?" tests made of not, and and why.settled
  const S = Object.fromEntries(F.map(v => [v, why.settled(v === 'u' ? why.unknown('x') : why.known(v)).face]));
  const is = (x, v) => v === '1' ? face.and(x, S[x]) : v === '0' ? face.and(face.not(x), S[x]) : face.not(S[x]);
  let built = 0;
  const outs = [[]];
  for (let i = 0; i < 9; i++) outs.splice(0, outs.length, ...outs.flatMap(o => F.map(v => [...o, v])));
  for (const o of outs) {
    const g = (x, y) => grid.reduce((acc, [p, q], i) => face.or(acc, face.and(face.and(is(x, p), is(y, q)), o[i])), '0');
    built += rule(g) === o.join('');
  }
  assert.equal(outs.length, 19683);
  assert.equal(built, 19683);
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

test('a u with no reason, or a reason that names nothing, is refused', () => {
  assert.throws(() => why.unknown(''), /names the one observation/);
  assert.throws(() => why.not({face: 'u', why: []}), /a value is/);
  assert.throws(() => why.known('u'), /a known value/);
  assert.throws(() => why.and(why.known('1'), {face: '1', why: ['']}), /names the one observation/);
  assert.throws(() => why.not({face: 'u', why: ['']}), /names the one observation/);   // a bare u made by hand
  assert.throws(() => why.or({face: 'u', why: [42]}, why.known('0')), /names the one observation/);
  assert.throws(() => why.settled({face: 'u', why: []}), /a value is/);
});

test('why.js is built only on u: it imports u and writes no table of its own', () => {
  const src = readFileSync(new URL('../why.js', import.meta.url), 'utf8');
  assert.match(src, /from "\.\/u\.js"/);
  assert.doesNotMatch(src, /=== "u" \? "u"|a === "0" \|\| b === "0"|a === "1" \|\| b === "1"/);   // u's own table lines, if copied
});
