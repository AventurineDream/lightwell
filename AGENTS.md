# lightwell — Agent Guide

<!-- Owner: Aven. Maintained by: Malachite. Last verified: 2026-11-09 (commands read from package.json/CI, not re-run). -->

## Purpose and sources of truth
Dependency-free, seedable stained-glass generator (browser app, ES modules, no build). Spec of record: `README.md`; contribution rules: `CONTRIBUTING.md`.
Vault note: `10_Projects/<Lifecycle>/lightwell.md` (Aven's vault).

## Setup
```bash
python3 -m http.server 4173   # then open http://localhost:4173; Node 20+ for tests
```

## Commands
| Task | Command |
|---|---|
| Format | none yet (Prettier-only commit planned; many source lines are packed, see Aven Code Standard §5.5) |
| Lint | none |
| Typecheck | none |
| Test (fast) | `npm test` |
| Test (full / slow) | `npm run test:browser` |
| Full gate (run before handoff) | `npm test && npm run test:browser` |

## Definition of done
1. Full gate passes (paste the command + result in the handoff).
2. New or changed behavior has a test.
3. Comments meet the Aven Code Standard (vault `99_System/Standards/Code Standard.md`) for every touched file; stale comments are P2 through 2027-02-09, then P1.
4. User-visible changes are noted in the changelog if the repo has one.
5. Small, focused diff on a feature branch; never commit to `main` unless told to. Formatting-only changes go in their own commit.

## Boundaries
Generation must stay deterministic: the same seed and settings must give byte-identical SVG. Keep zero runtime dependencies and no build step. Do not import arbitrary SVG. Never commit packed/minified source in new files.
License: all rights reserved unless Aven records a license choice for this repo.

## Repository map
src/ app, generator, catalog, model, io, ui modules; test/ `node --test` suites; scripts/browser-integration.mjs browser test; index.html + style.css entry.

## Handoff
Summarize files changed, behavior added, commands run with results, and anything unverified.
