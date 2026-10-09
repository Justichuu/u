// u-bytes, built only on u. Justichuu, 9 October 2026: "U + U2 = U2-Byte", "3 us in sequence is the bite. You define
// where a u is set in the binary numbers until you set 3 u’s in the logic/code", "So bit depth = u but definable", and
// "I would call it an actual u-byte rather than a u2-byte if we determined an answer".
//
// A u-byte is a run of u's faces that closes on a third u. Measured that day over every stream: each one is exactly two
// parts, the bits between the u's (the 1 and 0 base of the Formula for the Unknown's triangle) and where the u's are set
// (its U), and the count of streams is the one times the other. Its depth is u but definable: as many bits as you set.
// Two ways to close, both kept ("aren’t they both important to know?"):
//   whole: the third u anywhere closes it, so U is three u's for the whole byte.
//   every: three u's side by side close it, so each bit carries its own u-bit (none, one or two u's in front of it).
// This file holds no table of its own.

import { faces } from "./u.js";

const U = faces[2];
const face = f => { if (!faces.includes(f)) throw new TypeError("a u-byte holds 1, 0 or u"); return f; };
const bit = b => { if (b !== "1" && b !== "0") throw new TypeError("the bits between say 1 or 0"); return b; };

export const rules = Object.freeze({ whole: (run, count) => count === 3, every: run => run === 3 });
const rule = by => { if (!Object.hasOwn(rules, by)) throw new TypeError("a u-byte closes by whole or every"); return rules[by]; };

// A stream of faces cut into u-bytes. One not yet closed is left open, never guessed shut.
export const bytes = (stream, by = "whole") => {
  const closes = rule(by), out = [];
  let open = "", run = 0, count = 0;
  for (const f of stream) {
    open += face(f); run = f === U ? run + 1 : 0; count += f === U;
    if (closes(run, count)) { out.push(open); open = ""; run = 0; count = 0; }
  }
  return { bytes: out, open };
};

// One u-byte as its two parts, and back: the bits between, and where each u is set.
export const split = byte => ({ bits: [...byte].filter(f => face(f) !== U).join(""), at: [...byte].flatMap((f, i) => (f === U ? [i] : [])) });
export const join = ({ bits, at }) => {
  let k = 0;
  return Array.from({ length: bits.length + at.length }, (_, i) => (at.includes(i) ? U : bit(bits[k++]))).join("");
};
