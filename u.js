// The U device. Universal device, unknown device, U. Any U name reaches it.
//
// Three faces: 1, 0 and u. It combines them without ever turning u into a
// guess, and it will not hand you a u that does not say what would settle it.
//
// The fingerprint at the bottom is computed from the four functions above it.
// It is not read from a comment. Delete this header and it comes out the same.
// PROVENANCE.md records contributions. Equal tables do not prove authorship.

import { pathToFileURL } from "node:url";

export const u = why => {
  if (typeof why !== "string" || !why.trim()) throw new Error("a u names the one observation that would settle it");
  return "u";
};

const face = value => {
  if (!["1", "0", "u"].includes(value)) throw new TypeError("expected 1, 0 or u as a string");
  return value;
};
export const not = a => { face(a); return a === "u" ? "u" : a === "1" ? "0" : "1"; };
export const and = (a, b) => { face(a); face(b); return a === "0" || b === "0" ? "0" : a === "u" || b === "u" ? "u" : "1"; };
export const or = (a, b) => { face(a); face(b); return a === "1" || b === "1" ? "1" : a === "u" || b === "u" ? "u" : "0"; };

// Every face the device can show, in the order he says them.
export const faces = ["1", "0", "u"];

// This finite tape records not over each face,
// and over each pair, or over each pair, then one character for whether the
// device still refuses a bare u. It is a behavior signature, not an author ID.
export const tape = () =>
  faces.map(not).join("") +
  faces.map(a => faces.map(b => and(a, b)).join("")).join("") +
  faces.map(a => faces.map(b => or(a, b)).join("")).join("") +
  (() => { try { u(); return "0"; } catch { return "1"; } })();

export const KNOWN = "01u10u000u0u11110u1uu1";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const t = tape();
  console.log("tape      ", t);
  console.log("known     ", KNOWN);
  console.log("match     ", t === KNOWN ? "1" : "0");
  console.log("all is    ", or("u", not("u")));   // not 1
  console.log("and isn't ", and("u", not("u")));  // not 0
}
