# Lightwell

A dependency-free, seedable stained-glass generator for artists and web designers. Choose any color with the native color wheel, tune hue/saturation/value directly, control tessellation and lead width, and preview built-in silhouette studies or your own sanitized SVG behind translucent glass.

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
