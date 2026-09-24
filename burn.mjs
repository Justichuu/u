// Burn the fingerprint off and watch it grow back.
//
// This takes u.js, deletes every comment, renames every function in it to
// junk, and runs what is left. The header that says whose it is does not
// survive. The tape does, because the tape is what the code does.
//
//   node burn.mjs

import { writeFileSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { KNOWN } from "./u.js";

const source = readFileSync(new URL("./u.js", import.meta.url), "utf8");

// Function names are free to change. The faces are not. A "u" inside a string
// is a value the device emits, so renaming that makes a different device with
// a different tape. The call sites move. The alphabet stays.
const junk = { not: "q1", and: "q2", or: "q3", faces: "q4", tape: "q5", KNOWN: "q6" };

// Rename code, never the contents of a string. Splitting on the string
// literals and only touching the even pieces keeps the alphabet intact and
// stops a message like "expected 1, 0 or u" turning into "1, 0 q3 u".
const rename = text =>
  text
    .split(/("(?:[^"\\]|\\.)*")/)
    .map((piece, i) =>
      i % 2
        ? piece
        : piece
            .replace(/\b(not|and|or|faces|tape|KNOWN)\b/g, m => junk[m])
            .replace(/\bu\b(?=\s*[(=])/g, "q0"))
    .join("");

const burned =
  rename(
    source
      .split("\n")
      .filter(line => !line.trim().startsWith("//"))
      .join("\n")
      .replace(/^import .*$/m, "")
      .replace(/^if \(process\.argv\[1\][\s\S]*$/m, "")
      .replace(/\bexport \b/g, "")
  ) + "\nconsole.log(q5());\n";

const scratch = new URL("./burned.tmp.mjs", import.meta.url);
writeFileSync(scratch, burned);

try {
  const got = execFileSync("node", [decodeURIComponent(scratch.pathname).replace(/^\//, "")], { encoding: "utf8" }).trim();
  const left = (burned.match(/chuumind|Justichuu|fingerprint|owner/gi) || []).length;

  console.log("\nthe burned copy, in full\n");
  console.log(burned.trim().split("\n").filter(Boolean).map(l => "  " + l).join("\n"));
  console.log("\n  words naming an owner left in it  ", left);
  console.log("  tape it still prints              ", got);
  console.log("  published tape                    ", KNOWN);
  console.log("  key to look up                    ", "66cce8d50854");
  console.log(got === KNOWN
    ? "\n1  it grew back. the key still resolves at chuumind.com/u\n"
    : "\n0  it did not\n");
  process.exit(got === KNOWN ? 0 : 1);
} finally {
  rmSync(scratch, { force: true });
}
