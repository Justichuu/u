# U Device 1

`u-device/1` is the protocol identifier. Human labels are open strings; a name
does not establish a capability. A channel must be explicitly registered with
`send(payload)` and may provide `stop()`.

Payloads and outputs are finite JSON data. An adapter result contains `state`
(`1`, `0` or `U`), a nonempty `evidence` statement and optional `output`. A 1
settles only the named observation. Transport acceptance cannot establish
physical sensation, intent, attention, comprehension or identity.

Receipts contain sequence, name, channel, payload, output, state, evidence,
host wall-clock time, provenance fingerprint, previous hash and their own hash.
Canonical encoding sorts object keys and retains array order. SHA-256 uses
UTF-8 bytes of that JSON. `verifyHistory` checks the supplied chain. It cannot
detect a wholly rewritten chain or prove that an unknown tail was not removed.

The canonical provenance fingerprint is SHA-256 of the protocol identifier and
the contributor record. Visible aliases are separate. Burn modes change only
the local display. A finite deadline uses a monotonic host clock; the estimated
wall-clock return date is not an independent time witness. `none` does nothing;
`restore()` ends a burn. No state is stored after the instance closes.

No adapter is discovered, paired or actuated automatically. The host chooses
which adapters to register. A missing adapter, failed call, unscoped result or
interrupted operation remains U and identifies the next observation needed.

## Audio adapter, 24 September 2026

`createAudioAdapter()` in `audio.mjs` implements `send` and `stop` for the
protocol. Construction produces no output. Use `send` from an explicit user
action. It uses the operating system's default audio output; a connection
description does not discover, select or authenticate hardware. A headset and
an audio-connected transducer share this contract. A proprietary controller
still needs its own adapter.

A tone payload has `kind: "tone"`, `frequencyHz` (80–2000; default 440),
`durationMs` (10–2000 whole; default 70), `count` (1–3 whole; default 1),
`gapMs` (0–1000 whole; default 100), and `gain` (0–0.25; default 0.05).
These are software ranges, not measured physical output or safety ratings.
[W] iDoMath checked `3*2000+(3-1)*1000=8000`: the largest requested envelope
is 8000 ms, excluding browser scheduling and transport latency.

Speech has `kind: "speech"`, nonempty `text` of at most 10000 characters and
optional `language`. Only voices exposing `localService: true` are eligible.
Missing voices or API support remain U. No remote speech service is selected.
A browser's completion event is 1 for completion only. Device type, bone
conduction, hearing and understanding remain separately unmeasured.

Stop cancels scheduled sound and speech, including requests awaiting audio
resume. It cannot retract an already delivered signal. Audio and vibration
can be composed from one user action; equal timing or sensation is not implied.

Sources read: [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext),
[output selection](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/setSinkId).
