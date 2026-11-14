# Lightwell

A dependency-free, seedable stained-glass generator for artists and web designers. Choose a global HSV color family, then click individual glass tiles to override their color and add one of 37 built-in motifs with independent color, opacity, scale, and X/Y position, plus deterministic panel-wide mica shimmer amount, brightness, density, chaotic two-color mixing, and opacity. Global controls can apply a silhouette and transform to all tiles at once. Toggle portrait or landscape, control tessellation down to five pieces, lead width, glass/lead/mica/motif opacity, and choose Ink, Lightning, Straight, Wavy, Branch, or Crackle lead styles, then export the composed SVG.

## Status

**Shipped** (vault lifecycle): v0.1 beta was released; v0.2 remains in development, including versioned project Save/Open, charcoal motifs, text, and deterministic motion.

## Quick start

Python 3 serves the app; Node.js 22+ runs the full test suite. No runtime dependencies need installing.

```sh
git clone https://github.com/AventurineDream/lightwell.git
cd lightwell
bash tools/install_hooks.sh
python3 -m http.server 4173
# open http://localhost:4173
```

Generation and editing run locally. The UI currently loads Google Fonts from Google's CDN, with local font fallbacks when offline. No project data is uploaded. The generator is deterministic: the same seed and settings produce the same geometry and color family. Composed SVG export keeps glass and motif artwork in separate semantic groups inside one self-contained file.

## Commands

| Task | Command |
| --- | --- |
| Development | `python3 -m http.server 4173` |
| Build | None; serve the repository's static files |
| Format | `npm run format` (check: `npm run format:check`) |
| Lint | Not configured |
| Typecheck | Not configured |
| Test (fast) | `npm test` |
| Test (browser) | `npm run test:browser` |
| Full gate | `npm run format:check && npm test && npm run test:browser` |
| Install staged-comment gate | `bash tools/install_hooks.sh` |

The formatter command fetches pinned Prettier through npm; it is not an offline prerequisite for running the app. Browser integration requires Chrome or Chromium; `CHROME_PATH` selects a non-default executable, and local ports 4187 and 9223 must be free. CI retains unit and browser checks and adds only the [incremental comment gate](docs/decisions/0001-incremental-standard-adoption.md).

There is no runtime package dependency, build step, framework, or analytics. The UI font request is the only runtime network dependency; generation itself is local. Tests cover deterministic output, PRNG bounds, Voronoi bounds, HSV conversion, SVG output, and escaping.

## Use on a site

Export the composed SVG, and record the seed and settings with the asset. Inline SVG supports per-piece animation; `<img>` is the simplest static route.

## Security

Lightwell v0.2 uses only its built-in, versioned motif libraries; it does not import arbitrary SVG files. Exported SVG is generated from the app's constrained controls. For public deployments, keep a restrictive Content Security Policy.


## Project files and SVG structure

Save/Open uses validated `.lightwell.json` project files. Loaded geometry, materials, and every per-tile override are normalized before they reach preview or export. The live editor, undo/redo, project save/load, preview, and SVG export all read the same canonical project state.

Composed SVG export includes glass, mica, and motif artwork in stable semantic groups: `background`, `glass`, `mica`, `motifs`, `lead`, `lighting`, and `frame`. Standalone exports are byte-deterministic. Embedders that inline multiple identical exports can request an instance namespace through the renderer API to avoid duplicate document IDs while retaining the same project identity.

## Motif rendering contract

Project schema v3 records a `motifLibrary` alongside the generator version. New work uses `charcoal-v1`; v1 and v2 project files migrate to `legacy-vector-v1`, so opening an older file preserves its vector motifs instead of silently substituting newer artwork. Motif IDs, labels, library revisions, render types, and local asset URLs come from `src/catalog/motif-manifest.js`.

Charcoal PNGs are fetched locally and only when a project uses them. Preview caches those assets, while SVG export embeds data for only the used motifs, keeping exports self-contained without placing the full library in the startup JavaScript. CI runs unit and headless-browser integration tests.

## Schema v2 migration note

Schema v2 predates explicit `motifLibrary` identity. Most v2 files used the legacy vector library, but a brief unreleased development interval could produce v2 files whose visible preview used charcoal assets. Those files are indistinguishable from legacy v2 files using serialized state alone. Migration therefore stays deterministic: every v2 file becomes `legacy-vector-v1`. Lightwell does not guess from motif IDs or timestamps. If a known transient file needs charcoal interpretation, edit a copy after migration by changing `motifLibrary` to `charcoal-v1`, then reopen it; keep the original as a backup. A future explicit upgrade operation can make that manual choice safer.

## Text and motion

Schema v4 adds one panel text object with content, color, opacity, size, X/Y placement, rotation, font family, alignment, and panel clipping. It also adds deterministic `drift-v1` glass motion. Motion offsets and phase are derived from the project seed and tile ID, so the same saved project exports the same animated SVG bytes. Disable motion for a static SVG.

## Layout

- `src/`: browser entry, seeded generator, model/history, project I/O, renderer, UI helpers, and motif catalog/assets.
- `test/`: dependency-free Node.js unit tests.
- `scripts/`: headless browser integration checks.
- `tools/`: committed lightweight development hooks.
- `.github/`: the existing unit/browser CI workflow.
- `docs/`: architecture, documentation index, and adoption decision.
- `index.html` and `style.css`: static entry point and presentation.

## Documentation

Start at the [documentation index](docs/README.md), [architecture](docs/architecture.md), [CHANGELOG](CHANGELOG.md), and [contribution guide](CONTRIBUTING.md).

Project planning lives in Aven's vault: [Lightwell](obsidian://open?vault=Home&file=10_Projects%2FShipped%2FLightwell%2FLightwell.md) (`10_Projects/Shipped/Lightwell/Lightwell.md`).

## License

MIT — see the existing [LICENSE](LICENSE). Contributions, new export adapters, accessibility improvements, and geometry modes are welcome.
