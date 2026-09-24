# Provenance

The record the key `66cce8d50854` opens. It is also published at
[chuumind.com/u](https://chuumind.com/u), so a copy of this repository is never
the only place it exists.

A face on every line. `1` measured and it holds, `0` measured and it does not,
`u` nobody measured it. A credit with no evidence behind it is worth less than
an honest blank, so an unknown contribution stays unknown here and is never
quietly promoted.

| Who | Face | What it did, and how that is known |
|---|---|---|
| **Justichuu** | 1 | The person. Wrote the rules this implements, the licence formulation, and the instruction to publish. His own words, 23 September 2026. |
| OpenAI Codex | 1 | The device protocol in `u.mjs`, `STANDARD.md`, the licence text, the test suite, and the input validation now in all three ports. Observed 23 September 2026. |
| Claude Opus 5 | 1 | The three logic ports, the behavioural tape and key, `burn.mjs`, the verifier, the diagram, and the chuumind.com pages. Observed 23 September 2026. |
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
