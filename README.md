# Lightwell

A dependency-free, seedable stained-glass generator for artists and web designers. Choose a global HSV color family, then click individual glass tiles to override their color and add a a curated library of 35 motifs silhouette with independent color, opacity, scale, and X/Y position, plus deterministic panel-wide mica shimmer amount, brightness, density, chaotic two-color mixing, and opacity. Global controls can apply a silhouette and transform to all tiles at once. Toggle portrait or landscape, control tessellation down to five pieces, lead width, glass/lead/mica/motif opacity, and choose Ink, Lightning, Straight, Wavy, Branch, or Crackle lead styles, then export the composed SVG.

## Run

```sh
python3 -m http.server 4173
# open http://localhost:4173
```

Everything runs locally. Uploaded silhouettes never leave the browser. The generator is deterministic: the same seed and settings produce the same geometry and color family. Exported glass stays separate from the silhouette, so artists retain a clean source and can layer or animate it independently.

## Test

```sh
npm test
```

No dependencies, build step, framework, analytics, or network service. Tests cover deterministic output, PRNG bounds, Voronoi bounds, HSV conversion, SVG output, and escaping.

## Use on a site

Export the glass SVG, place your silhouette behind it with CSS or an editor, and record the seed/settings with the asset. Inline SVG supports per-piece animation; `<img>` is the simplest static route.

## Security

SVG silhouette imports strip scripts, `foreignObject`, event handlers, and external references before preview. For public deployments, keep a restrictive Content Security Policy too.

MIT licensed. Contributions, new export adapters, accessibility improvements, and geometry modes are welcome.
