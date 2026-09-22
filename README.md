# Lightwell

**v0.2 foundation (in development)**

A dependency-free, seedable stained-glass generator for artists and web designers. Choose a global HSV color family, then click individual glass tiles to override their color and add one of 37 built-in motifs with independent color, opacity, scale, and X/Y position, plus deterministic panel-wide mica shimmer amount, brightness, density, chaotic two-color mixing, and opacity. Global controls can apply a silhouette and transform to all tiles at once. Toggle portrait or landscape, control tessellation down to five pieces, lead width, glass/lead/mica/motif opacity, and choose Ink, Lightning, Straight, Wavy, Branch, or Crackle lead styles, then export the composed SVG.

## Run

```sh
python3 -m http.server 4173
# open http://localhost:4173
```

Generation and editing run locally. The UI currently loads Google Fonts from Google's CDN, with local font fallbacks when offline. No project data is uploaded. The generator is deterministic: the same seed and settings produce the same geometry and color family. Composed SVG export keeps glass and motif artwork in separate semantic groups inside one self-contained file.

## Test

```sh
npm test
```

No package dependencies, build step, framework, or analytics. The UI font request is the only runtime network dependency; generation itself is local. Tests cover deterministic output, PRNG bounds, Voronoi bounds, HSV conversion, SVG output, and escaping.

## Use on a site

Export the composed SVG, and record the seed and settings with the asset. Inline SVG supports per-piece animation; `<img>` is the simplest static route.

## Security

Lightwell v0.2 uses only its built-in, versioned motif libraries; it does not import arbitrary SVG files. Exported SVG is generated from the app's constrained controls. For public deployments, keep a restrictive Content Security Policy.

MIT licensed. Contributions, new export adapters, accessibility improvements, and geometry modes are welcome.


## Development status

Lightwell v0.2 is in active foundation development. The current charcoal motif library is versioned so older projects retain their original vector artwork. See [CHANGELOG.md](CHANGELOG.md) for release notes and [CONTRIBUTING.md](CONTRIBUTING.md) to contribute.

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
