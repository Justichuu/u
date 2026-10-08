// Faces are 1, 0, and u. A turn never flips 1 and 0 forever.
// Each turn hands off and sends. The same session regrows.
// A person can pull it out.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data', 'plant.json');

export function load() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function save(plant) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(plant, null, 2) + '\n');
  return plant;
}

const FACES = ['1', '0', 'u'];

function nextFace(face) {
  const at = FACES.indexOf(face);
  if (at < 0) return 'u';
  return FACES[(at + 1) % FACES.length];
}

export function plantNew() {
  return save({
    alive: true,
    session: 1,
    swing: 'u',
    settle: 'A later observation can settle u. A turn does not.',
    turns: []
  });
}

export function current() {
  return load() || plantNew();
}

// One turn. Does not replant: the session stays, a ring is added.
export function turn(send) {
  const plant = current();
  if (!plant.alive) return { plant, grew: false, reason: 'pulled' };
  const text = String(send ?? '').trim();
  if (!text) return { plant, grew: false, reason: 'empty send' };
  plant.swing = nextFace(plant.swing);
  if (!FACES.includes(plant.swing)) plant.swing = 'u';
  const recent = plant.turns.slice(-2).map(ring => ring.swing);
  if (recent.length === 2 && recent.every(face => face === '1' || face === '0') && plant.swing !== 'u') {
    plant.swing = 'u';
  }
  plant.turns.push({
    n: plant.turns.length + 1,
    swing: plant.swing,
    handoff: plant.session,
    send: text,
    settle: plant.swing === 'u' ? plant.settle : ''
  });
  return { plant: save(plant), grew: true };
}

// The person pulls the plant. Later turns do not regrow it.
export function pull() {
  const plant = current();
  plant.alive = false;
  return save(plant);
}

function print(plant) {
  const lines = [
    plant.alive ? 'in the ground' : 'pulled',
    'session ' + plant.session,
    'swing ' + plant.swing
  ];
  for (const ring of plant.turns) {
    lines.push(ring.n + ' swing ' + ring.swing + ' handoff ' + ring.handoff + ' send ' + ring.send);
  }
  console.log(lines.join('\n'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [act, ...rest] = process.argv.slice(2);
  if (act === 'turn') print(turn(rest.join(' ')).plant);
  else if (act === 'pull') print(pull());
  else if (act === 'show' || !act) print(current());
  else {
    console.error('turn <send> | pull | show');
    process.exit(2);
  }
}
