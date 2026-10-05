// U5-bytes, built only on u. Justichuu, 5 October 2026: "find a replacement for 8 stupid fucking bits".
//
// Five u-bits make one U5-byte. Each u-bit is a three-faced digit, 0, 1 or u standing for 0, 1 and 2, so five hold
// 3^5 = 243 values, 7.92 bits by iDoMath: nearly an eight-bit byte's 256, in five digits instead of eight. Three is the
// cheapest whole-number base to build in (radix economy: a digit's cost is base / ln base, 2.731 for three against 2.885
// for two, iDoMath), and Setun (Moscow State University, 1958, Sobolev and Brusentsov) computed in three values.
//
// On hardware that stores bits, one U5-byte sits in one eight-bit byte. The 13 byte values above 242 can never be a
// U5-byte, so reading one is a witness that the byte changed: it unpacks to u, never to a guess. Inside a U5-byte the
// face u is a digit, the value two; a lone u from unpack is the unknown, as everywhere in u.

import { u, faces } from "./u.js";

const DIGITS = [faces[1], faces[0], faces[2]];   // 0, 1, u: u's own faces in counting order, not a table of this file's
const VALUE = Object.fromEntries(DIGITS.map((face, value) => [face, value]));

// A number from 0 to 242 as five u-bits, most significant first.
export const toU5 = n => {
  if (!Number.isInteger(n) || n < 0 || n > 242) throw new RangeError("a U5-byte holds 0 to 242");
  return Array.from({ length: 5 }, (_, i) => DIGITS[Math.floor(n / 3 ** (4 - i)) % 3]);
};

// Five u-bits back to the number they hold.
export const fromU5 = digits => {
  if (!Array.isArray(digits) || digits.length !== 5) throw new TypeError("a U5-byte is five u-bits");
  return digits.reduce((n, d) => { if (!(d in VALUE)) throw new TypeError("a u-bit says 0, 1 or u"); return n * 3 + VALUE[d]; }, 0);
};

// Stored in one eight-bit byte; read back, a byte above 242 says it changed.
export const pack = digits => fromU5(digits);
export const unpack = byte => {
  if (!Number.isInteger(byte) || byte < 0 || byte > 255) throw new RangeError("an eight-bit byte is 0 to 255");
  return byte > 242 ? u("this byte is above 242, so it was never a U5-byte: it changed after it was written") : toU5(byte);
};
