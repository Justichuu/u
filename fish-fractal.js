// Finite previews of the condensation fractal F = seed ∪ T0(F) ∪ T1(F).
// The mathematical limit includes closure. Addresses are paths, not truth values.
import {DEFAULT_GEOMETRY, geometry, point} from './fish.js';

export const FRACTAL_SCALE = .55;
export const MAX_DEPTH = 6;
const finiteFields = (object, fields) => {
  if (!object || !fields.every(key => typeof object[key] === 'number' && Number.isFinite(object[key])))
    throw new RangeError('coordinates and transform coefficients must be finite numbers');
  return object;
};
export const mapPoint = (transform, p) => {
  const t=finiteFields(transform,['a','b','x','y']);
  finiteFields(p,['x','y']);
  return finiteFields({x:t.a*p.x-t.b*p.y+t.x, y:t.b*p.x+t.a*p.y+t.y},['x','y']);
};
const compose = (parent, child) => {
  const p=mapPoint(parent,child);
  return finiteFields({a:parent.a*child.a-parent.b*child.b,
    b:parent.b*child.a+parent.a*child.b, ...p},['a','b','x','y']);
};
export const copies = (depth = 3, config = DEFAULT_GEOMETRY) => {
  if (!Number.isInteger(depth) || depth<0 || depth>MAX_DEPTH)
    throw new RangeError('depth must be an integer from 0 to '+MAX_DEPTH);
  const g=geometry(config), nodes=[Object.freeze({address:'',level:0,a:1,b:0,x:0,y:0})];
  if (depth===0) return Object.freeze(nodes);
  const maps=['0','1'].map(value => {
    const anchor=point(value==='0'?.28:.68,value,g);
    const angle=(value==='0'?30:-30+g.angle)*(Math.PI/180);
    const a=FRACTAL_SCALE*Math.cos(angle), b=FRACTAL_SCALE*Math.sin(angle);
    return finiteFields({a,b,x:anchor.x+a,y:anchor.y+b},['a','b','x','y']);
  });
  for (let i=0; i<nodes.length; i++) {
    const parent=nodes[i];
    if (parent.level===depth) continue;
    for (let bit=0; bit<2; bit++) nodes.push(Object.freeze({address:parent.address+bit,
      level:parent.level+1, ...compose(parent,maps[bit])}));
  }
  return Object.freeze(nodes);
};
