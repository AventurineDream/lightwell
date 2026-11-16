# Lightwell architecture

## Delivery and components

Lightwell is a static browser app: `index.html` loads `src/app.js`, and `style.css` supplies presentation. There is no bundler, application server, or runtime npm dependency. The UI can request Google Fonts; built-in motif assets are served locally.

- `src/generator.js` turns a seed and panel options into geometry and composed SVG.
- `src/model/schema.js` defines and normalizes the canonical project; `migrations.js` upgrades supported older schemas.
- `src/model/store.js`, `history.js`, and `commands.js` hold normalized state and undoable edits. Continuous UI operations can coalesce into a single history step.
- `src/ui/project-session.js` maps browser controls to the nested project model.
- `src/io/project.js` parses untrusted `.lightwell.json` files and serializes project downloads.
- `src/catalog/` owns motif identities, library versions, and lazy charcoal asset loading.
- `src/render/project-svg.js` renders normalized projects into self-contained SVG and embeds canonical project metadata.

## Data flow

Controls → project commands/history → normalized project → preview and SVG export. Save/Open reads and writes that same canonical model rather than a separate UI-only representation. Imported JSON is inspected, migrated, and normalized before it reaches the live editor.

Charcoal motifs load only when used. Export embeds those assets, so the generated SVG does not depend on the local asset server. The renderer hashes canonical project JSON for stable IDs; an explicit instance namespace separates multiple identical inline exports.

## Invariants and trust boundaries

- The same seed and normalized settings produce deterministic geometry and standalone SVG bytes. Motion uses seeded phase/offsets, not wall-clock export fields.
- Project schema and motif-library versions preserve older artwork. All schema v2 imports choose the legacy library; the ambiguity and manual-copy workaround are documented in the README.
- Project parsing rejects oversized input, excessive nesting/overrides, forbidden prototype keys, unsupported versions, and invalid override fields. Imported files are data, never executable SVG.
- Preview and export share project state; undo/redo must restore that state, not merely the displayed controls.
- There is no project-upload service or analytics. Export and project-file downloads are explicit browser actions.

## Checks and operations

`test/` covers generator, catalog, project I/O/state, history, and SVG contracts. `scripts/browser-integration.mjs` drives the actual UI through Chrome/Chromium. The existing CI workflow runs both, the adopted formatter check, and the lightweight added-comment ownership rule. See the [README](../README.md) for prerequisites and commands.
