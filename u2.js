// U2-bytes, built only on u. Justichuu, 3 October 2026: "Rules for U2, only build off u, as i would.", "a 2 bit + u-bit
// system called U2-bytes", and before it, "It just needed 3 witnesses in the bits to form a singular smaller byte."
//
// A U2-byte holds three witnesses: two bits that say 1 or 0, and one u-bit that may also say u. Its face is 1 only when all
// three say 1, 0 only when all three say 0, and u until they agree (his Z: "U until all three agree"). Every face below
// comes from u's own not, and, or and u(); this file holds no table of its own.
//
// It packs into four bits, a byte smaller than a byte: bit, bit, then the u-bit in two bits.
// 11 is 1, 10 is 0, 00 is u, and 01 is refused, as u refuses a u that names nothing.

import { u, not, and } from "./u.js";

const bit = b => { if (b !== "1" && b !== "0") throw new TypeError("a bit says 1 or 0"); return b; };

// The face of three witnesses: what all three agree on, else u.
export const agree = (first, second, third) => {
  bit(first); bit(second);
  const all = and(and(first, second), third), none = and(and(not(first), not(second)), not(third));
  return all === "1" ? "1" : none === "1" ? "0" : u("the three witnesses do not agree yet");
};

const UBIT = { "1": 0b11, "0": 0b10, u: 0b00 };

// Four bits as a number from 0 to 15: first bit, second bit, then the u-bit's two.
export const pack = (first, second, third) => {
  bit(first); bit(second);
  if (!(third in UBIT)) throw new TypeError("a u-bit says 1, 0 or u");
  return (Number(first) << 3) | (Number(second) << 2) | UBIT[third];
};

export const unpack = n => {
  if (!Number.isInteger(n) || n < 0 || n > 15) throw new RangeError("a U2-byte is four bits, 0 to 15");
  const low = n & 0b11;
  if (low === 0b01) throw new Error("01 is a bare u: it names nothing that would settle it");
  const third = low === 0b11 ? "1" : low === 0b10 ? "0" : u("the u-bit's witness has not settled");
  return [String((n >> 3) & 1), String((n >> 2) & 1), third];
};
