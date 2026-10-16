import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as face from '../u.js';
import * as why from '../why.js';
import {agree} from '../u2.js';

// A formula is a tree: a reason's name, a known '1' or '0', or [op, ...parts]. Evaluated with the reasons carried
// (ops: why.js or a planted copy) and, separately, on faces alone with each reason answered 1, answered 0 or left u.
const ATOMS = ['r', 's', 't', '1', '0'];
const carry = (ops, f) => typeof f === 'string' ? (f === '1' || f === '0' ? ops.known(f) : ops.unknown(f))
  : f.length === 2 ? ops[f[0]](carry(ops, f[1]))
  : f.length === 4 ? ops.witnesses({first: carry(ops, f[1]), second: carry(ops, f[2]), third: carry(ops, f[3])})
  : ops[f[0]](carry(ops, f[1]), carry(ops, f[2]));
const SETTLED = x => (x === 'u' ? '0' : '1');   // the reference the test holds why.settled to
const ONE = fs => fs.every(f => f === '1') ? '1' : fs.every(f => f === '0') ? '0' : 'u';   // and witnesses() to: all or u
const onFaces = (f, answer) => typeof f === 'string' ? (f === '1' || f === '0' ? f : answer[f])
  : f[0] === 'not' ? face.not(onFaces(f[1], answer)) : f[0] === 'settled' ? SETTLED(onFaces(f[1], answer))
  : f[0] === 'witnesses' ? ONE(f.slice(1).map(g => onFaces(g, answer)))
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
    : next() < 0.25 ? [next() < 0.5 ? 'not' : 'settled', make(d - 1)]
    : next() < 0.2 ? ['witnesses', make(d - 1), make(d - 1), make(d - 1)] : [next() < 0.5 ? 'and' : 'or', make(d - 1), make(d - 1)];
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
  assert.deepEqual(why.settled(why.known('1')), {face: '1', why: [], by: []});
  assert.deepEqual(why.settled(why.known('0', 'iDoMath')), {face: '1', why: [], by: ['iDoMath']});
  assert.deepEqual(why.settled(why.unknown('is the door locked?')), {face: '0', why: ['is the door locked?'], by: []});
  const door = why.unknown('is the door locked?');
  assert.deepEqual(why.not(why.settled(door)), {face: '1', why: ['is the door locked?'], by: []});   // "is it unknown?" is known: 1
  assert.deepEqual(why.and(why.settled(door), why.known('0')), {face: '0', why: [], by: []});        // a final 0 decides
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
  assert.deepEqual(why.and(why.and(door, alarm), why.known('0')), {face: '0', why: [], by: []});
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

const three = ATOMS.flatMap(a => ATOMS.flatMap(b => ATOMS.map(c => ['witnesses', a, b, c])));

test('three witnesses are one answer: all say it, or u; the U2-byte\'s own rule where they overlap', () => {
  const F = ['1', '0', 'u'], of = f => (f === 'u' ? why.unknown(`witness says u`) : why.known(f));
  for (const a of F) for (const b of F) for (const c of F) {
    const one = why.witnesses({iDoMath: of(a), person: of(b), sensor: of(c)});
    assert.equal(one.face, ONE([a, b, c]), `${a}${b}${c}`);
    if (a !== 'u' && b !== 'u') assert.equal(one.face, agree(a, b, c), `u2 ${a}${b}${c}`);
  }
  assert.equal(three.length, 125);
  assert.deepEqual(breaks(why, three), []);
});

test('a disagreement names who said what; a u witness keeps its reasons; agreeing final witnesses are final', () => {
  assert.deepEqual(why.witnesses({iDoMath: why.known('1'), sensor: why.known('0'), person: why.known('1')}),
    {face: 'u', why: ['iDoMath says 1, sensor says 0, person says 1'], by: ['iDoMath', 'sensor', 'person']});
  assert.deepEqual(why.witnesses({iDoMath: why.known('1'), sensor: why.unknown('is the sensor plugged in?'), person: why.known('1')}),
    {face: 'u', why: ['is the sensor plugged in?'], by: ['iDoMath', 'sensor', 'person']});
  assert.deepEqual(why.witnesses({iDoMath: why.known('0'), sensor: why.known('0'), person: why.known('0')}), {face: '0', why: [], by: ['iDoMath', 'sensor', 'person']});
  assert.throws(() => why.witnesses({}), /at least one witness/);
});

test('a majority vote, or a witness ignored for being u, breaks the rule, so the check can fail', () => {
  const F = ['1', '0', 'u'], combos = F.flatMap(a => F.flatMap(b => F.map(c => [a, b, c])));
  const wrong = rule => combos.filter(fs => rule(fs) !== ONE(fs)).length;
  const majority = fs => ['1', '0'].find(v => fs.filter(f => f === v).length >= 2) ?? 'u';
  const skipsU = fs => { const said = fs.filter(f => f !== 'u'); return said.length ? ONE(said) : 'u'; };
  const real = fs => why.witnesses(Object.fromEntries(fs.map((f, i) => [`w${i}`, f === 'u' ? why.unknown('w') : why.known(f)]))).face;
  assert.equal(wrong(real), 0);
  assert.ok(wrong(majority) > 0, 'a majority vote went unseen');
  assert.ok(wrong(skipsU) > 0, 'ignoring a u witness went unseen');
});

