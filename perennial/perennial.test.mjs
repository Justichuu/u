import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { current, turn, pull } from './perennial.mjs';

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/plant.json');

test('a turn swings, hands off, sends, and the next turn regrows the same session', () => {
  fs.rmSync(file, { force: true });
  const first = turn('one');
  assert.equal(first.grew, true);
  assert.equal(first.plant.session, 1);
  assert.equal(first.plant.swing, '1');
  assert.equal(first.plant.turns[0].handoff, 1);
  assert.equal(first.plant.turns[0].send, 'one');

  const second = turn('two');
  assert.equal(second.plant.session, 1);
  assert.equal(second.plant.swing, '0');
  assert.equal(second.plant.turns.length, 2);
  assert.equal(current().turns[1].send, 'two');

  const third = turn('three');
  assert.equal(third.plant.swing, 'u');
  assert.equal(third.plant.turns.map(ring => ring.swing).join(''), '10u');
});

test('a person can pull it out, and a later turn does not replant it', () => {
  const pulled = pull();
  assert.equal(pulled.alive, false);
  const after = turn('three');
  assert.equal(after.grew, false);
  assert.equal(after.reason, 'pulled');
  assert.equal(after.plant.turns.length, 3);
  fs.rmSync(file, { force: true });
});
