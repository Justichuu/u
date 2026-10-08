import test from 'node:test';
import assert from 'node:assert/strict';
import {carry, swim, negate, positions, point, fishGraph, DEFAULT_GEOMETRY, geometry, graphFor, crossing} from '../fish.js';
import {not, tape, KNOWN} from '../u.js';
const symmetric = geometry({angle:0, phase:0, pace:1});

test('the branch is the translated and scaled standard cycloid, not a cubic', () => {
  const a = Math.PI / 6, scale = a + .5;
  for (const t of [.25, .5, .75, 1.3]) {
    const theta = Math.PI + a * (2*t-1), p = point(t);
    assert.ok(Math.abs(p.x - (theta-Math.sin(theta)-Math.PI)/scale) < 1e-14);
    assert.ok(Math.abs(p.y - (1-Math.cos(theta)-1-Math.sqrt(3)/2)/scale) < 1e-14);
  }
});

test('crossings and continued tails preserve the carried value and its observation', () => {
  for (const value of ['0', '1', 'u']) {
    const start = carry(value, 0, 'Read the recorded branch label.');
    for (const progress of [0, 1, 1.3, 12, 100]) {
      const state = swim(start, progress);
      assert.equal(state.value, value);
      assert.equal(state.reason, start.reason);
      assert.equal(state.progress, progress);
      assert.deepEqual(negate(negate(state)), state);
      assert.equal(negate(state).value, not(value));
      assert.equal(negate(state).progress, progress);
    }
    assert.equal(start.progress, 0);
    assert.ok(Object.isFrozen(start));
  }
  assert.equal(tape(), KNOWN);
});

test('symmetric control reflects the branches, including both sides of the tail', () => {
  for (const t of [0, 0.1, 0.5, 1, 1.1, 1.3, 12]) {
    const [a] = positions(carry('0', t), symmetric);
    const [b] = positions(negate(carry('0', t)), symmetric);
    assert.ok(Math.abs(a.x-b.x)<1e-14);
    assert.ok(a.y === -b.y);
    assert.equal(a.value, '0');
    assert.equal(b.value, '1');
  }
  assert.ok(positions(carry('0', 0.5))[0].y > 0);
  assert.ok(positions(carry('0', 1.1))[0].y < 0);
});

test('unsettled candidates remain distinguishable even when coordinates coincide', () => {
  for (const t of [0, 1]) {
    const candidates = positions(carry('u', t, 'Observe the carried label.'), symmetric);
    assert.deepEqual(candidates.map(c => c.value), ['0', '1']);
    assert.equal(candidates[0].x, candidates[1].x);
    assert.ok(candidates[0].y === candidates[1].y);
  }
  assert.equal(point(0).x, -1);
  assert.equal(point(1).x, 1);
  assert.equal(fishGraph.high, '13/10');
});

test('default geometry changes placement and progress while preserving state', () => {
  assert.deepEqual(geometry(), DEFAULT_GEOMETRY);
  assert.ok(Object.isFrozen(DEFAULT_GEOMETRY));
  for (const value of ['0','1']) {
    const p=point(0,value);
    assert.equal(p.x,-1); assert.ok(p.y===0);
  }
  const a=point(.5,'0'), b=point(.5,'1');
  assert.ok(Math.abs(a.x-b.x)>.01);
  assert.ok(Math.abs(a.y+b.y)>.01);
  const c=crossing();
  assert.ok(c && Math.abs(c.first-c.second)>.001);
  assert.ok(Math.hypot(c.x-point(c.second,'1').x,c.y-point(c.second,'1').y)<1e-10);
  assert.ok(c.first>0 && c.first<1.3 && c.second>0 && c.second<1.3);
  assert.equal(crossing(symmetric).first,1);
  assert.equal(crossing(symmetric).second,1);
  assert.equal(crossing({angle:180,phase:0,pace:1}),null);
  for (const t of [c.first,c.second]) {
    const s=carry('u',t,'Observe the carried label.');
    assert.deepEqual(positions(s).map(p=>p.value),['0','1']);
    assert.deepEqual(negate(negate(s)),s);
  }
});

test('calculator expressions and display coordinates describe the same curves', () => {
  // Evaluate only the expressions generated here, never caller-provided code.
  const evaluate = (expression,t) => Function('t','pi','sin','cos','sqrt','return '+expression)(t,Math.PI,Math.sin,Math.cos,Math.sqrt);
  for (const config of [DEFAULT_GEOMETRY,symmetric,geometry({angle:-2,phase:1e-7,pace:.9})]) {
    for (const value of ['0','1']) {
      const graph=graphFor(value,config);
      assert.ok(!/\d[eE][+-]?\d/.test(graph.x+graph.y));
      for (const t of [0,.25,.5,1,1.3]) {
        const p=point(t,value,config);
        assert.ok(Math.abs(p.x-evaluate(graph.x,t))<1e-13);
        assert.ok(Math.abs(p.y-evaluate(graph.y,t))<1e-13);
      }
    }
  }
});

test('invalid values, missing observations and impossible progress are refused', () => {
  for (const value of [0, 1, 'U', null, false]) assert.throws(() => carry(value));
  for (const why of ['', ' ', null, 1]) assert.throws(() => carry('u', 0, why));
  for (const progress of [-1, NaN, Infinity, '1', null]) {
    assert.throws(() => carry('0', progress));
    assert.throws(() => point(progress));
    assert.throws(() => swim(carry('1'), progress));
  }
  assert.throws(() => swim(carry('0', Number.MAX_VALUE), Number.MAX_VALUE));
  assert.throws(() => positions({value:'u',progress:1,reason:''}));
  assert.throws(() => negate({value:'u',progress:1,reason:''}));
  assert.throws(() => point(Number.MAX_VALUE));
  assert.throws(() => swim(carry('0', 2 ** 53), 1));
  assert.throws(() => swim({value:'0'}, 1));
  assert.throws(() => negate({value:'0',progress:0}));
  for (const g of [null,1,{angle:NaN},{phase:Infinity},{pace:0},{pace:-1},{pace:'1'}]) {
    assert.throws(() => geometry(g));
    assert.throws(() => point(.5,'0',g));
    assert.throws(() => graphFor('1',g));
  }
  for (const value of ['u','U',0,null]) {
    assert.throws(() => point(.5,value));
    assert.throws(() => graphFor(value));
  }
});
