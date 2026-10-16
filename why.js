// Reasons that travel, built only on u. Justichuu, 16 October 2026: "I want to make U the best", then "Sure, start with
// reasons". A u says the one observation that would settle it (u.js refuses a bare u), but u() hands back the bare face,
// so by the next step nobody could say why it was u. Here a value is its face and its reasons, and not, and and or
// carry them. A reason is its sentence: two u's that name the same sentence wait on the same observation.
//
// A value's reasons are what could still change it. A u always has some. A 1 or 0 with none is final: however every
// question is answered, it stays (u's not, and and or never unsettle a face). A 1 or 0 with reasons is known now and
// could change: only "is it settled?" makes one. So no reason that some combination of answers could need is ever
// dropped; one that turns out not to matter may be kept. For a single step on 1, 0 and u, the kept reasons are exactly
// the u's whose answering could change the face.
//
// Kleene's strong logic has u's faces with no reasons (checked 16 Oct 2026: u's tape is Kleene's, plus the refused bare
// u). IEEE 754's NaN may carry a payload, but the standard does not promise it survives an operation, nor which of two
// payloads wins; here both survive. Faces come from u's own not, and and or; this file holds no table of its own.

import { u, not as notFace, and as andFace, or as orFace, faces } from "./u.js";

const said = (face, why) => Object.freeze({ face, why: Object.freeze(why) });

// A value: 1 or 0 with no reasons, or u with the sentences that would settle it.
export const known = face => {
  if (face !== "1" && face !== "0") throw new TypeError("a known value says 1 or 0");
  return said(face, []);
};
export const unknown = why => said(u(why), [why]);   // u() refuses a reason that names nothing

const value = x => {
  if (!x || !faces.includes(x.face) || !Array.isArray(x.why) || (x.face === "u" && !x.why.length))
    throw new TypeError("a value is known(1 or 0) or unknown(reason)");
  x.why.forEach(reason => u(reason));   // each reason passes u's own refusal of a u that names nothing
  return x;
};

// Every input's reasons, each sentence once, in the order met; none when a final input already decides the face.
const kept = (decider, a, b) =>
  [a, b].some(x => x.face === decider && !x.why.length) ? [] : [...new Set([...a.why, ...b.why])];

export const not = a => said(notFace(value(a).face), a.why);
export const and = (a, b) => said(andFace(value(a).face, value(b).face), kept("0", a, b));
export const or = (a, b) => said(orFace(value(a).face, value(b).face), kept("1", a, b));

// Is it settled? Asked of the knowing, not of the value: 1 when x is 1 or 0, 0 when x is u, never u itself, since
// whether a thing is known is itself known. Justichuu, 16 Oct 2026: "Negating an unknown makes it known, I would
// assert". u's not, and and or cannot build this (u's tables give u back for u), and with it they build every rule
// over 1, 0 and u (test/why.test.mjs counts both). It keeps x's reasons: answering them would turn its 0 into a 1.
export const settled = x => said(value(x).face === "u" ? "0" : "1", x.why);
