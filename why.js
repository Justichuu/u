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

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { u, not as notFace, and as andFace, or as orFace, faces } from "./u.js";

const said = (face, why, by = []) => Object.freeze({ face, why: Object.freeze(why), by: Object.freeze(by) });

// A value: 1 or 0 with no reasons, or u with the sentences that would settle it. `by` names who answered, when a
// witness did: settle() writes each entry as "witness: question", so a formula of many questions says who answered
// which. A value's face rests on the answers its `by` names and the questions its reasons name, and on nothing else.
export const known = (face, by) => {
  if (face !== "1" && face !== "0") throw new TypeError("a known value says 1 or 0");
  if (by !== undefined && (typeof by !== "string" || !by.trim())) throw new TypeError("a witness is named by a sentence");
  return said(face, [], by === undefined ? [] : [by]);
};
export const unknown = why => said(u(why), [why]);   // u() refuses a reason that names nothing

const value = x => {
  if (!x || !faces.includes(x.face) || !Array.isArray(x.why) || (x.face === "u" && !x.why.length) ||
      (x.by !== undefined && !(Array.isArray(x.by) && x.by.every(b => typeof b === "string" && b.trim()))))
    throw new TypeError("a value is known(1 or 0) or unknown(reason)");
  x.why.forEach(reason => u(reason));   // each reason passes u's own refusal of a u that names nothing
  return said(x.face, [...x.why], [...(x.by ?? [])]);   // a settler's answer may come without `by`
};

const union = (...lists) => [...new Set(lists.flat())];

// When a final input already decides the face (a 0 for and, a 1 for or, with no reasons), nothing could change it
// and it rests on the deciders' answers alone. Otherwise every input's reasons and answers count, a u's too.
const step = (face, decider, ...inputs) => {
  const [a, b] = inputs.map(value), deciders = [a, b].filter(x => x.face === decider && !x.why.length);
  return deciders.length ? said(face(a.face, b.face), [], union(...deciders.map(x => x.by)))
    : said(face(a.face, b.face), union(a.why, b.why), union(a.by, b.by));
};

export const not = a => { const x = value(a); return said(notFace(x.face), x.why, x.by); };
export const and = (a, b) => step(andFace, "0", a, b);
export const or = (a, b) => step(orFace, "1", a, b);

// Is it settled? Asked of the knowing, not of the value: 1 when x is 1 or 0, 0 when x is u, never u itself, since
// whether a thing is known is itself known. Justichuu, 16 Oct 2026: "Negating an unknown makes it known, I would
// assert". u's not, and and or cannot build this (u's tables give u back for u), and with it they build every rule
// over 1, 0 and u (test/why.test.mjs counts both). It keeps x's reasons: answering them would turn its 0 into a 1.
export const settled = a => { const x = value(a); return said(x.face === "u" ? "0" : "1", x.why, x.by); };

// Witnesses, many working as one. Justichuu, 16 Oct 2026: "consider 3 things working that are one thing but 3 things
// independently could be u". Each witness's value, by name: the one answer is 1 only when every witness says 1, 0 only
// when every one says 0, and u otherwise, the U2-byte's rule ("U until all three agree") with any witness free to be
// u. Never a vote: a majority would turn a disagreement into a guess. When the answer is u and any witness did answer,
// who said what is a reason of its own; a u witness's reasons stay; a witness that can still change keeps its reasons.
export const witnesses = (saidBy, about) => {
  const names = Object.keys(saidBy);
  if (!names.length) throw new TypeError("witnesses need at least one witness, by name");
  const heard = names.map(n => value(saidBy[n]));
  const every = f => heard.reduce((all, x) => andFace(all, f(x.face)), "1");
  const face = every(f => f) === "1" ? "1" : every(notFace) === "1" ? "0" : u("the witnesses do not agree yet");
  const split = face === "u" && heard.some(x => x.face !== "u");   // u, and someone did answer: say who said what
  const why = [...new Set([...(split ? [names.map((n, i) => `${n} says ${heard[i].face}`).join(", ")] : []),
    ...heard.flatMap(x => x.why)])];
  const by = union(names.map(n => (about === undefined ? n : `${n}: ${about}`)), ...heard.map(x => x.by));
  return said(face, why, by);
};

// Settle a formula by asking: the formula is a function of its questions, given `ask`, and each question goes to every
// settler by name; their answers are one value by witnesses(). A settler that throws, or answers with something that
// is not a value, is heard as u, with what went wrong as the reason, never as an answer. The settlers come from the
// program using U (iDoMath, a person, a sensor): U holds no settler of its own, as it holds no adapter.
export const settle = (formula, settlers) => formula(question => {
  u(question);
  const asked = {};
  for (const [name, settler] of Object.entries(settlers)) {
    try { asked[name] = value(settler(question)); }
    catch (error) { asked[name] = unknown(`${name} did not answer "${question}": ${error.message}`); }
  }
  const one = witnesses(asked, question);
  return one.face === "u" ? said("u", union([question], one.why), one.by) : one;
});

// A formula as JSON, read the same way by why.py: "1" or "0" known, any other string a question left u,
// ["not"|"settled", f], ["and"|"or", f, g], ["witnesses", {name: f, ...}]. verify.mjs gives both ports one list and
// compares what they print, byte for byte.
export const answer = f => typeof f === "string" ? (f === "1" || f === "0" ? known(f) : unknown(f))
  : f[0] === "witnesses" ? witnesses(Object.fromEntries(Object.entries(f[1]).map(([n, g]) => [n, answer(g)])))
  : f[0] === "not" || f[0] === "settled" ? ({ not, settled })[f[0]](answer(f[1]))
  : ({ and, or })[f[0]](answer(f[1]), answer(f[2]));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(JSON.parse(readFileSync(0, "utf8")).map(answer)));
