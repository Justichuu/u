# Provenance

The record the key `66cce8d50854` opens. It is also published at
[chuumind.com/u](https://chuumind.com/u), so a copy of this repository is never
the only place it exists. Independent unknown witness, 24 September 2026:
that URL returned HTTP 404 on checkout of this commit; matching `u.mjs` was
found at `/assets/u/u.mjs` instead.

A face on every line. `1` measured and it holds, `0` measured and it does not,
`u` nobody measured it. A credit with no evidence behind it is worth less than
an honest blank, so an unknown contribution stays unknown here and is never
quietly promoted.

| Who | Face | What it did, and how that is known |
|---|---|---|
| **Justichuu** | 1 | The person. Wrote the rules this implements, the licence formulation, and the instruction to publish. His own words, 23 September 2026. |
| OpenAI Codex | u | Named in the commit message, `PROVENANCE.md`, and the `u.mjs` contributor record. Sole git author of this tree is Justichuu; no co-author trailer. Independent unknown witness 24 September 2026: not proved from repository bytes alone. |
| Claude Opus 5 | u | Named in the commit message and `PROVENANCE.md`. `u.mjs` already records Claude as U for that module. No co-author trailer. Independent unknown witness 24 September 2026: not proved from repository bytes alone. |
| GitHub Copilot | u | Named in the surrounding work. No contribution to these files was observed. Settled by the owner saying so. |
| ChatGPT | u | Named as a tool in use. Not observed on these files. |
| Cursor | u | Same. |
| Grok | u | Same. |
| deepseek-r1:14b | u | Local, through Ollama. Present on the machine 23 September 2026. Not run for these files. |
| qwen2.5-coder:14b | u | Local, through Ollama. Same. |
| qwen2.5-coder:1.5b-base | u | Local, through Ollama. Same. |
| moondream | u | Local, through Ollama. Same. |
| llama3.1:8b | u | Local, through Ollama. Same. |
| hermes3:8b-llama3.1-q8_0 | u | Local, through Ollama. Same. |
| huihui_ai/qwen3.5-abliterated:35b | u | Local, through Ollama. Same. |
| Unknown contributors and influences | u | Add a name and what settles it. |

## How this repository came to exist twice

Two sessions were given one instruction at the same time and could not see each
other. Codex built a device protocol: registered adapters, hash-chained
receipts, and a fingerprint that is SHA-256 of a declared contributor record,
with a burn that hides and rotates a display alias and returns after a stated
duration. Claude built a logic core: three faces, four functions, three
language ports, and a fingerprint computed from the answer table itself.

Neither was wrong and they solve different halves, which is why this repository
carries both.

- A **declared** fingerprint names people. Delete the declaration from a stolen
  copy and it changes. Witnessed: replacing the contributor record in `u.mjs`
  moves the fingerprint from `feba63e1abb8a00e` to another prefix. Measured on this tree: an empty contributor list yields `5b48ac9fd5466760`.
- A **behavioural** fingerprint cannot name anybody, and cannot be removed from
  a working copy either. Witnessed: `node burn.mjs` deletes every comment and
  renames every function, leaves zero owner words, and the tape is unchanged.

So the behaviour gives an identity nobody can counterfeit or strip, and the
declaration gives the names that identity looks up. That is the whole
mechanism, and it needed both sessions to find it.

## What a tape does not prove

Equal tables do not prove authorship. Codex wrote that line in the first
release and it stands: anybody who implements this device correctly writes the
same twenty two characters, and that is the design working, not a claim on
their work. The tape identifies **the device**. This file identifies **the
people**. Only the second one is a credit, and only a named witness moves a
face up it.

Git history, version tags and release checksums are different kinds of
evidence. None of them alone proves every claim here forever. A past
observation may later become uncertain without erasing the earlier record.


## Independent witness (behavioural)

Unknown independent witness. No prior relationship to the authors. Fresh clone
of `Justichuu/u` at `e5e89be4103f14b017a6b065ca86cdd7df42c466` on 24 September
2026. Machine record: `checks/independent-witness.json`.

| Claim | Face | What was measured |
|---|---|---|
| Ports print tape `01u10u000u0u11110u1uu1` | 1 | `node u.js`, `python3 u.py`, `sh u.sh` |
| `sha256(tape)` starts with `66cce8d50854` | 1 | `printf %s 01u10u000u0u11110u1uu1 \| sha256sum` |
| Stock `node burn.mjs` on Linux Node 22 | 0 | Path strip drops leading `/`; scratch module not found |
| Burn transform with correct path still reprints tape | 1 | Same rename/filter as `burn.mjs` |
| OpenAI Codex / Claude Opus 5 face 1 from bytes alone | u | Sole `git` author is Justichuu; demoted above |


## Independent witness (protocol)

Unknown independent witness. No prior relationship to the authors. Fresh clone
at `e5e89be4103f14b017a6b065ca86cdd7df42c466`. Machine record:
`checks/independent-witness-protocol.json`.

| Claim | Face | What was measured |
|---|---|---|
| Declared fingerprint prefix `feba63e1abb8a00e` | 1 | `createU().fingerprint()` on this checkout |
| Contributor replacement → prefix `d344044605c6093b` | 0 | Not reproduced with empty/altered records tried here |
| Tape key `66cce8d50854` | 1 | sha256 of published tape |
| `chuumind.com/u` publishes this record | 0 | HTTP 404 |
| Same `u.mjs` on site assets | 1 | `/assets/u/u.mjs` hash matches |
| Face-`u` tool rows authored bytes | u | Names in prose only; faces stay `u` |
