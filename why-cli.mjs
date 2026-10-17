// Formulas as JSON on stdin, their answers as JSON on stdout: why.js's answer() over each, for a shell or a test.
// verify.mjs runs this and why.py on one list and compares them byte for byte. A pipe may lead with a byte-order
// mark (Windows PowerShell adds one); it is dropped. why.js itself imports only u.js, so it also runs in a browser.
import { readFileSync } from "node:fs";
import { answer } from "./why.js";

console.log(JSON.stringify(JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, "")).map(answer)));
