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
