# Changelog

Every notable change to this project, newest first, written for the people who use it, not a list of commits.
Format: Keep a Changelog 2.0.0 (keepachangelog.com/en/2.0.0). Versions: Semantic Versioning 2.0.0 (semver.org).
A release moves everything under Unreleased to `## [VERSION] - YYYY-MM-DD`; empty sections are left out.
Each entry carries its tag: [W] witnessed, naming the run that showed it; [R] reasoned; [A] asserted.
Not checked says what was not, and the one thing that would settle it.

## [Unreleased]

### Added

- [W] Retained the device repository's contributor instructions in `AGENTS.md`.

### Changed

- [W] Joined the original core and device histories to `nostalgia` without
  replacing the newer U source. Namespaced history tags retain all original refs
  and release tags; the perennial experiment keeps its own retained branch.
- [W] Reassociated the existing device worktree with U, preserving its working
  files, index and reflog. The other linked worktree stays unchanged.

### Deprecated

### Removed

- [W] Removed the retired top-level `u-core` and `u-device` checkouts after
  verifying every original Git object in U. The only untracked content removed
  was the generated core burn temporary file; no private state was found.

### Fixed

- [W] Pinned U's prior reflog commits and otherwise unreachable objects with
  Git refs, retaining that local recovery evidence.

### Validation

- [W] Node 22.22.1 on WSL: 24 tests passed, all three logic ports agreed,
  the browser build matched and all 28 listed release hashes matched.
  `npm` was unavailable; its two test commands ran directly with Node.
- [W] All 245 original Git objects are present. Windows Git sees both retained
  worktrees; the device worktree's project files, index and reflog match the
  pre-move hashes. Application source is unchanged.

### Security

### Not checked

- Physical devices, the live browser display and remote repositories were not
  exercised for this repository consolidation. No publication was performed.
