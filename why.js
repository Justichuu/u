// Reasons that travel, built only on u. Justichuu, 16 October 2026: "I want to make U the best", then "Sure, start with
// reasons". A u says the one observation that would settle it (u.js refuses a bare u), but u() hands back the bare face,
// so by the next step nobody could say why it was u. Here a value is its face and its reasons, and not, and and or
// carry them. A reason is its sentence: two u's that name the same sentence wait on the same observation.
//
// What is kept: a settled face (1 or 0) keeps no reason, since however its u's settle it stays as it is (u's not, and
// and or never unsettle a face). A u keeps the reasons of every u it was made from, each once, in the order met. So no
// reason that some combination of answers could need is ever dropped; one that turns out not to matter may be kept.
// For a single step the kept reasons are exactly the u's whose settling could change the face.
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
  if (!x || !faces.includes(x.face) || !Array.isArray(x.why) || (x.face === "u") !== (x.why.length > 0))
    throw new TypeError("a value is known(1 or 0) or unknown(reason)");
  return x;
};

// The reasons of the u's among the inputs, each sentence once, in the order met.
const waiting = (...xs) => [...new Set(xs.filter(x => x.face === "u").flatMap(x => x.why))];

export const not = a => said(notFace(value(a).face), a.why);
export const and = (a, b) => { const face = andFace(value(a).face, value(b).face); return said(face, face === "u" ? waiting(a, b) : []); };
export const or = (a, b) => { const face = orFace(value(a).face, value(b).face); return said(face, face === "u" ? waiting(a, b) : []); };
