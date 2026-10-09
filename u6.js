// U6, built only on u. Justichuu, 8 October 2026: "two 3 value logics mirroring 3 2 value logics to be 6 value logic
// through binary logic of 2 logics = 6?", then "okay implement hexagram whereever." and "U6 logic?". And, 9 October:
// "Odd logic is weirder than even logic."
//
// Two 3-value logics, each with u's faces 1, 0 and u, side by side: six values (2 x 3, iDoMath). Read across, the
// same six are three 2-value logics: each face, seen from either half (3 x 2). They are the hexagram's six corners,
// one triangle upright and one mirrored. The two logics are the method's halves, chuu and chau, written as its ledger
// writes them (R: that is how the Faces chart draws them; the words above name two logics, not which two).
//
// Odd logic is weirder: a not that undoes itself, over an odd number of values, must leave one value as it was, and
// u's not leaves u. Over six values the mirror can move every value, and it does. Inside one half not, and and or are
// u's own; across halves the only move is the mirror. This file holds no table of its own.

import { not, and, or, faces } from "./u.js";

export const halves = ["chuu", "chau"];

const half = h => { if (!halves.includes(h)) throw new TypeError("a half is chuu or chau"); return h; };
const face = f => (not(f), f);   // u's own check: anything but 1, 0 or u is refused there

// One U6 value: a half and a face.
export const u6 = (h, f) => [half(h), face(f)];

// All six, half by half.
export const six = halves.flatMap(h => faces.map(f => [h, f]));

// The same face, from the other half.
export const mirror = ([h, f]) => [halves[1 - halves.indexOf(half(h))], face(f)];

const same = (a, b) => { if (half(a[0]) !== half(b[0])) throw new TypeError("and and or work inside one half"); return a[0]; };
export const not6 = ([h, f]) => [half(h), not(f)];
export const and6 = (a, b) => [same(a, b), and(a[1], b[1])];
export const or6 = (a, b) => [same(a, b), or(a[1], b[1])];
