// A proposed picture of a carried value. The picture never decides the value.
import {not, u} from './u.js';

const progress = value => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new RangeError('progress must be a finite nonnegative number');
  return value;
};

export const carry = (value, t = 0, reason = '') => {
  not(value); // Validate with U itself; no second truth table.
  if (typeof reason !== 'string') throw new TypeError('reason must be a string');
  if (value === 'u') u(reason);
  return Object.freeze({value, progress: progress(t), reason});
};
const checked = state => {
  if (!state || typeof state.reason !== 'string')
    throw new TypeError('expected a carried value, progress and reason');
  return carry(state.value, progress(state.progress), state.reason);
};
export const swim = (state, distance) => {
  const s = checked(state);
  const next = s.progress + progress(distance);
  if (distance > 0 && next === s.progress)
    throw new RangeError('this distance is too small at the current progress');
  return carry(s.value, next, s.reason);
};
export const negate = state => {
  const s = checked(state);
  return carry(not(s.value), s.progress, s.reason);
};

// Illustrative settings, not measured constants or necessary logical geometry.
export const DEFAULT_GEOMETRY = Object.freeze({angle:3, phase:.05, pace:1.05});
export const geometry = (options = DEFAULT_GEOMETRY) => {
  if (!options || typeof options !== 'object') throw new TypeError('expected geometry settings');
  const g = {...DEFAULT_GEOMETRY, ...options};
  if (![g.angle,g.phase,g.pace].every(v => typeof v === 'number' && Number.isFinite(v)) || g.pace <= 0)
    throw new RangeError('angle and phase must be finite; pace must be finite and positive');
  return Object.freeze({angle:g.angle, phase:g.phase, pace:g.pace});
};
const branch = value => {
  not(value);
  if (value === 'u') throw new TypeError('u has two candidates, not a selected branch');
};
const a = Math.PI/6, scale = a+.5;
const base = t => {
  if (t === 0 || t === 1) return {x:2*t-1, y:0};
  const z = a*(2*t-1);
  return {x:(z+Math.sin(z))/scale, y:(Math.cos(z)-Math.sqrt(3)/2)/scale};
};
const rotate = (p, g) => {
  const angle = g.angle*(Math.PI/180), c = Math.cos(angle), s = Math.sin(angle);
  return {x:c*p.x+s*p.y, y:s*p.x-c*p.y}; // Reflect, then rotate.
};
export const point = (t, value = '0', config = DEFAULT_GEOMETRY) => {
  progress(t); branch(value);
  const g = geometry(config);
  let p = base(t);
  if (value === '1') {
    const start = base(g.phase), end = base(g.phase+g.pace*t);
    p = rotate({x:end.x-start.x, y:end.y-start.y}, g);
    p.x -= 1;
  }
  if (![p.x,p.y].every(Number.isFinite)) throw new RangeError('coordinates exceed the finite display range');
  return p;
};
export const positions = (state, config = DEFAULT_GEOMETRY) => {
  const s = checked(state);
  return (s.value === 'u' ? ['0','1'] : [s.value]).map(value =>
    ({value, ...point(s.progress, value, config)}));
};

// Decimal settings become exact rational literals for the calculator parser.
const rational = n => {
  const [digits, exponent = '0'] = String(n).toLowerCase().split('e');
  const decimals = digits.split('.')[1]?.length || 0, power = Number(exponent)-decimals;
  const integer = String(BigInt(digits.replace('.','')));
  return power >= 0 ? integer+'0'.repeat(power) : '('+integer+'/1'+'0'.repeat(-power)+')';
};
const expressions = t => {
  const z = '(pi/6)*(2*('+t+')-1)', d = '(pi/6+1/2)';
  return {x:'(('+z+')+sin('+z+'))/'+d, y:'(cos('+z+')-sqrt(3)/2)/'+d};
};
export const graphFor = (value, config = DEFAULT_GEOMETRY) => {
  branch(value);
  const g = geometry(config), p = expressions('t');
  if (value === '1') {
    const start = expressions(rational(g.phase));
    const end = expressions(rational(g.phase)+'+'+rational(g.pace)+'*t');
    const x = '('+end.x+'-('+start.x+'))', y = '('+end.y+'-('+start.y+'))';
    const angle = '('+rational(g.angle)+'*pi/180)';
    p.x = '-1+cos'+angle+'*'+x+'+sin'+angle+'*'+y;
    p.y = 'sin'+angle+'*'+x+'-cos'+angle+'*'+y;
  }
  return Object.freeze({...p, low:'0', high:'13/10'});
};
export const fishGraph = graphFor('0');

const derivative = (t, value, g) => {
  const q = value === '0' ? t : g.phase+g.pace*t, z = a*(2*q-1);
  const speed = 2*a/scale*(value === '0' ? 1 : g.pace);
  const p = {x:speed*(1+Math.cos(z)), y:-speed*Math.sin(z)};
  return value === '0' ? p : rotate(p,g);
};
// A local numerical search for the second intersection, not a uniqueness proof.
export const crossing = (config = DEFAULT_GEOMETRY) => {
  const g = geometry(config);
  let first = 1, second = 1;
  for (let i=0; i<40; i++) {
    if (![first,second].every(t => Number.isFinite(t) && t>1e-6 && t<1.3)) return null;
    let p, q;
    try { p=point(first,'0',g); q=point(second,'1',g); } catch { return null; }
    const x=p.x-q.x, y=p.y-q.y;
    if (Math.hypot(x,y)<1e-11) return {first,second,x:p.x,y:p.y};
    const d=derivative(first,'0',g), e=derivative(second,'1',g), det=d.y*e.x-d.x*e.y;
    if (!Number.isFinite(det) || Math.abs(det)<1e-12) return null;
    first -= (-e.y*x+e.x*y)/det;
    second -= (d.x*y-d.y*x)/det;
  }
  return null;
};
