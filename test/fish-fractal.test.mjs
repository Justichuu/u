import test from 'node:test';
import assert from 'node:assert/strict';
import {FRACTAL_SCALE, MAX_DEPTH, copies, mapPoint} from '../fish-fractal.js';
import {carry, negate, point, geometry} from '../fish.js';
import {tape, KNOWN} from '../u.js';

const close = (a,b) => assert.ok(Math.abs(a-b)<1e-12, `${a} differs from ${b}`);

test('finite previews include the seed and every generation in stable breadth-first order', () => {
  assert.equal(MAX_DEPTH,6);
  assert.ok(FRACTAL_SCALE>0 && FRACTAL_SCALE<1);
  for (let depth=0; depth<=MAX_DEPTH; depth++) {
    const nodes=copies(depth);
    assert.equal(nodes.length,2**(depth+1)-1);
    assert.equal(new Set(nodes.map(n=>n.address)).size,nodes.length);
    assert.ok(Object.isFrozen(nodes));
    for (const n of nodes) {
      assert.ok(Object.isFrozen(n));
      assert.equal(n.level,n.address.length);
      assert.match(n.address,/^[01]*$/);
      close(Math.hypot(n.a,n.b),FRACTAL_SCALE**n.level);
    }
    assert.deepEqual(nodes[0],{address:'',level:0,a:1,b:0,x:0,y:0});
  }
  assert.deepEqual(copies(2).map(n=>n.address),['','0','1','00','01','10','11']);
  assert.equal(copies().length,15);
});

test('each child head attaches to its parent branch and composition preserves the whole fish', () => {
  const config=geometry(), nodes=copies(4,config), byAddress=new Map(nodes.map(n=>[n.address,n]));
  for (const n of nodes.slice(1)) {
    const bit=n.address.at(-1), parent=byAddress.get(n.address.slice(0,-1));
    const anchor=mapPoint(parent,point(bit==='0'?.28:.68,bit,config));
    const head=mapPoint(n,{x:-1,y:0});
    close(head.x,anchor.x); close(head.y,anchor.y);
    const local=byAddress.get(bit), sample=point(.43,'1',config);
    const composed=mapPoint(parent,mapPoint(local,sample)), direct=mapPoint(n,sample);
    close(composed.x,direct.x); close(composed.y,direct.y);
    const p=mapPoint(n,{x:0,y:0}), q=mapPoint(n,{x:3,y:4});
    close(Math.hypot(p.x-q.x,p.y-q.y),5*FRACTAL_SCALE**n.level);
  }
});

test('phase and placement propagate through fixed recursive maps without changing logic', () => {
  const original=copies(3), changed=copies(3,{phase:.2});
  assert.deepEqual(original[0],changed[0]);
  assert.deepEqual(original[1],changed[1]);
  assert.notDeepEqual(original[2],changed[2]);
  assert.notDeepEqual(original.find(n=>n.address==='10'),changed.find(n=>n.address==='10'));
  const turned=copies(1,{angle:9});
  assert.notEqual(original[2].a,turned[2].a);
  const s=carry('u',.7,'Observe the carried branch.');
  for(const n of copies(6)) mapPoint(n,point(s.progress,'0'));
  assert.deepEqual(negate(negate(s)),s);
  assert.equal(tape(),KNOWN);
});

test('invalid depths, geometry, transforms and unrepresentable coordinates are refused', () => {
  for(const depth of [-1,7,.5,NaN,Infinity,'3',null]) assert.throws(()=>copies(depth));
  assert.throws(()=>copies(1,{pace:0}));
  assert.throws(()=>copies(1,{phase:Number.MAX_VALUE}));
  const identity=copies(0)[0];
  assert.deepEqual(mapPoint(identity,{x:2,y:-3}),{x:2,y:-3});
  for(const p of [null,{}, {x:'1',y:0},{x:NaN,y:0},{x:0,y:Infinity}]) assert.throws(()=>mapPoint(identity,p));
  for(const transform of [null,{}, {a:1,b:0,x:0,y:NaN},{a:'1',b:0,x:0,y:0}]) assert.throws(()=>mapPoint(transform,{x:0,y:0}));
  assert.throws(()=>mapPoint({a:2,b:0,x:0,y:0},{x:Number.MAX_VALUE,y:0}));
});