test('settle asks every settler each question; a throw or a bare u is heard as u, never as an answer', () => {
  const sure = q => (q === '2+2 = 4' ? why.known('1') : q === '2+2 = 5' ? why.known('0') : why.unknown(`no way to check "${q}"`));
  const both = (ask) => why.and(ask('2+2 = 4'), ask('is the door locked?'));
  assert.deepEqual(why.settle(ask => ask('2+2 = 4'), {iDoMath: sure, person: sure, sensor: sure}),
    {face: '1', why: [], by: ['iDoMath: 2+2 = 4', 'person: 2+2 = 4', 'sensor: 2+2 = 4']});
  assert.deepEqual(why.settle(ask => ask('2+2 = 5'), {iDoMath: sure, person: sure}), {face: '0', why: [], by: ['iDoMath: 2+2 = 5', 'person: 2+2 = 5']});
  const door = why.settle(both, {iDoMath: sure, person: sure});
  assert.deepEqual(door, {face: 'u', why: ['is the door locked?', 'no way to check "is the door locked?"'],
    by: ['iDoMath: 2+2 = 4', 'person: 2+2 = 4', 'iDoMath: is the door locked?', 'person: is the door locked?']});
  const throws = why.settle(ask => ask('2+2 = 4'), {iDoMath: sure, sensor: () => { throw new Error('unplugged'); }});
  assert.deepEqual(throws, {face: 'u', why: ['2+2 = 4', 'sensor did not answer "2+2 = 4": unplugged'], by: ['iDoMath: 2+2 = 4', 'sensor: 2+2 = 4']});
  const bare = why.settle(ask => ask('2+2 = 4'), {iDoMath: sure, person: () => ({face: 'u', why: []})});
  assert.equal(bare.face, 'u');
  assert.match(bare.why[1], /person did not answer "2\+2 = 4": a value is/);
  const split = why.settle(ask => ask('2+2 = 4'), {iDoMath: sure, person: () => why.known('0')});
  assert.deepEqual(split, {face: 'u', why: ['2+2 = 4', 'iDoMath says 1, person says 0'], by: ['iDoMath: 2+2 = 4', 'person: 2+2 = 4']});
  assert.throws(() => why.settle(ask => ask(''), {iDoMath: sure}), /names the one observation/);
});

// Who answered: each question answered by two fake witnesses, each saying 1, 0 or u. Two answer tables that agree on
// every "witness: question" named in by, and on every question named in why, must give the same face.
const WITNESSES = ['first', 'second'], CELLS = q => WITNESSES.map(w => `${w}: ${q}`);
const fakes = table => Object.fromEntries(WITNESSES.map(w => [w, q => table[`${w}: ${q}`] === 'u'
  ? why.unknown(`${w} cannot tell ${q}`) : why.known(table[`${w}: ${q}`])]));
const asked = (ops, f, ask) => typeof f === 'string' ? (f === '1' || f === '0' ? ops.known(f) : ask(f))
  : f.length === 2 ? ops[f[0]](asked(ops, f[1], ask)) : ops[f[0]](asked(ops, f[1], ask), asked(ops, f[2], ask));
function namesWrong(ops, formulas) {
  const bad = [];
  for (const f of formulas) {
    const qs = [...new Set(reasonsIn(f))], cells = qs.flatMap(CELLS), tables = answers(cells);
    const outs = tables.map(table => ops.settle(ask => asked(ops, f, ask), fakes(table)));
    // For each table: the answers it names. Every table that agrees with it there must give its face.
    const named = outs.map(out => cells.filter(c => out.by.includes(c) || out.why.includes(c.split(': ')[1])));
    const groups = new Map();   // the named cells -> (those cells' answers -> faces seen over every table)
    for (const n of new Set(named.map(n => n.join('|')))) {
      const cs = n ? n.split('|') : [], faces = new Map();
      tables.forEach((t, i) => { const k = cs.map(c => t[c]).join(''); faces.set(k, (faces.get(k) || new Set()).add(outs[i].face)); });
      groups.set(n, faces);
    }
    if (tables.some((t, i) => groups.get(named[i].join('|')).get(named[i].map(c => t[c]).join('')).size > 1)) bad.push(f);
  }
  return bad;
}

test('by names every answer the face rests on: tables that agree there give the same face', () => {
  assert.deepEqual(namesWrong(why, depth1), []);
  assert.deepEqual(namesWrong(why, sample(3, 300, 17102026).filter(f => !JSON.stringify(f).includes('witnesses'))), []);
});

test('an and that drops the second input\'s answers is caught, so the check can fail', () => {
  const dropsSecond = {...why, and: (a, b) => { const out = why.and(a, b); return out.face === '1' ? {...out, by: [...a.by]} : out; }};
  assert.ok(namesWrong(dropsSecond, depth1).length > 0, 'a by missing the second answer went unseen');
});

test('a witness is named by a sentence, and a settler\'s answer may come without by', () => {
  assert.deepEqual(why.known('1', 'iDoMath').by, ['iDoMath']);
  assert.throws(() => why.known('1', ''), /a witness is named/);
  assert.throws(() => why.not({face: '1', why: [], by: ['']}), /a value is/);
  assert.deepEqual(why.settle(ask => ask('2+2 = 4'), {iDoMath: () => ({face: '1', why: []})}).by, ['iDoMath: 2+2 = 4']);
});
