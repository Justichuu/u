// The check. Exit 0 all measured and agreeing, 1 a disagreement, 2 nothing
// failed and not everything was looked at. The three-way exit is Codex's and
// it is right: a grey must not leave through the same door as a green.
// Run every port, read the tape each one produces, and prove they
// agree. That agreement is the whole claim: the fingerprint comes out of what
// the device does, not out of anything written next to it.
//
//   node verify.mjs

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { u, not, and, or, tape, KNOWN } from "./u.js";

const KEY = "66cce8d50854";
const cwd = fileURLToPath(new URL('.', import.meta.url));
// Both interpreters are found through one documented override each, so a
// machine that spells them differently is configurable rather than unsupported.
const ports = [
  ["u.js  node", [process.execPath, ["u.js"]]],
  ["u.py  python", [process.env.U_PYTHON || "python", ["u.py"]]],
  ["u.sh  sh", [process.env.U_SHELL || "sh", ["u.sh"]]],
];

let bad = 0, grey = 0;
const say = (face, name, detail) => {
  if (face === "0") bad++;
  if (face === "u") grey++;
  console.log(`  ${face}  ${name}${detail ? "  " + detail : ""}`);
};

console.log("\nthe tape, once per runtime\n");
for (const [name, [cmd, args]] of ports) {
  let got;
  try {
    const out = execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    got = (out.match(/tape\s+(\S+)/) || [])[1];
  } catch (err) {
    // A runtime that is not installed is u, not 0. It was not measured here,
    // and it is counted as not measured rather than quietly skipped. A grey
    // that does not reach the last line is the same lie as a false green.
    if (err.code === 'ENOENT') say("u", name, "runtime not found; provide its path with U_PYTHON or U_SHELL and rerun");
    else say("0", name, `runtime failed: ${err.code || 'exit ' + err.status}`);
    continue;
  }
  say(got === KNOWN ? "1" : "0", name, got);
}

console.log("\nwhat the tape has to be\n");
say(tape() === KNOWN ? "1" : "0", "tape is the published 22 characters", KNOWN);
say(createHash("sha256").update(KNOWN).digest("hex").slice(0, 12) === KEY ? "1" : "0", "key is the hash of the tape", KEY);

console.log("\nthe two rules the tape is watching\n");
let refused = false;
try { u(); } catch { refused = true; }
say(refused ? "1" : "0", "a bare u is refused", "stone 4");
say(or("u", not("u")) === "u" && and("u", not("u")) === "u" ? "1" : "0",
    "all is and isn't all", "or(u, not u) and and(u, not u) are both u");

// The last line never rounds a grey up. "Nothing failed" and "everything was
// looked at" are different results, and a reader who only reads this line is
// entitled to both.
const runtimes = ports.length, measured = runtimes - grey;
const coverage = `${measured} of ${runtimes} runtimes measured` + (grey ? `, ${grey} u` : "");
if (bad) console.log(`\n0  ${bad} failed. ${coverage}\n`);
else if (grey) console.log(`\nu  nothing failed, and not everything was looked at. ${coverage}\n`);
else console.log(`\n1  the listed runtimes agree on this finite table. ${coverage}\n`);
process.exit(bad ? 1 : grey ? 2 : 0);
