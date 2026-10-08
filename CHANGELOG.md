# Changelog

Every notable change to this project, newest first, written for the people who use it, not a list of commits.
Format: Keep a Changelog 2.0.0 (keepachangelog.com/en/2.0.0). Versions: Semantic Versioning 2.0.0 (semver.org).
A release moves everything under Unreleased to `## [VERSION] - YYYY-MM-DD`; empty sections are left out.
Each entry carries its tag: [W] witnessed, naming the run that showed it; [R] reasoned; [A] asserted.
Not checked says what was not, and the one thing that would settle it.

## [Unreleased]

## [1.3.2] - 2026-10-08

### Fixed

- [W] The child-scale readout now says 55%, using the existing number
  formatter instead of exposing floating-point residue. The browser
  regression failed before the fix and checks depths 0, 3 and 6 plus the
  actual offline download. Geometry and logic are unchanged.

## [1.3.1] - 2026-10-08

### Fixed

- [W] The fractal depth slider now has an explicit association with its
  visible label. Previously the nested output received that implicit label
  and the slider had no accessible name. The new browser regression failed
  before the fix. Keyboard depth behavior and the drawing are unchanged.
- Physical assistive technology remains unobserved; the regression checks
  the browser's accessible role/name and native label association.

## [1.3.0] - 2026-10-08

### Added

- [W] Run U's fractal depth control builds a branching tree of 1–127 cycloid
  fish while retaining angle, phase, pace and the original carried state.
  `u/fish-fractal` exports the reusable similarities. Four new tests pass
  (46 total); keyboard depth changes and offline use pass in three browsers.
  The screen identifies the construction as a finite preview.
- [W] `u/fish` carries 0, 1 or a reasoned u through progress, preserves branch
  identity at crossings, and delegates negation to U. The seven cases in
  `test/fish.test.mjs` pass, including a regression for ineffective positive
  advances at large floating-point progress.
- [W] Run U has manual swimming, NOT, crossing inspection and restart, with
  genuine cycloid segments, adjustable angle/phase/pace, dotted tails and two
  labelled unsettled candidates. `checks/fish-browser.mjs`
  passed in Chromium, Firefox and WebKit at 320/980px and through the actual
  offline download. No page errors or HTTP requests were observed.
- [A] The fish is a proposed representation of state transport and negation.
  Defaults are illustrative. [FISH.md](FISH.md) records the account written
  first, the owner's cycloid/asymmetry correction and fresh observations.
- [W] The symmetric reference is a reflection at equal progress. The default
  asymmetric branches meet at different process times; the bounded numerical
  crossing search reports failure if it cannot locate a second intersection.
  Exported `graphFor` expressions produced 640 enclosed cells in iDoMath's
  actual calculator, with no unsettled cells.

### Changed

- [W] The browser builder includes the shared fish source and accepts `--site`
  for an explicit existing-site export or comparison. Existing logic tables,
  their 22-result tape and U2/U5 encodings are unchanged.

### Not checked

- Physical phones, assistive technology use and live deployment. This model
  does not supply geometric AND/OR or establish that logic requires a fish.

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
