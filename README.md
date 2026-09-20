# Lightwell

**v0.1 beta**

A dependency-free, seedable stained-glass generator for artists and web designers. Choose a global HSV color family, then click individual glass tiles to override their color and add one of 37 built-in motifs with independent color, opacity, scale, and X/Y position, plus deterministic panel-wide mica shimmer amount, brightness, density, chaotic two-color mixing, and opacity. Global controls can apply a silhouette and transform to all tiles at once. Toggle portrait or landscape, control tessellation down to five pieces, lead width, glass/lead/mica/motif opacity, and choose Ink, Lightning, Straight, Wavy, Branch, or Crackle lead styles, then export the composed SVG.

## Run

```sh
python3 -m http.server 4173
# open http://localhost:4173
```

Generation and editing run locally. The UI currently loads Google Fonts from Google's CDN, with local font fallbacks when offline. No project data is uploaded. The generator is deterministic: the same seed and settings produce the same geometry and color family. Exported glass stays separate from the silhouette, so artists retain a clean source and can layer or animate it independently.

## Test

```sh
npm test
```

No package dependencies, build step, framework, or analytics. The UI font request is the only runtime network dependency; generation itself is local. Tests cover deterministic output, PRNG bounds, Voronoi bounds, HSV conversion, SVG output, and escaping.

## Use on a site

Export the composed SVG, and record the seed and settings with the asset. Inline SVG supports per-piece animation; `<img>` is the simplest static route.

## Security

Lightwell v0.1.1 uses only its built-in motif library; it does not import arbitrary SVG files. Exported SVG is generated from the app's constrained controls. For public deployments, keep a restrictive Content Security Policy.

MIT licensed. Contributions, new export adapters, accessibility improvements, and geometry modes are welcome.


## Beta status

Lightwell is in public beta. The current charcoal motif library is versioned so older projects retain their original vector artwork. See [CHANGELOG.md](CHANGELOG.md) for release notes and [CONTRIBUTING.md](CONTRIBUTING.md) to contribute.

## Project files and SVG structure

Save/Open uses validated `.lightwell.json` project files. Loaded geometry, materials, and every per-tile override are normalized before they reach preview or export. The live editor, undo/redo, project save/load, preview, and SVG export all read the same canonical project state.

Composed SVG export includes glass, mica, and motif artwork in stable semantic groups: `background`, `glass`, `mica`, `motifs`, `lead`, `lighting`, and `frame`. Standalone exports are byte-deterministic. Embedders that inline multiple identical exports can request an instance namespace through the renderer API to avoid duplicate document IDs while retaining the same project identity.

## Motif rendering contract

Project schema v3 records a `motifLibrary` alongside the generator version. New work uses `charcoal-v1`; v1 and v2 project files migrate to `legacy-vector-v1`, so opening an older file preserves its vector motifs instead of silently substituting newer artwork. Motif IDs, labels, library revisions, render types, and local asset URLs come from `src/catalog/motif-manifest.js`.

Charcoal PNGs are fetched locally and only when a project uses them. Preview caches those assets, while SVG export embeds data for only the used motifs, keeping exports self-contained without placing the full library in the startup JavaScript. CI runs unit and headless-browser integration tests.
