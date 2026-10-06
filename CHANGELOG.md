# Changelog

Every notable change to this project, newest first, written for the people who use it, not a list of commits.
Format: Keep a Changelog 2.0.0 (keepachangelog.com/en/2.0.0). Versions: Semantic Versioning 2.0.0 (semver.org).
A release moves everything under Unreleased to `## [VERSION] - YYYY-MM-DD`; empty sections are left out.
Each entry carries its tag: [W] witnessed, naming the run that showed it; [R] reasoned; [A] asserted.
Not checked says what was not, and the one thing that would settle it.

## [Unreleased]

## [1.2.1] - 2026-10-06

### Fixed

- [W] The 1.2.0 release manifest hashed `PROVENANCE.md` and `test/logic.test.mjs` with
  Windows line endings, so `checks/verify-sources.mjs` failed on GitHub. Every hash is now
  taken from the committed bytes. No code changed.

## [1.2.0] - 2026-10-06

### Added

- [W] U2-bytes (`u2.js`): three witnesses in four bits, two bits and one u-bit, every
  face built from `u.js`; `test/u2.test.mjs`.
- [W] U5-bytes (`u5.js`): five u-bits hold 3^5 = 243 values in one eight-bit byte; the
  13 byte values above 242 unpack to u; `test/u5.test.mjs`.
- [W] `test/number.test.mjs`: u is one half (not, and, or are 1 - x, min and max).
- [R] `audio.mjs` asks iOS for the playback session before any sound, so the ringer
  switch should no longer mute it; a silent loop keeps older iOS awake. Not run on a
  physical iPhone here; `test/audio.test.mjs` passes in Node, which has no window.
- [W] Package exports `./u2` and `./u5`.
- [W] Retained the device repository's contributor instructions in `AGENTS.md`.

### Changed

- [W] Joined the original core and device histories to `nostalgia` without
  replacing the newer U source. Namespaced history tags retain all original refs
  and release tags; the perennial experiment keeps its own retained branch.
- [W] Reassociated the existing device worktree with U, preserving its working
  files, index and reflog. The other linked worktree stays unchanged.
- [W] `checks/verify-sources.mjs` says what it establishes and what it does not: the
  manifest is generated from the same files, so it proves bytes unchanged, not correctness.
- [W] The release manifest lists `u2.js`, `u5.js` and their tests, and matches README and audio again.

### Removed

- [W] Removed the retired top-level `u-core` and `u-device` checkouts after
  verifying every original Git object in U. The only untracked content removed
  was the generated core burn temporary file; no private state was found.

### Fixed

- [W] Pinned U's prior reflog commits and otherwise unreachable objects with
  Git refs, retaining that local recovery evidence.

### Validation

- [W] Node v26.7.0 on Windows, 6 Oct 2026: `node verify.mjs` agreed across 3 of 3
  runtimes; `node --test` over the six test files, 35 of 35 passed;
  `sha256sum -c SHA256SUMS.txt` matched every listed file.
- [W] All 245 original Git objects are present (2 Oct consolidation). Windows Git sees
  both retained worktrees; application source is unchanged by the consolidation.

### Not checked

- Physical devices, including the iOS sound change on a real iPhone. Settled by
  playing a page that uses `audio.mjs` on an iPhone with the ringer switch off.
